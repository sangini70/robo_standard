import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithPassword } from '../../services/adminService';
import { signInWithGoogle, auth } from '../../firebase';
import { Shield, ArrowRight, KeyRound } from 'lucide-react';

// 관리자 UID 목록 (서비스 레이어와 동기화)
const ADMIN_UIDS = [
  "O8T7pyXh5Mfd5wx7fqJdkfqTzw1"
];

export default function AdminLogin() {
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = await signInWithGoogle();
      if (ADMIN_UIDS.includes(user.uid)) {
        setStep(2);
      } else {
        setError('Unauthorized email. This account is not in the admin allowlist.');
        await auth.signOut();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await loginWithPassword(password);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin password. Access denied.');
      }
    } catch (err: any) {
      setError('An error occurred during validation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 shadow-2xl transition-transform hover:scale-105">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">
            {step === 1 ? 'Restricted Access' : 'Security Level 2'}
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">
            {step === 1 
              ? 'Identity verification required to proceed.' 
              : 'Knowledge-based secondary authentication.'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
          {step === 1 ? (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-gray-950 font-black py-5 rounded-2xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? (
                'VERIFYING...'
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
                  STEP 1: GOOGLE AUTH
                </>
              )}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Admin Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secondary key"
                    autoFocus
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-primary transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-primary text-white font-black py-5 rounded-2xl hover:bg-white hover:text-gray-950 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {loading ? 'VALIDATING...' : 'FINALIZE LOGIN'}
                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors"
                disabled={loading}
              >
                Back to Identity Verification
              </button>
            </form>
          )}
          
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold p-4 rounded-xl text-center uppercase tracking-widest leading-relaxed">
              {error}
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center gap-2">
           <div className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">ADMIN-CORE SECURE-LAYER</div>
           <div className="text-[9px] text-gray-800">2-Factor Authentication Enabled</div>
        </div>
      </div>
    </div>
  );
}
