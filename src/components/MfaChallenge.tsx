import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { LoaderCircle, Lock, LogOut, Info, Clock, AlertTriangle, ShieldOff } from 'lucide-react';

interface MfaChallengeProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MfaChallenge = ({ onSuccess, onCancel }: MfaChallengeProps) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeFactor, setActiveFactor] = useState<{ id: string, name: string } | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string>('Carregando...');
  const [allFactors, setAllFactors] = useState<any[]>([]);

  const loadFactorData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSessionInfo("Sessão não encontrada.");
        return;
      }

      setSessionInfo(`Usuário: ${session.user.email} | AAL: ${session.user.app_metadata.aal || 'Pendente'}`);

      const { data: factorData, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const totpFactors = factorData?.totp || [];
      setAllFactors(totpFactors);

      const factor = totpFactors.find((f: any) => f.status === 'verified');
      if (factor) {
        setActiveFactor({ id: factor.id, name: factor.friendly_name });
      }
    } catch (err: any) {
      console.error("Erro ao carregar dados MFA:", err);
      setSessionInfo(`Erro: ${err.message}`);
    }
  };

  useEffect(() => {
    loadFactorData();
  }, []);

  const handleForceSignOut = async () => {
    console.log("Ação: Limpeza completa de sessão.");
    localStorage.clear();
    await supabase.auth.signOut();
    onCancel();
    toast.success("Sessão limpa.");
  };

  const handleRescueUnenroll = async () => {
    if (!window.confirm("ATENÇÃO: Isso tentará remover a proteção 2FA da sua conta para que você possa entrar apenas com a senha. Use apenas se estiver bloqueado. Continuar?")) return;

    setIsVerifying(true);
    const toastId = toast.loading("Tentando remover proteção 2FA...");
    console.log("Iniciando Resgate: Tentando desativar todos os fatores...");

    try {
      if (allFactors.length === 0) throw new Error("Nenhum fator encontrado para remover.");

      for (const factor of allFactors) {
        console.log(`Removendo fator: ${factor.id} (${factor.friendly_name})...`);
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (error) {
          console.warn(`Falha ao remover ${factor.id}:`, error.message);
        } else {
          console.log(`Fator ${factor.id} removido com sucesso.`);
        }
      }

      toast.success("Proteção 2FA removida ou ignorada. Tente entrar novamente.", { id: toastId });
      await handleForceSignOut();
    } catch (err: any) {
      console.error("Erro no resgate:", err);
      toast.error(`Falha no resgate: ${err.message}`, { id: toastId });
      setIsVerifying(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6 || !activeFactor) return;

    setIsVerifying(true);
    const codeToVerify = code.trim();
    const toastId = toast.loading(`Validando no Supabase...`);

    console.log("--- TENTATIVA DE VERIFICAÇÃO ---", {
      factor: activeFactor.name,
      id: activeFactor.id,
      code: codeToVerify,
      timestamp: new Date().toISOString()
    });

    const timeout = setTimeout(() => {
      if (isVerifying) {
        setIsVerifying(false);
        toast.error('Timeout de rede (40s). Verifique sua conexão.', { id: toastId });
      }
    }, 40000);

    try {
      // 1. Desafio
      const challengeResponse = await supabase.auth.mfa.challenge({ factorId: activeFactor.id });
      if (challengeResponse.error) throw challengeResponse.error;
      console.log("Desafio OK:", challengeResponse.data.id);

      // 2. Verificação
      const verifyResult = await supabase.auth.mfa.verify({
        factorId: activeFactor.id,
        challengeId: challengeResponse.data.id,
        code: codeToVerify,
      });

      if (verifyResult.error) throw verifyResult.error;

      console.log("Verificação OK!");
      clearTimeout(timeout);
      toast.success('Logado com sucesso!', { id: toastId });

      await (supabase.auth.refreshSession as any)();
      onSuccess();

    } catch (error: any) {
      clearTimeout(timeout);
      console.error('ERRO VERIFY:', error);

      let errorMsg = error.message || 'Erro na verificação.';
      if (errorMsg.includes('Invalid TOTP')) {
        errorMsg = 'Código inválido. Verifique se o nome no seu App é exatamente igual ao mostrado abaixo.';
      }

      toast.error(errorMsg, { id: toastId });
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Autenticação 2FA</h2>
        <div className="mt-2 space-y-1">
          <p className="text-[10px] text-gray-400 font-mono flex items-center justify-center">
            <Info className="w-3 h-3 mr-1" /> {sessionInfo}
          </p>
          {activeFactor && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-[10px] text-blue-400 uppercase font-bold text-center mb-1">Use este registro no seu App:</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 font-bold text-center">
                {activeFactor.name}
              </p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, ''))}
          maxLength={6}
          disabled={isVerifying || !activeFactor}
          required
          className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center text-4xl font-mono tracking-widest bg-gray-50 dark:bg-gray-700 dark:text-white focus:border-blue-500 outline-none transition-all"
          placeholder="000000"
          inputMode="numeric"
          autoFocus
        />

        <button
          type="submit"
          disabled={isVerifying || code.length !== 6 || !activeFactor}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center transition-all shadow-md active:scale-95"
        >
          {isVerifying ? <LoaderCircle className="w-6 h-6 animate-spin" /> : 'Entrar no Dashboard'}
        </button>

        <div className="flex flex-col space-y-3 pt-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isVerifying}
            className="text-xs text-center text-gray-400 hover:text-gray-600 font-medium"
          >
            Voltar para o Login
          </button>

          <div className="flex justify-between items-center px-1">
            <button
              type="button"
              onClick={handleForceSignOut}
              className="flex items-center text-[10px] text-gray-400 hover:text-red-500 font-medium transition-colors"
            >
              <LogOut className="w-3 h-3 mr-1" /> Limpar Sessão
            </button>

            <button
              type="button"
              onClick={handleRescueUnenroll}
              className="flex items-center text-[10px] text-red-500 hover:text-red-700 font-bold transition-all bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded"
            >
              <ShieldOff className="w-3 h-3 mr-1" /> Emergência: Desativar 2FA
            </button>
          </div>
        </div>
      </form>

      {isVerifying && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded text-[10px] text-yellow-700 dark:text-yellow-500 flex items-start">
          <AlertTriangle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
          Se houver erro de Timeout em 40s, tente o botão de Emergência ao lado para remover o 2FA.
        </div>
      )}
    </div>
  );
};

export default MfaChallenge;