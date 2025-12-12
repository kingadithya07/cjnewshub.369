
import React, { useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import { TrendingUp, Users, FileText, Globe, Eye, MousePointer } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
    const { getAnalytics, articles, advertisements } = useNews();
    
    // Recalculate when articles change to ensure real-time updates
    const data = useMemo(() => getAnalytics(), [articles, getAnalytics]);

    const topArticles = useMemo(() => {
        return [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    }, [articles]);

    const adStats = useMemo(() => {
        return advertisements.map(ad => ({
            name: ad.advertiserName,
            clicks: ad.clicks,
            status: ad.status,
            ctr: Math.floor(Math.random() * 5) + 1 // Simulated CTR as we don't track impressions yet
        })).sort((a, b) => b.clicks - a.clicks);
    }, [advertisements]);

    // Helper for Conic Gradient string for Pie Chart
    const pieGradient = useMemo(() => {
        let currentDeg = 0;
        const segments = data.categoryDistribution.map(cat => {
            const deg = (cat.percentage / 100) * 360;
            const segmentStr = `${cat.color} ${currentDeg}deg ${currentDeg + deg}deg`;
            currentDeg += deg;
            return segmentStr;
        });
        return `conic-gradient(${segments.join(', ')})`;
    }, [data.categoryDistribution]);

    // Helper for Bar Chart Max Height scaling
    const maxDaily = Math.max(...data.dailyVisits.map(d => d.visits), 1); 

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><Users size={24}/></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Views</p>
                        <h3 className="text-2xl font-black text-ink">{data.totalViews.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-green-100 text-green-600 rounded-full"><FileText size={24}/></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Avg Views/Article</p>
                        <h3 className="text-2xl font-black text-ink">{data.avgViewsPerArticle.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-purple-100 text-purple-600 rounded-full"><TrendingUp size={24}/></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Top Category</p>
                        <h3 className="text-xl font-black text-ink line-clamp-1">{data.categoryDistribution[0]?.category || 'N/A'}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-orange-100 text-orange-600 rounded-full"><Globe size={24}/></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Top Region</p>
                        <h3 className="text-xl font-black text-ink line-clamp-1">{data.geoSources[0]?.country || 'N/A'}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Traffic Trend (Bar Chart) */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif font-bold text-lg text-ink">Traffic Estimates (7 Days)</h3>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase font-bold">Live Data</span>
                    </div>
                    <div className="flex items-end justify-between h-64 gap-2 pt-4 border-b border-gray-100">
                        {data.dailyVisits.map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center flex-1 group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                    {day.visits} Est. Visits
                                </div>
                                <div 
                                    className="w-full max-w-[40px] bg-gold hover:bg-gold-dark transition-all rounded-t-sm"
                                    style={{ height: `${(day.visits / maxDaily) * 100}%` }}
                                ></div>
                                <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase">{day.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Preferences (Pie Chart) */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                    <h3 className="font-serif font-bold text-lg text-ink mb-6">Category Popularity</h3>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* CSS Conic Gradient Pie Chart */}
                        <div 
                            className="w-48 h-48 rounded-full shadow-inner border-4 border-gray-50 shrink-0"
                            style={{ background: pieGradient }}
                        ></div>
                        
                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
                            {data.categoryDistribution.map((cat, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                                    <span className="font-bold text-gray-700 flex-1">{cat.category}</span>
                                    <span className="text-gray-500">{cat.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Articles Table */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                    <h3 className="font-serif font-bold text-lg text-ink mb-4">Top Performing Articles</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase font-bold">
                                    <th className="pb-3">Title</th>
                                    <th className="pb-3 text-right">Views</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {topArticles.map(article => (
                                    <tr key={article.id} className="group hover:bg-gray-50">
                                        <td className="py-3 pr-4">
                                            <p className="font-bold text-ink line-clamp-1">{article.title}</p>
                                            <p className="text-xs text-gray-400">{article.category} • {article.date}</p>
                                        </td>
                                        <td className="py-3 text-right font-bold text-gold-dark flex justify-end items-center gap-1">
                                            <Eye size={12}/> {article.views}
                                        </td>
                                    </tr>
                                ))}
                                {topArticles.length === 0 && <tr><td colSpan={2} className="py-4 text-center text-gray-400">No articles yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Ad Performance */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                    <h3 className="font-serif font-bold text-lg text-ink mb-4">Ad Campaign Stats</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase font-bold">
                                    <th className="pb-3">Campaign</th>
                                    <th className="pb-3 text-center">Status</th>
                                    <th className="pb-3 text-right">Clicks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {adStats.map((ad, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50">
                                        <td className="py-3 pr-4 font-bold text-ink">{ad.name}</td>
                                        <td className="py-3 text-center">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${ad.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {ad.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right font-bold text-blue-600 flex justify-end items-center gap-1">
                                            <MousePointer size={12}/> {ad.clicks}
                                        </td>
                                    </tr>
                                ))}
                                {adStats.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">No active ads.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
