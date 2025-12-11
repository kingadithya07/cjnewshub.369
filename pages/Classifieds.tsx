
import React, { useState, useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import { Briefcase, MapPin, Search, Filter, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdSpace } from '../components/AdSpace';
import { AdSize } from '../types';

export const Classifieds: React.FC = () => {
    const { classifieds } = useNews();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ['All', ...Array.from(new Set(classifieds.map(c => c.category)))];

    const filteredClassifieds = useMemo(() => {
        return classifieds.filter(ad => {
            const matchesCategory = selectedCategory === 'All' || ad.category === selectedCategory;
            const matchesSearch = 
                ad.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ad.location && ad.location.toLowerCase().includes(searchTerm.toLowerCase()));
            
            return matchesCategory && matchesSearch;
        }).sort((a, b) => b.timestamp - a.timestamp);
    }, [classifieds, selectedCategory, searchTerm]);

    return (
        <div className="min-h-screen bg-paper pb-12">
            
            {/* Header Banner */}
            <div className="bg-ink text-white py-12 px-4 border-b-4 border-gold">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-gold/20 rounded-full mb-4">
                        <Briefcase size={32} className="text-gold" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Classifieds Market</h1>
                    <p className="text-gray-400 font-sans max-w-2xl mx-auto text-sm md:text-base">
                        Your trusted source for Jobs, Real Estate, Services, and more. Connect directly with advertisers in our community.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-4 z-10">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search keywords, locations..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-gold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <Filter size={18} className="text-gold-dark shrink-0" />
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
                                    ${selectedCategory === cat 
                                        ? 'bg-ink text-gold shadow-md' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Listings */}
                    <div className="lg:col-span-9">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredClassifieds.length > 0 ? (
                                filteredClassifieds.map(ad => (
                                    <div key={ad.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow group flex flex-col h-full">
                                        
                                        {/* Image Header (Optional) */}
                                        {ad.imageUrl && (
                                            <div className="h-48 overflow-hidden bg-gray-100 relative">
                                                <img 
                                                    src={ad.imageUrl} 
                                                    alt={ad.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                />
                                                <span className="absolute top-2 right-2 bg-ink text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
                                                    {ad.category}
                                                </span>
                                            </div>
                                        )}

                                        <div className="p-5 flex flex-col flex-1">
                                            {/* Text Only Category Badge */}
                                            {!ad.imageUrl && (
                                                <div className="mb-3">
                                                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold uppercase px-2 py-1 rounded border border-gray-200">
                                                        {ad.category}
                                                    </span>
                                                </div>
                                            )}

                                            <h3 className="text-lg font-serif font-bold text-ink mb-2 group-hover:text-gold-dark transition-colors">
                                                {ad.title}
                                            </h3>
                                            
                                            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                                                {ad.description}
                                            </p>

                                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                                    <Phone size={14} className="text-gold" />
                                                    <span className="text-ink">{ad.contact}</span>
                                                </div>
                                                
                                                {ad.location && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <MapPin size={14} />
                                                        <span>{ad.location}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-2">
                                                    <Calendar size={12} />
                                                    <span>Posted {new Date(ad.timestamp).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center bg-white rounded border border-dashed border-gray-300">
                                    <Search className="mx-auto text-gray-300 mb-4" size={48} />
                                    <h3 className="text-xl font-bold text-gray-500">No results found</h3>
                                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search term.</p>
                                    <button 
                                        onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
                                        className="mt-4 text-gold-dark font-bold underline hover:text-ink"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Ad Space */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                            <h4 className="font-serif font-bold text-xl mb-2">Post an Ad</h4>
                            <p className="text-sm text-gray-500 mb-4">Reach thousands of daily readers by posting in our Classifieds section.</p>
                            <Link 
                                to="/contact" 
                                className="block w-full bg-gold text-white font-bold py-3 uppercase text-xs tracking-widest hover:bg-ink transition-colors rounded"
                            >
                                Contact Sales
                            </Link>
                        </div>

                        <div className="flex justify-center">
                            <AdSpace size={AdSize.SKYSCRAPER} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
