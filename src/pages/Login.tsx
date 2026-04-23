import React, { useState } from 'react';
import { apiClient } from '../lib/apiClient';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [show2fa, setShow2fa] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    try {
      const data: any = await apiClient.auth.login({ email, password });

      if (data.mfa_required) {
        setShow2fa(true);
        toast.success('Senha correta! Digite o código 2FA.');
      } else {
        toast.success('Entrando no Dashboard...');
        onLoginSuccess(data.user);
      }
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      toast.error(error.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    try {
      const data: any = await apiClient.auth.verify2FA(mfaCode);
      toast.success('Login concluído!');
      onLoginSuccess(data.user);
    } catch (error: any) {
      console.error('Erro na verificação 2FA:', error);
      toast.error(error.message || 'Código 2FA inválido.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4 transition-colors duration-500">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 transform transition-all">
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="mb-6 hover:scale-110 transition-transform duration-300">
            <img src={logo} alt="MAC-IP Tecnologia Logo" className="mx-auto h-20 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {show2fa ? 'Segurança 2FA' : 'Acesso ao Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {show2fa
              ? 'Digite o código de 6 dígitos que aparece no seu aplicativo autenticador.'
              : 'Digite suas credenciais (MySQL) para entrar.'}
          </p>
        </div>

        {!show2fa ? (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 border-2 border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border-2 border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center transition-all active:scale-95"
            >
              {isSigningIn ? (
                <>
                  <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify2fa} className="space-y-6">
            <div className="group text-center">
              <label htmlFor="mfaCode" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Código Autenticador</label>
              <input
                id="mfaCode"
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000 000"
                maxLength={6}
                required
                autoFocus
                className="w-full px-4 py-4 border-2 border-blue-100 dark:border-blue-900 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 text-3xl font-mono text-center tracking-[0.5em] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-blue-200"
              />
            </div>
            <button
              type="submit"
              disabled={isSigningIn || mfaCode.length !== 6}
              className="w-full px-4 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 disabled:opacity-50 flex items-center justify-center transition-all active:scale-95"
            >
              {isSigningIn ? (
                <>
                  <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Validar Código
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShow2fa(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
            >
              Voltar para senha
            </button>
          </form>
        )}
      </div>
      <footer className="mt-8 text-gray-400 dark:text-gray-500 text-sm font-medium">
        Developed by Tony Gomes &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Login;