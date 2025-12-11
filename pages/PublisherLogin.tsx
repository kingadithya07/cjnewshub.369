import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserCheck } from 'lucide-react';

export const PublisherLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useNews();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = login(email, password);
    
    if (user) {
        // Both admins and publishers can theoretically access, but this is the "Publisher" entry point
        // We allow both for convenience, or you could restrict to role === 'publisher'
        navigate('/admin'); 
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-xl border-t-4 border-gold">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 bg-gold text-white flex items-center justify-center rounded-full mb-4">
             <UserCheck size={24} />
          </div>
          <h2 className="text-center text-3xl font-serif font-bold text-gray-900">
            Publisher Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Login to manage your articles and content
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm"
                placeholder="Publisher Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center font-bold">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-widest text-white bg-gold-dark hover:bg-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-colors"
            >
              Sign In
            </button>
          </div>
          
          <div className="text-center mt-6 border-t border-gray-100 pt-6">
              <span className="text-sm text-gray-600">Don't have a publisher account? </span>
              <Link to="/publisher/register" className="text-sm font-bold text-ink hover:underline">Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};