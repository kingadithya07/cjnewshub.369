import React, { useState, useEffect, useRef } from 'react';
import { useNews } from '../context/NewsContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, UserCheck, ShieldCheck, KeyRound, ArrowLeft, Shield, Smartphone, Loader2 } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const [loginType, setLoginType] = useState<UserRole>('publisher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Security / Pending State
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  
  // Recovery State
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'code'>('email');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login, requestAccess, checkRequestStatus, initiateRecovery, completeRecovery, users } = useNews();
  const navigate = useNavigate();
  const pollIntervalRef = useRef<any>(null);

  // Check if any admin exists in the system
  const adminExists = users.some(u => u.role === 'admin');

  // Poll for Approval status if waiting
  useEffect(() => {
      if (pendingRequestId) {
          pollIntervalRef.current = setInterval(async () => {
              const status = await checkRequestStatus(pendingRequestId);
              if (status === 'approved') {
                  clearInterval(pollIntervalRef.current!);
                  setPendingRequestId(null);
                  setLoading(true);
                  // Retry actual login
                  const user = await login(email, password, loginType);
                  if (user) {
                      navigate(user.role === 'admin' || user.role === 'publisher' ? '/admin' : '/');
                  }
              } else if (status === 'rejected') {
                  clearInterval(pollIntervalRef.current!);
                  setPendingRequestId(null);
                  setError("Access Denied by User.");
                  setLoading(false);
              }
          }, 2000);
      }
      return () => {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
  }, [pendingRequestId, email, password, loginType, login, checkRequestStatus, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
        // Step 1: Check device verification first
        const accessResult = await requestAccess(email, password, 'login');
        
        if (!accessResult.success) {
            // Need approval
            if (accessResult.requestId) {
                setPendingRequestId(accessResult.requestId);
                setLoading(false); 
                return; // Stop here, wait for poll
            } else {
                setError(accessResult.message);
                setLoading(false);
                return;
            }
        }

        // Step 2: Proceed with standard login
        const user = await login(email, password, loginType);
        if (user) {
            if (user.role === 'admin' || user.role === 'publisher') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            setError(`Invalid credentials.`);
        }
    } catch (err: any) {
        setError(err.message || 'Login failed.');
    } finally {
        if (!pendingRequestId) setLoading(false);
    }
  };

  const handleRecoveryStart = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      
      const result = await initiateRecovery(recoveryEmail);

      if (result.success) {
          if (result.code) {
              alert(result.message);
              setRecoveryStep('code');
          } else {
              setError("Unexpected error: No code generated.");
          }
      } else {
          // If access denied due to device, showing error is correct
          setError(result.message);
      }
      setLoading(false);
  };

  const handleRecoveryComplete = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (newPassword.length < 6) {
          setError('New password must be at least 6 characters.');
          return;
      }

      setLoading(true);
      const result = await completeRecovery(recoveryEmail, verificationCode, newPassword);
      
      if (result.success) {
          alert('Password updated successfully! You can now login.');
          setIsRecovering(false);
          setRecoveryStep('email');
          setRecoveryEmail('');
          setVerificationCode('');
          setNewPassword('');
          setEmail(recoveryEmail); 
      } else {
          setError(result.message);
      }
      setLoading(false);
  };

  // --- RENDER WAITING SCREEN ---
  if (pendingRequestId) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-paper">
            <div className="max-w-md w-full bg-white shadow-xl p-8 rounded-lg border-t-4 border-yellow-500 text-center animate-pulse">
                <div className="mx-auto w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6">
                    <Smartphone size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">New Device Detected</h2>
                <p className="text-gray-600 text-sm mb-6">
                    For your security, please approve this login request on one of your already logged-in devices.
                </p>
                <div className="flex items-center justify-center gap-2 text-gold-dark font-bold text-xs uppercase tracking-widest">
                    <Loader2 size={16} className="animate-spin" /> Waiting for approval...
                </div>
                <button 
                    onClick={() => {
                        setPendingRequestId(null);
                        setError('');
                    }}
                    className="mt-8 text-gray-400 hover:text-gray-600 text-xs font-bold underline"
                >
                    Cancel Request
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-md w-full bg-white shadow-2xl border-t-4 border-gold relative overflow-hidden transition-all duration-300">
        
        {!isRecovering && (
            <div className="flex w-full border-b border-gray-200">
            <button 
                onClick={() => { setLoginType('publisher'); setError(''); }}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2
                ${loginType === 'publisher' ? 'bg-white text-ink border-b-2 border-gold' : 'bg-gray-50 text-gray-400 hover:text-ink'}`}
            >
                <UserCheck size={16} /> Publisher
            </button>
            <button 
                onClick={() => { setLoginType('admin'); setError(''); }}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2
                ${loginType === 'admin' ? 'bg-white text-ink border-b-2 border-ink' : 'bg-gray-50 text-gray-400 hover:text-ink'}`}
            >
                <ShieldCheck size={16} /> Admin
            </button>
            </div>
        )}

        <div className="p-10">
          
          {isRecovering ? (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="h-12 w-12 bg-red-100 text-red-600 flex items-center justify-center rounded-full mb-4">
                    <KeyRound size={24} />
                </div>
                <h2 className="text-center text-2xl font-serif font-bold text-gray-900">
                    {recoveryStep === 'code' ? 'Verify & Reset' : 'Reset Password'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 mb-6">
                    {recoveryStep === 'code'
                        ? 'Enter the code shown in the alert and your new password.' 
                        : 'Enter your email address to generate a verification code.'}
                </p>

                {error && (
                    <div className="w-full text-red-600 text-sm text-center font-bold bg-red-50 p-3 border border-red-100 rounded mb-4">
                        {error}
                    </div>
                )}

                {recoveryStep === 'email' ? (
                     <form className="w-full space-y-6" onSubmit={handleRecoveryStart}>
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                                placeholder="Enter your email"
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-widest text-white bg-ink hover:bg-gray-800 transition-colors disabled:opacity-70"
                        >
                            {loading ? 'Verifying Device...' : 'Get Verification Code'}
                        </button>
                     </form>
                ) : (
                    <form className="w-full space-y-6" onSubmit={handleRecoveryComplete}>
                        <div>
                            <input
                                type="text"
                                required
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                                placeholder="Verification Code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-widest text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-70"
                        >
                            {loading ? 'Updating...' : 'Set New Password'}
                        </button>
                    </form>
                )}

                <button 
                    onClick={() => { setIsRecovering(false); setRecoveryStep('email'); }}
                    className="mt-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-ink transition-colors"
                >
                    <ArrowLeft size={14} /> Back to Login
                </button>
            </div>
          ) : (
            <>
                <div className="flex flex-col items-center">
                    <div className={`h-12 w-12 text-white flex items-center justify-center rounded-full mb-4 transition-colors duration-300 ${loginType === 'admin' ? 'bg-ink' : 'bg-gold'}`}>
                    <Lock size={24} />
                    </div>
                    <h2 className="text-center text-3xl font-serif font-bold text-gray-900">
                    {loginType === 'admin' ? 'Administrative Access' : 'Publisher Portal'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                    {loginType === 'admin' ? 'Secure Login for Staff' : 'Manage your articles and content'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                    
                    {/* Setup Link for Master Admin if none exists */}
                    {loginType === 'admin' && !adminExists && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r shadow-sm">
                            <div className="flex items-center gap-3">
                                <Shield className="text-red-500" size={24} />
                                <div>
                                    <p className="text-sm font-bold text-red-900">System Not Initialized</p>
                                    <p className="text-xs text-red-700 mb-2">No admin account found.</p>
                                    <Link 
                                        to="/setup-admin" 
                                        className="inline-block bg-red-600 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded hover:bg-red-700 transition-colors tracking-wider"
                                    >
                                        Create Master Admin
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <input
                        type="email"
                        required
                        className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:z-10 sm:text-sm
                            ${loginType === 'admin' ? 'focus:ring-ink focus:border-ink' : 'focus:ring-gold focus:border-gold'}`}
                        placeholder={`${loginType === 'admin' ? 'Admin' : 'Publisher'} Email`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                        type="password"
                        required
                        className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:z-10 sm:text-sm
                            ${loginType === 'admin' ? 'focus:ring-ink focus:border-ink' : 'focus:ring-gold focus:border-gold'}`}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    </div>

                    
                    <div className="flex justify-end">
                        <button 
                            type="button" 
                            onClick={() => setIsRecovering(true)}
                            className="text-xs font-bold text-gray-500 hover:text-ink hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    {error && (
                    <div className="text-red-600 text-sm text-center font-bold bg-red-50 p-3 border border-red-100 rounded">
                        {error}
                    </div>
                    )}

                    <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors shadow-lg
                        ${loginType === 'admin' 
                            ? 'bg-ink hover:bg-gray-800 focus:ring-ink' 
                            : 'bg-gold hover:bg-gold-dark focus:ring-gold'} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Verifying...' : `Sign In as ${loginType}`}
                    </button>
                    </div>
                    
                    {loginType === 'publisher' && (
                    <div className="text-center mt-4 pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Not a registered publisher? </span>
                        <Link to="/publisher/register" className="text-sm font-bold text-gold-dark hover:underline">Apply here</Link>
                    </div>
                    )}
                </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};