
import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, logout } = useNews();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
        const user = await login(email, password);
        
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                // Log them out immediately if they are not admin
                logout();
                setError('Access Denied: You do not have administrator privileges.');
            }
        } else {
          setError('Invalid admin credentials.');
        }
    } catch (err: any) {
        setError(err.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-2xl border-t-8 border-ink">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-ink text-white flex items-center justify-center rounded-full mb-4">
             <ShieldCheck size={32} />
          </div>
          <h2 className="text-center text-3xl font-serif font-bold text-ink">
            Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-sans tracking-wide uppercase">
            Authorized Personnel Only
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-ink focus:border-ink focus:z-10 sm:text-sm"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-ink focus:border-ink focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-xs text-center font-bold bg-red-50 p-2 border border-red-200">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-widest text-white bg-ink hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink transition-colors"
            >
              Enter Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
