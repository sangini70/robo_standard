import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, KeyRound, Save, Loader2 } from 'lucide-react';
import { changeAdminPassword } from '../../services/adminService';

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await changeAdminPassword(currentPassword, newPassword);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-2xl">
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">System Settings</h1>
        <p className="text-gray-500 font-medium">Core configuration and security management layer.</p>
      </header>

      {/* Auth Status Card */}
      <div className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 font-black text-gray-900 text-sm flex items-center gap-2 uppercase tracking-[0.2em]">
          <Shield size={20} className="text-primary" /> Authentication Schema
        </div>
        <div className="p-10 space-y-8">
          <div className="flex items-center gap-5 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
            <CheckCircle className="text-emerald-500" size={28} />
            <div>
              <div className="text-sm font-black text-gray-900 uppercase tracking-tight">Active: 2-Step Verification</div>
              <p className="text-xs text-gray-500 font-medium mt-1">Google OAuth 2.0 Identity + Knowledge-based Security Key.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Authorized Principal</div>
            <div className="flex items-center gap-3 p-5 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-sm text-gray-900">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              luganopizza@gmail.com
            </div>
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 font-black text-gray-900 text-sm flex items-center gap-2 uppercase tracking-[0.2em]">
          <KeyRound size={20} className="text-primary" /> Knowledge Key Management
        </div>
        <form onSubmit={handlePasswordChange} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Security Password</label>
            <input 
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Security Password</label>
              <input 
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
              <input 
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-xs font-black uppercase text-center tracking-widest ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 group shadow-xl hover:shadow-primary/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'PROCESSING...' : 'UPDATE SECURITY KEY'}
          </button>
        </form>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-[32px] p-8 flex gap-5">
        <AlertCircle className="text-primary flex-shrink-0" size={28} />
        <div>
          <div className="text-sm font-black text-gray-900 uppercase tracking-tight mb-2">Security Policy Notice</div>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            비밀번호 변경 즉시 모든 신규 로그인 세션에 적용됩니다. 현재 인스턴스는 'luganopizza@gmail.com' 이메일 소유자에게만 2단계 인증 진입을 허용하고 있으므로 안심하고 사용하셔도 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
