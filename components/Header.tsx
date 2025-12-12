
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, X, Lock, Newspaper, User as UserIcon, LogOut, LogIn, Flame, Clock, Briefcase, Home, Sparkles } from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { WeatherWidget } from './WeatherWidget';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout, articles, categories } = useNews();
  const location = useLocation();
  const navigate = useNavigate();

  // Time and Date State
  const [dateTimeInfo, setDateTimeInfo] = useState({
      date: '',
      time: '',
      location: 'LOCAL'
  });

  useEffect(() => {
    const timeZones = [
        { label: 'LOCAL', zone: undefined },
        { label: 'LONDON', zone: 'Europe/London' },
        { label: 'NEW YORK', zone: 'America/New_York' },
        { label: 'TOKYO', zone: 'Asia/Tokyo' },
        { label: 'DUBAI', zone: 'Asia/Dubai' },
        { label: 'SYDNEY', zone: 'Australia/Sydney' }
    ];
    let zoneIndex = 0;

    const updateDisplay = () => {
        const now = new Date();
        
        // Date Format: DD Month YYYY (e.g., 24 November 2025)
        const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        
        // Time logic
        const currentZone = timeZones[zoneIndex];
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        if (currentZone.zone) {
            timeOptions.timeZone = currentZone.zone;
        }
        
        const timeStr = now.toLocaleTimeString('en-US', timeOptions);

        setDateTimeInfo({
            date: dateStr,
            time: timeStr,
            location: currentZone.label
        });
    };

    updateDisplay(); // Initial call

    const secondInterval = setInterval(() => {
        updateDisplay();
    }, 1000);

    const zoneInterval = setInterval(() => {
        zoneIndex = (zoneIndex + 1) % timeZones.length;
    }, 4000); // Change city every 4 seconds

    return () => {
        clearInterval(secondInterval);
        clearInterval(zoneInterval);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  // Get latest 5 published headlines for the ticker
  const breakingArticles = articles
    .filter(a => a.status === 'published')
    .slice(0, 5);

  return (
    <header className="flex flex-col w-full border-b-4 border-double border-gray-200 bg-paper sticky top-0 z-50 shadow-md">
      {/* Top Bar */}
      <div className="w-full bg-paper py-1 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-[10px] md:text-xs font-sans tracking-wider text-gray-500 uppercase">
          <div className="flex items-center gap-4">
            <span className="font-bold text-ink">{dateTimeInfo.date}</span>
            <span className="hidden sm:flex items-center gap-1 text-gold-dark font-bold min-w-[160px] border-l border-gray-300 pl-4 ml-2">
                <Clock size={12} />
                <span className="w-full">{dateTimeInfo.location}: {dateTimeInfo.time}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            
            {currentUser ? (
                 <div className="flex items-center gap-3 border-l border-gray-300 pl-4 ml-2">
                    <span className="text-ink font-bold hidden sm:inline">
                        {currentUser.role === 'admin' ? 'Admin: ' : currentUser.role === 'publisher' ? 'Publisher: ' : 'Subscriber: '} 
                        {currentUser.name}
                    </span>
                    {currentUser.role !== 'subscriber' && (
                        <Link to="/admin" className="hover:text-gold-dark text-ink font-bold flex items-center gap-1">
                            <Lock size={10} /> Dashboard
                        </Link>
                    )}
                    <button onClick={handleLogout} className="hover:text-red-600 transition-colors flex items-center gap-1">
                        <LogOut size={10} /> Logout
                    </button>
                 </div>
            ) : (
                <div className="flex items-center gap-4 pl-4 ml-2">
                    <Link to="/login" className="hover:text-ink transition-colors font-black flex items-center gap-2 text-base text-gold-dark">
                        <LogIn size={18} /> LOGIN
                    </Link>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding - Compact Version */}
      <div className="w-full py-2 md:py-4 flex flex-col items-center justify-center relative px-2">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:block w-64">
             <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search Archives..." 
                    className="w-full bg-transparent border-b border-gray-300 py-1 pl-0 pr-8 text-xs focus:outline-none focus:border-gold font-serif italic"
                />
                <Search className="absolute right-0 top-1 text-gray-400 w-3 h-3" />
             </div>
        </div>

        {/* Right Side Tools: Weather + Subscribe */}
        <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <div className="md:hidden">
                <WeatherWidget />
            </div>
            
            {!currentUser && (
                <Link to="/subscribe" className="hidden md:flex flex-col items-center justify-center bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded shadow-md transform hover:scale-105 transition-all">
                    <span className="text-[8px] uppercase font-bold tracking-widest leading-none">Subscribe</span>
                    <span className="text-sm font-black leading-none">NOW</span>
                </Link>
            )}
        </div>

        <div className="flex items-center gap-4">
            <Link to="/" className="text-center group">
              <h1 className="text-3xl md:text-5xl font-serif font-black text-ink tracking-tight group-hover:scale-[1.02] transition-transform duration-300">
                CJ<span className="text-gold-dark">NEWS</span>HUB
              </h1>
            </Link>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-1">
             <div className="h-[1px] w-8 bg-gray-400"></div>
             <p className="text-[8px] md:text-[10px] font-sans tracking-[0.2em] text-gray-500 uppercase">Est. 2025 &bull; Global Edition</p>
             <div className="h-[1px] w-8 bg-gray-400"></div>
        </div>
      </div>

      {/* Navigation & Ticker */}
      <div className="bg-paper/95 backdrop-blur-sm border-t border-b border-gray-200 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-14 md:h-10 flex items-center">
            
            {/* Mobile Nav Bar - Icons distributed */}
            <div className="md:hidden flex w-full justify-between items-center text-gray-500 px-1">
                <Link to="/" className={`flex flex-col items-center gap-0.5 px-2 ${isActive('/') ? 'text-ink font-bold' : 'hover:text-ink'}`}>
                    <Home size={18} strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span className="text-[8px] uppercase tracking-widest">Home</span>
                </Link>
                
                <Link to="/epaper" className={`flex flex-col items-center gap-0.5 px-2 ${isActive('/epaper') ? 'text-gold-dark font-bold' : 'hover:text-gold-dark'}`}>
                    <Newspaper size={18} strokeWidth={isActive('/epaper') ? 2.5 : 2} />
                    <span className="text-[8px] uppercase tracking-widest">Paper</span>
                </Link>

                <Link to="/classifieds" className={`flex flex-col items-center gap-0.5 px-2 ${isActive('/classifieds') ? 'text-ink font-bold' : 'hover:text-ink'}`}>
                    <Briefcase size={18} strokeWidth={isActive('/classifieds') ? 2.5 : 2} />
                    <span className="text-[8px] uppercase tracking-widest">Ads</span>
                </Link>

                {currentUser ? (
                    <Link to="/admin" className={`flex flex-col items-center gap-0.5 px-2 ${isActive('/admin') ? 'text-ink font-bold' : 'hover:text-ink'}`}>
                        <UserIcon size={18} strokeWidth={isActive('/admin') ? 2.5 : 2} />
                        <span className="text-[8px] uppercase tracking-widest">Profile</span>
                    </Link>
                ) : (
                    <Link to="/subscribe" className={`flex flex-col items-center gap-0.5 px-2 ${isActive('/subscribe') ? 'text-red-600 font-bold' : 'text-red-700 hover:text-red-800'}`}>
                        <Sparkles size={18} strokeWidth={isActive('/subscribe') ? 2.5 : 2} />
                        <span className="text-[8px] uppercase tracking-widest">Subscribe</span>
                    </Link>
                )}

                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`flex flex-col items-center gap-0.5 px-2 ${isMenuOpen ? 'text-ink font-bold' : 'hover:text-ink'}`}
                >
                    {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    <span className="text-[8px] uppercase tracking-widest">More</span>
                </button>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex w-full justify-center items-center gap-8 font-serif font-bold text-xs tracking-wide text-gray-600">
                <Link to="/" className={`hover:text-gold transition-colors ${isActive('/') ? 'text-ink border-b-2 border-gold pb-1' : ''}`}>HOME</Link>
                
                <Link to="/epaper" className={`flex items-center gap-2 hover:text-gold transition-colors ${isActive('/epaper') ? 'text-gold-dark' : 'text-gold'}`}>
                    <Newspaper size={14} />
                    E-PAPER
                </Link>

                <Link to="/classifieds" className={`flex items-center gap-2 hover:text-gold transition-colors ${isActive('/classifieds') ? 'text-ink border-b-2 border-gold pb-1' : ''}`}>
                    <Briefcase size={14} />
                    CLASSIFIEDS
                </Link>

                {categories.slice(0, 5).map(cat => (
                    <Link 
                        key={cat} 
                        to={`/category/${cat.toLowerCase()}`}
                        className="hover:text-ink transition-colors uppercase"
                    >
                        {cat}
                    </Link>
                ))}
            </nav>
          </div>
        </div>

        {/* Breaking News Ticker */}
        {breakingArticles.length > 0 && (
             <div className="w-full bg-ink text-white border-t border-gray-800 flex items-center h-8 overflow-hidden relative">
                 <div className="bg-gold text-ink text-[10px] font-black uppercase tracking-widest px-4 h-full flex items-center gap-2 z-10 shrink-0 shadow-lg">
                     <Flame size={12} fill="currentColor" /> BREAKING
                 </div>
                 <div className="whitespace-nowrap overflow-hidden flex-1 relative h-full flex items-center bg-ink">
                     <div className="animate-ticker absolute whitespace-nowrap text-xs font-bold font-sans tracking-wider text-gray-200 flex items-center">
                         {breakingArticles.map((article, idx) => (
                             <span key={article.id} className="inline-flex items-center">
                                 <span className="text-gold-dark mx-3">+++</span>
                                 <Link 
                                    to={`/article/${article.id}`} 
                                    className="inline-flex items-center hover:text-white hover:underline decoration-gold decoration-2 underline-offset-2 transition-colors cursor-pointer"
                                 >
                                    <span className="text-gold mr-2 uppercase text-[10px] bg-white/10 px-2 py-0.5 rounded-sm">{article.category}</span>
                                    <span>{article.title}</span>
                                 </Link>
                             </span>
                         ))}
                     </div>
                 </div>
             </div>
        )}

        {/* Mobile Nav Dropdown - Adjusted to show categories mostly */}
        {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-paper px-4 py-4 space-y-4 animate-in slide-in-from-top-2">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest border-b border-gray-200 pb-1 mb-2">Sections</p>
                {categories.map(cat => (
                    <Link key={cat} to={`/category/${cat.toLowerCase()}`} className="block font-sans text-sm text-gray-700 font-bold uppercase" onClick={() => setIsMenuOpen(false)}>{cat}</Link>
                ))}
                
                {!currentUser && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                         <Link to="/login" className="block w-full text-center border border-gray-300 py-3 font-bold uppercase text-xs tracking-widest text-gray-600 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Member Login</Link>
                    </div>
                )}

                {currentUser && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <button onClick={handleLogout} className="block w-full text-left font-sans text-sm text-red-600 font-bold uppercase">Logout</button>
                    </div>
                )}
            </div>
        )}
      </div>
    </header>
  );
};
