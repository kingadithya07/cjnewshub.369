
import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Lock } from 'lucide-react';

export const AdminSetup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setupMasterAdmin, users } = useNews();
  const navigate = useNavigate();

  // Check if setup is already done
  const adminExists = users.some(u => u.role === 'admin');

  if (adminExists) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
              <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center border-t-4 border-green-600">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                      <CheckCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">System Configured</h2>
                  <p className="text-gray-600 mb-6">
                      The Master Admin account has already been set up. For security reasons, this page is now locked.
                  </p>
                  <button 
                      onClick={() => navigate('/login')}
                      className="bg-ink text-white px-6 py-3 rounded font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors w-full"
                  >
                      Go to Login
                  </button>
              </div>
          </div>
      );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
    }

    setLoading(true);

    try {
        const success = await setupMasterAdmin(name, email, password);
        if (success) {
            navigate('/admin');
        } else {
            setError("Failed to create admin. System might already be initialized.");
        }
    } catch (err) {
        setError("An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-2xl rounded-lg border-t-8 border-gold">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-gold text-white flex items-center justify-center rounded-full mb-4 shadow-lg">
             <Shield size={32} />
          </div>
          <h2 className="text-center text-3xl font-serif font-bold text-gray-900">
            System Initialization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100 w-full">
            <Lock size={12} className="inline mr-1" />
            <strong>Secure Setup:</strong> Create the Master Administrator account. This form will vanish once completed.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                placeholder="e.g. Chief Editor"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Admin Email</label>
              <input
                type="email"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                placeholder="admin@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Create Password</label>
              <input
                type="password"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded focus:outline-none focus:ring-gold focus:border-gold sm:text-sm"
                placeholder="******"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center font-bold bg-red-50 p-3 rounded border border-red-100">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold uppercase tracking-widest text-white bg-ink hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-colors shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Initializing System...' : 'Create Master Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
