
import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, User, Mail, Lock, BookOpen } from 'lucide-react';

export const Subscribe: React.FC = () => {
    const { register, login, subscriptionSettings } = useNews();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'register' | 'login'>('register');
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'register') {
                if (password.length < 6) {
                    setError("Password must be at least 6 characters.");
                    setLoading(false);
                    return;
                }
                const result = await register(name, email, password, 'subscriber');
                if (result.success) {
                    const user = await login(email, password, 'subscriber');
                    if (user) {
                        navigate('/');
                    } else {
                        setMode('login'); 
                    }
                } else {
                    setError(result.message || "Registration failed.");
                }
            } else {
                // Login Mode
                const user = await login(email, password, 'subscriber');
                if (user) {
                    navigate('/');
                } else {
                    setError("Invalid credentials.");
                }
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!subscriptionSettings.showPaymentButton) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-paper">
                <div className="max-w-md w-full bg-white p-10 shadow-2xl border-t-4 border-ink relative">
                    <div className="text-center mb-8">
                         <div className="mx-auto h-12 w-12 bg-ink text-white flex items-center justify-center rounded-full mb-4">
                            <BookOpen size={24} />
                         </div>
                         <h2 className="text-3xl font-serif font-bold text-ink">
                            {mode === 'register' ? 'Join CJ News Hub' : 'Welcome Back'}
                         </h2>
                         <p className="mt-2 text-sm text-gray-600">
                             {mode === 'register' ? 'Create a free account to read, save, and engage with our global community.' : 'Login to access your personalized content and clippings.'}
                         </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-ink"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-ink"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-ink"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-red-600 text-xs font-bold bg-red-50 p-2 rounded">{error}</p>}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-ink text-white font-bold uppercase tracking-widest py-4 hover:bg-gold hover:text-ink transition-colors mt-4 shadow-lg ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? 'Processing...' : (mode === 'register' ? 'Create Free Account' : 'Secure Login')}
                        </button>
                    </form>
                    
                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center">
                        <button 
                             onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}
                             className="text-sm font-bold text-gray-500 hover:text-ink hover:underline"
                        >
                            {mode === 'register' ? 'Already have an account? Login' : 'Need an account? Register Free'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper py-12 px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl overflow-hidden rounded-lg">
                
                {/* Left Side: Pitch */}
                <div className="bg-ink text-white p-8 md:p-12 flex flex-col justify-between">
                    <div>
                        <h2 className="text-4xl font-serif font-bold mb-4">Unlimited Access.<br/><span className="text-gold">Zero Compromise.</span></h2>
                        
                        <p className="text-gray-400 mb-8 font-serif leading-relaxed">
                            Support independent journalism and unlock exclusive features designed for the avid reader.
                        </p>
                        
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3">
                                <CheckCircle className="text-gold shrink-0" size={20} />
                                <span className="text-sm font-bold uppercase tracking-wider">Save E-Paper Clippings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="text-gold shrink-0" size={20} />
                                <span className="text-sm font-bold uppercase tracking-wider">Ad-Free Experience</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="text-gold shrink-0" size={20} />
                                <span className="text-sm font-bold uppercase tracking-wider">Morning Briefing Email</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <CheckCircle className="text-gold shrink-0" size={20} />
                                <span className="text-sm font-bold uppercase tracking-wider">Comment on Articles</span>
                            </li>
                        </ul>
                    </div>

                    {/* Payment Banner */}
                    <div className="bg-white/10 p-6 rounded border border-white/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                        
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <span className="text-xs uppercase font-bold text-gray-400">Monthly Plan</span>
                            <span className="text-2xl font-black text-white">{subscriptionSettings.monthlyPrice}<span className="text-sm font-normal text-gray-400">/mo</span></span>
                        </div>
                        <a 
                            href={subscriptionSettings.paymentLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-white hover:text-ink text-ink font-black uppercase py-3 rounded transition-colors tracking-widest relative z-10"
                        >
                            <CreditCard size={18} /> Pay & Subscribe
                        </a>
                        <p className="text-[10px] text-gray-500 text-center mt-2 relative z-10">Secure payment via external provider.</p>
                    </div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex justify-end mb-8">
                        <div className="inline-flex bg-gray-100 p-1 rounded">
                            <button 
                                onClick={() => { setMode('login'); setError(''); }}
                                className={`px-4 py-2 text-xs font-bold uppercase rounded transition-colors ${mode === 'login' ? 'bg-white shadow text-ink' : 'text-gray-500'}`}
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => { setMode('register'); setError(''); }}
                                className={`px-4 py-2 text-xs font-bold uppercase rounded transition-colors ${mode === 'register' ? 'bg-white shadow text-ink' : 'text-gray-500'}`}
                            >
                                Register
                            </button>
                        </div>
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-ink mb-2">
                        {mode === 'register' ? 'Create Account' : 'Welcome Back'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-8">
                        {mode === 'register' ? 'Join our community to start saving clippings.' : 'Sign in to access your saved content.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-gold"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-gold"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-gold"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-red-600 text-xs font-bold bg-red-50 p-2 rounded">{error}</p>}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-ink text-white font-bold uppercase tracking-widest py-4 hover:bg-gold hover:text-ink transition-colors mt-4 ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? 'Processing...' : (mode === 'register' ? 'Continue to Payment' : 'Access Account')}
                        </button>
                    </form>
                    
                    {mode === 'register' && (
                         <p className="text-[10px] text-gray-400 mt-4 text-center">
                            By creating an account, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
