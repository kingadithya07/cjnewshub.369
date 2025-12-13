
import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { AdSpace } from '../components/AdSpace';
import { AdSize, Classified } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { PlayCircle, Clock, ArrowRight, Eye, ChevronLeft, ChevronRight, Zap, Briefcase, TrendingUp, User } from 'lucide-react';
import { WeatherWidget } from '../components/WeatherWidget';

export const Home: React.FC = () => {
  const { articles, currentUser, classifieds, users, showAds } = useNews();
  const navigate = useNavigate();
  
  // State for Slider
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filter for published articles only
  const publishedArticles = articles.filter(a => a.status === 'published');
  
  // --- LOGIC UPDATE: Intelligent Content Distribution ---
  // 1. Slider: Prioritize 'isFeatured'. If none, take the absolute latest one.
  let sliderArticles = publishedArticles.filter(a => a.isFeatured).slice(0, 5);
  if (sliderArticles.length === 0 && publishedArticles.length > 0) {
      sliderArticles = [publishedArticles[0]];
  }

  // 2. Latest News: Everything else that isn't in the slider.
  // We sort by date descending just in case, though usually 'articles' is already sorted.
  const remainingArticles = publishedArticles.filter(a => !sliderArticles.find(s => s.id === a.id));
  
  // Desktop "Latest News" Grid (Take up to 6)
  const latestNewsArticles = remainingArticles.slice(0, 6);
  
  // Mobile "Latest" List (Take up to 10)
  const mobileLatestArticles = remainingArticles.slice(0, 10);
  
  // Trending Articles (Sorted by views, exclude slider if possible to show variety, or just top views)
  // Showing top views regardless of placement is standard for "Trending".
  const trendingArticles = [...publishedArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const handleArticleClick = (id: string) => {
    // Note: incrementArticleView is handled inside ArticleDetail page on mount
    navigate(`/article/${id}`);
  };

  // Helper to get author details
  const getAuthor = (id?: string, name?: string) => {
      return users.find(u => (id && u.id === id) || (name && u.name === name));
  };

  // Auto-slide functionality
  useEffect(() => {
    if (sliderArticles.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderArticles.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [sliderArticles.length]);

  const nextSlide = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentSlide((prev) => (prev + 1) % sliderArticles.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentSlide((prev) => (prev - 1 + sliderArticles.length) % sliderArticles.length);
  };

  // Classifieds Preview (Latest 4)
  const latestClassifieds = [...classifieds].sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);

  return (
    <div className="w-full min-h-screen pb-12 bg-[#FAF9F6]">
        {/* Top Leaderboard Ad */}
        {showAds && (
            <div className="max-w-7xl mx-auto px-4 border-b border-gray-200 pb-8">
                <AdSpace size={AdSize.LEADERBOARD} className="w-full" label="Premium Global Partners" />
            </div>
        )}

        <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content Area (Left 8 cols) */}
            <div className="lg:col-span-8 space-y-10">
                
                {/* --- HERO SLIDER --- */}
                {sliderArticles.length > 0 ? (
                    <div className="relative group w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden shadow-xl bg-gray-900">
                        {sliderArticles.map((article, index) => {
                            const author = getAuthor(article.authorId, article.author);
                            return (
                                <div 
                                    key={article.id}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                                    onClick={() => handleArticleClick(article.id)}
                                >
                                    {article.videoUrl ? (
                                        <div className="w-full h-full relative">
                                            <video 
                                                src={article.videoUrl} 
                                                poster={article.imageUrl}
                                                className="w-full h-full object-cover opacity-85"
                                                muted
                                                loop
                                                autoPlay={index === currentSlide}
                                                onMouseOver={(e) => e.currentTarget.play().catch(() => {})}
                                                onMouseOut={(e) => e.currentTarget.pause()}
                                            />
                                            <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full pointer-events-none">
                                                <PlayCircle className="text-white w-6 h-6" />
                                            </div>
                                        </div>
                                    ) : (
                                        <img 
                                            src={article.imageUrl} 
                                            alt={article.title} 
                                            className={`w-full h-full object-cover opacity-90 transition-transform duration-[6000ms] ease-linear ${index === currentSlide ? 'scale-105' : 'scale-100'}`}
                                        />
                                    )}
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                                    {/* Text Content */}
                                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white z-20">
                                        <div className="flex items-center gap-3 mb-3 animate-in slide-in-from-bottom-2 duration-500 delay-100">
                                            <span className="bg-gold text-ink text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                                {article.category}
                                            </span>
                                            <span className="text-xs text-gray-300 font-bold flex items-center gap-1">
                                                <Clock size={12} /> {article.date}
                                            </span>
                                        </div>
                                        
                                        {/* Increased line-height for Telugu script support */}
                                        <h2 className="text-2xl md:text-4xl font-serif font-black leading-normal mb-3 drop-shadow-md line-clamp-2 animate-in slide-in-from-bottom-2 duration-500 delay-200">
                                            {article.title}
                                        </h2>
                                        
                                        {/* Author Info - Now visible on mobile too */}
                                        <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-500 delay-300">
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 bg-gray-800">
                                                {author?.profilePicUrl ? (
                                                    <img src={author.profilePicUrl} alt={article.author} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={16}/></div>
                                                )}
                                            </div>
                                            <p className="text-gray-200 font-serif text-sm font-bold line-clamp-1 max-w-2xl">
                                                By {article.author}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Navigation Controls */}
                        {sliderArticles.length > 1 && (
                            <>
                                <button 
                                    onClick={prevSlide}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-gold hover:text-ink text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button 
                                    onClick={nextSlide}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-gold hover:text-ink text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronRight size={24} />
                                </button>
                                
                                <div className="absolute bottom-6 right-6 z-30 flex gap-2">
                                    {sliderArticles.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-gold w-8' : 'bg-white/50 w-2 hover:bg-white'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500">
                        <p>No published articles available.</p>
                    </div>
                )}


                {/* In-Feed Ad Space */}
                {showAds && (
                    <div className="border-t border-b border-gray-200 py-8 my-8 bg-gray-50/50 rounded-lg">
                        <AdSpace size={AdSize.LEADERBOARD} label="Sponsored Content" />
                    </div>
                )}

                {/* --- MOBILE ONLY: Split View (Latest & Trending Side-by-Side) --- */}
                <div className="grid grid-cols-2 gap-3 md:hidden border-b-4 border-double border-gray-200 pb-8 mb-8">
                    {/* Left Col: Latest */}
                    <div className="border-r border-gray-200 pr-2">
                         <h3 className="font-sans font-bold text-xs uppercase mb-4 text-gold-dark flex items-center gap-1 border-b border-gold pb-1">
                            <Zap size={14} fill="currentColor"/> Latest
                         </h3>
                         <div className="space-y-6">
                            {mobileLatestArticles.length === 0 && <p className="text-[10px] text-gray-400 italic">No new stories.</p>}
                            {mobileLatestArticles.map(a => {
                                const author = getAuthor(a.authorId, a.author);
                                return (
                                    <div key={a.id} onClick={() => handleArticleClick(a.id)} className="cursor-pointer group">
                                        <div className="aspect-[4/3] bg-gray-100 mb-2 rounded overflow-hidden shadow-sm relative">
                                            <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                                                <span className="text-[8px] font-bold text-white uppercase tracking-wider">{a.category}</span>
                                            </div>
                                        </div>
                                        {/* Title */}
                                        <h4 className="font-serif font-bold text-xs leading-normal line-clamp-3 text-ink group-hover:text-gold-dark transition-colors mb-1">{a.title}</h4>
                                        {/* Author & Date - Mobile */}
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-200 border border-gray-100 shrink-0">
                                                {author?.profilePicUrl ? (
                                                    <img src={author.profilePicUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={8}/></div>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-500 truncate">{a.author}</span>
                                        </div>
                                    </div>
                                );
                            })}
                         </div>
                    </div>

                    {/* Right Col: Trending */}
                    <div className="pl-2">
                         <h3 className="font-sans font-bold text-xs uppercase mb-4 text-ink flex items-center gap-1 border-b border-gray-300 pb-1">
                            <TrendingUp size={14}/> Trending
                         </h3>
                         <ul className="space-y-4">
                            {trendingArticles.slice(0, 6).map((a, i) => (
                                <li key={a.id} onClick={() => handleArticleClick(a.id)} className="group border-b border-gray-100 pb-3 last:border-0 cursor-pointer">
                                    <div className="flex gap-2 items-start">
                                        <span className="text-xl font-serif font-black text-gray-200 leading-none mt-[-2px]">{i+1}</span>
                                        <div>
                                            <h4 className="font-serif font-bold text-xs leading-normal text-gray-700 line-clamp-3 group-hover:text-gold mb-1">{a.title}</h4>
                                            <span className="text-[9px] text-gray-400 font-bold bg-gray-50 px-1 rounded flex items-center w-fit gap-1">
                                                <Eye size={8} /> {a.views}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>

                {/* --- DESKTOP ONLY: Latest News Grid --- */}
                <div className="hidden md:block">
                    <h3 className="text-xl font-serif font-bold border-b-2 border-gray-200 pb-2 mb-6 flex items-center gap-2">
                        <Zap className="text-gold-dark" size={20} fill="currentColor" /> Latest News
                    </h3>
                    
                    {latestNewsArticles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {latestNewsArticles.map(article => {
                                const author = getAuthor(article.authorId, article.author);
                                return (
                                    <article key={article.id} className="flex flex-col gap-3 group">
                                        <div 
                                            className="overflow-hidden w-full aspect-video bg-gray-100 relative cursor-pointer rounded-lg shadow-sm"
                                            onClick={() => handleArticleClick(article.id)}
                                        >
                                            {article.videoUrl && (
                                                <div className="absolute top-2 right-2 z-10 bg-black/50 p-1 rounded-full">
                                                    <PlayCircle className="text-white w-4 h-4" />
                                                </div>
                                            )}
                                            <img 
                                                src={article.imageUrl} 
                                                alt={article.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-bold text-gold-dark uppercase tracking-widest truncate max-w-[50%]">{article.category}</span>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{article.date}</span>
                                            </div>
                                            <h3 
                                                className="text-lg font-serif font-bold text-ink leading-normal group-hover:text-gold-dark transition-colors cursor-pointer line-clamp-2"
                                                onClick={() => handleArticleClick(article.id)}
                                            >
                                                {article.title}
                                            </h3>
                                            
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 border border-gray-100 shrink-0">
                                                    {author?.profilePicUrl ? (
                                                        <img src={author.profilePicUrl} alt={article.author} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={12}/></div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-gray-600 uppercase">{article.author}</span>
                                            </div>

                                            <p className="text-sm text-gray-500 font-sans line-clamp-3 leading-relaxed mt-1">
                                                {article.excerpt}
                                            </p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400 italic bg-gray-50 rounded border border-dashed border-gray-200">
                            Check back soon for more stories.
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar (Right 4 cols) */}
            <div className="lg:col-span-4 border-l border-gray-200 pl-0 lg:pl-8 space-y-10">
                
                {/* --- WEATHER WIDGET (Sidebar Variant) --- */}
                <div className="hidden lg:block">
                    <WeatherWidget variant="sidebar" />
                </div>

                {/* --- DESKTOP ONLY: Trending / List Widget --- */}
                <div className="hidden md:block">
                    <h4 className="text-lg font-sans font-bold border-b-2 border-ink pb-2 mb-6 uppercase tracking-wider text-xs flex items-center gap-2">
                        <TrendingUp size={16} /> Trending Now
                    </h4>
                    <ul className="space-y-6">
                        {trendingArticles.map((article, i) => (
                            <li key={article.id} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-4 last:border-0" onClick={() => handleArticleClick(article.id)}>
                                <span className="text-3xl font-serif font-black text-gray-200 group-hover:text-gold transition-colors">0{i + 1}</span>
                                <div>
                                    <h5 className="font-serif font-bold text-base leading-normal group-hover:text-gray-600 transition-colors line-clamp-2">
                                        {article.title}
                                    </h5>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold">{article.date}</span>
                                        <span className="text-[10px] text-gold-dark font-bold flex items-center gap-1"><Eye size={10}/> {article.views || 0}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sidebar Ad */}
                {showAds && (
                    <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg flex justify-center">
                         <AdSpace size={AdSize.RECTANGLE} label="Sponsored" />
                    </div>
                )}

                {/* Subscribe Widget - Hidden if logged in */}
                {!currentUser && (
                    <div className="bg-ink text-white p-8 text-center rounded-lg shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gold/20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="font-serif font-bold text-2xl mb-2 relative z-10">Morning Briefing</h4>
                        <p className="text-gray-400 text-xs mb-6 font-sans relative z-10">Start your day with the stories you need to know. Delivered at 7 AM.</p>
                        <button 
                            onClick={() => navigate('/subscribe')}
                            className="w-full bg-gold hover:bg-white hover:text-ink text-ink font-bold text-xs uppercase py-3 tracking-widest transition-colors rounded shadow-md relative z-10"
                        >
                            Sign Up Free
                        </button>
                    </div>
                )}
                
                 {/* Skyscraper Ad */}
                 {showAds && (
                     <div className="hidden md:flex justify-center sticky top-24 pt-4">
                         <AdSpace size={AdSize.SKYSCRAPER} />
                    </div>
                 )}

            </div>
        </div>

        {/* --- CLASSIFIEDS PREVIEW SECTION --- */}
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t-4 border-double border-gray-300">
             <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                 <div className="flex items-center gap-4">
                     <div className="bg-gold/20 p-2 rounded-full">
                        <Briefcase size={24} className="text-gold-dark" />
                     </div>
                     <h3 className="text-2xl font-serif font-black text-ink uppercase tracking-tight">Classifieds</h3>
                 </div>
                 
                 <Link to="/classifieds" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-dark hover:text-ink transition-colors group">
                     View All Listings <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                 </Link>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {latestClassifieds.map(ad => (
                     <div key={ad.id} className="bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-sm group flex flex-col">
                         {/* Thumbnail Preview */}
                         {ad.imageUrl ? (
                            <div className="w-full h-24 mb-3 overflow-hidden rounded-sm bg-gray-100 relative">
                                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <span className="absolute top-1 right-1 bg-ink text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded opacity-90">{ad.category}</span>
                            </div>
                         ) : (
                             <div className="mb-2">
                                 <span className="bg-gray-100 text-gray-600 text-[10px] font-bold uppercase px-2 py-1 rounded">{ad.category}</span>
                             </div>
                         )}

                         <h5 className="font-serif font-bold text-sm text-ink group-hover:text-gold-dark transition-colors line-clamp-1 leading-normal">{ad.title}</h5>
                         <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed flex-1">{ad.description}</p>
                         <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1 text-[10px] text-gray-400 font-bold">
                             <span className="text-ink truncate">{ad.contact}</span>
                             {ad.location && <span className="truncate">{ad.location}</span>}
                         </div>
                     </div>
                 ))}
             </div>
             
             {latestClassifieds.length === 0 && (
                 <div className="text-center py-8 text-gray-400 bg-gray-50 rounded border border-dashed border-gray-300">
                     No classifieds posted yet.
                 </div>
             )}
        </div>
    </div>
  );
};
