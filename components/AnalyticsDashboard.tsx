
import React, { useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import { TrendingUp, Users, FileText, Globe } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
    const { getAnalytics } = useNews();
    const data = useMemo(() => getAnalytics(), []);

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
    const maxDaily = Math.max(...data.dailyVisits.map(d => d.visits), 1); // Avoid div by zero

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><Users size={24}/></div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Visits</p>
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
                    <h3 className="font-serif font-bold text-lg text-ink mb-6">Traffic Trend (Last 7 Days)</h3>
                    <div className="flex items-end justify-between h-64 gap-2 pt-4 border-b border-gray-100">
                        {data.dailyVisits.map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center flex-1 group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded">
                                    {day.visits} Visits
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

                {/* Geographic Data (List) */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200 lg:col-span-2">
                    <h3 className="font-serif font-bold text-lg text-ink mb-6">Visitor Locations</h3>
                    <div className="space-y-4">
                        {data.geoSources.map((geo, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <span className="w-32 text-sm font-bold text-gray-700 text-right">{geo.country}</span>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-ink rounded-full"
                                        style={{ width: `${geo.percentage}%` }}
                                    ></div>
                                </div>
                                <span className="w-12 text-xs font-bold text-gray-500">{geo.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
