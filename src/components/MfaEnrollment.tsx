import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import toast from 'react-hot-toast';
import { LoaderCircle, QrCode, CheckCircle, X, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface MfaEnrollmentProps {
  user: User;
  onClose: () => void;
}

const MfaEnrollment = ({ user, onClose }: MfaEnrollmentProps) => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCodeImg, setQrCodeImg] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const check2FAStatus = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.auth.checkSession();
      if (response.authenticated) {
        // No PHP, retornamos se o 2FA está ativo ou não
        // Mas o checkSession padrão pode não ter essa info. 
        // Vamos assumir que se o usuário chegou aqui, podemos tentar obter o status via um GET no enroll ou manter um estado local.
        // Para simplificar, vamos confiar na resposta do setup2FA se ele já está ativo.
      }
    } catch (error: any) {
      console.error('Erro ao verificar status 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    check2FAStatus();
  }, []);

  const handleDisable = async () => {
    if (!window.confirm('Tem certeza que deseja remover o 2FA desta conta?')) return;

    setIsProcessing(true);
    try {
      await apiClient.auth.disable2FA();
      toast.success('2FA desativado!');
      setQrCodeImg(null);
      setIs2FAEnabled(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover 2FA.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnroll = async () => {
    setIsProcessing(true);
    setVerificationCode('');

    try {
      const response = await apiClient.auth.setup2FA();
      setQrCodeImg(response.qr_code_url);
      toast.success('Novo QR Code gerado!');
    } catch (error: any) {
      console.error("Erro no Enroll:", error);
      toast.error(error.message || 'Erro ao gerar 2FA.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    const codeToVerify = verificationCode.trim();

    try {
      await apiClient.auth.confirm2FA(codeToVerify);
      toast.success('2FA ativado com sucesso!');
      setQrCodeImg(null);
      setIs2FAEnabled(true);
      setVerificationCode('');
    } catch (error: any) {
      console.error("Erro na verificação:", error);
      toast.error(error.message || 'Código inválido.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Segurança 2FA (MySQL)</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-10"><LoaderCircle className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : is2FAEnabled ? (
            <div className="text-center space-y-6">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">2FA Ativado</h3>
                <p className="text-gray-500 mt-1">Sua conta está protegida.</p>
              </div>
              <button
                onClick={handleDisable}
                disabled={isProcessing}
                className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Desativar Proteção 2FA
              </button>
            </div>
          ) : qrCodeImg ? (
            <form onSubmit={handleVerifyEnrollment} className="space-y-6 text-center">
              <div className="bg-white p-2 inline-block rounded-lg shadow-md border hover:scale-105 transition-transform">
                <img src={qrCodeImg} alt="QR Code MFA" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                1. Escaneie o código acima no seu app.<br />
                2. Digite o código de 6 dígitos gerado.
              </p>
              <input
                type="text"
                value={verificationCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="w-full py-3 border-2 border-blue-100 rounded-lg text-center text-3xl font-mono tracking-widest bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 outline-none"
                placeholder="000000"
                inputMode="numeric"
                autoFocus
              />
              <button
                type="submit"
                disabled={isProcessing || verificationCode.length !== 6}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {isProcessing ? 'Verificando...' : 'Confirmar e Ativar'}
              </button>
              <button
                type="button"
                onClick={() => { setQrCodeImg(null); }}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto"
              >
                <RefreshCw className="w-4 h-4 mr-1" /> Reiniciar Processo
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <QrCode className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ativar 2FA</h3>
                <p className="text-gray-500 mt-1">Aumente a segurança da sua conta MySQL.</p>
              </div>
              <button
                onClick={handleEnroll}
                disabled={isProcessing}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                {isProcessing ? <LoaderCircle className="w-5 h-5 animate-spin mr-2" /> : <QrCode className="w-5 h-5 mr-2" />}
                Configurar Autenticador
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MfaEnrollment;