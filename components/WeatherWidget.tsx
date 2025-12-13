
import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, Droplets, Plus, Search, X, MapPin } from 'lucide-react';

interface WeatherData {
    temp: number;
    code: number;
    windspeed: number;
}

interface WeatherWidgetProps {
    variant?: 'header' | 'sidebar';
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ variant = 'header' }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [aqi, setAqi] = useState<number | null>(null);
    const [placeName, setPlaceName] = useState<string>('Local');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // Search State
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [manualLocation, setManualLocation] = useState<{lat: number, lon: number, name: string} | null>(null);

    const fetchWeatherData = async (lat: number, lon: number, name: string) => {
        try {
            setLoading(true);
            // Fetch Weather
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const weatherData = await weatherRes.json();

            // Fetch AQI
            const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`);
            const aqiData = await aqiRes.json();

            setWeather({
                temp: weatherData.current_weather.temperature,
                code: weatherData.current_weather.weathercode,
                windspeed: weatherData.current_weather.windspeed
            });
            setAqi(aqiData.current?.us_aqi || null);
            setPlaceName(name);
            setLoading(false);
            setError(false);
        } catch (e) {
            console.error("Weather data fetch error", e);
            setError(true);
            setLoading(false);
        }
    };

    useEffect(() => {
        const initWeather = async () => {
            if (manualLocation) {
                await fetchWeatherData(manualLocation.lat, manualLocation.lon, manualLocation.name);
                return;
            }

            try {
                // 1. Get Location via IP
                const ipRes = await fetch('https://ipapi.co/json/');
                if (!ipRes.ok) throw new Error('IP Geo failed');
                const ipData = await ipRes.json();
                
                const latitude = ipData.latitude;
                const longitude = ipData.longitude;
                const city = ipData.city || ipData.region || "Local";
                
                await fetchWeatherData(latitude, longitude, city);
            } catch (e) {
                console.error("Initial location fetch error", e);
                setError(true);
                setLoading(false);
            }
        };

        initWeather();
    }, [manualLocation]);

    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();

            if (geoData.results && geoData.results.length > 0) {
                const loc = geoData.results[0];
                setManualLocation({
                    lat: loc.latitude,
                    lon: loc.longitude,
                    name: loc.name
                });
                setShowSearch(false);
                setSearchQuery('');
            } else {
                alert("Location not found.");
                setLoading(false);
            }
        } catch (e) {
            console.error("Geocoding error", e);
            alert("Search failed. Please try again.");
            setLoading(false);
        }
    };

    const getWeatherIcon = (code: number, size: number = 14) => {
        const className = variant === 'sidebar' ? "text-gold-dark" : "text-gold-dark";
        if (code <= 1) return <Sun size={size} className="text-orange-500" />;
        if (code <= 3) return <Cloud size={size} className="text-gray-400" />;
        if (code <= 48) return <Wind size={size} className="text-gray-400" />;
        if (code <= 67) return <CloudRain size={size} className="text-blue-500" />;
        if (code <= 77) return <CloudSnow size={size} className="text-blue-300" />;
        if (code <= 82) return <CloudRain size={size} className="text-blue-600" />;
        if (code <= 86) return <CloudSnow size={size} className="text-blue-300" />;
        if (code <= 99) return <CloudLightning size={size} className="text-purple-500" />;
        return <Sun size={size} className={className} />;
    };

    const getAqiColor = (aqi: number) => {
        if (aqi <= 50) return 'text-green-600';
        if (aqi <= 100) return 'text-yellow-600';
        if (aqi <= 150) return 'text-orange-600';
        return 'text-red-600';
    };

    const getAqiLabel = (aqi: number) => {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Mod'; 
        if (aqi <= 150) return 'Poor'; 
        return 'Bad';
    };

    if (loading && !weather) {
        if (variant === 'sidebar') {
            return (
                <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg mb-8 h-40 flex flex-col justify-center items-center gap-2">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-400">Updating Forecast...</span>
                </div>
            );
        }
        return <div className="text-[9px] text-gray-400 animate-pulse font-sans w-24 h-6 bg-gray-100 rounded"></div>;
    }

    if (error || !weather) {
        if (variant === 'sidebar') return null; 
        return null;
    }

    // --- SIDEBAR LAYOUT ---
    if (variant === 'sidebar') {
        return (
            <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg mb-8 relative overflow-hidden group transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-sans font-bold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
                            <Thermometer size={18} className="text-gold-dark"/> 
                            {showSearch ? 'Search City' : placeName}
                        </h4>
                        <button 
                            onClick={() => setShowSearch(!showSearch)} 
                            className="text-gray-400 hover:text-ink transition-colors p-1"
                            title="Change Location"
                        >
                            {showSearch ? <X size={16} /> : <Search size={16} />}
                        </button>
                    </div>

                    {showSearch ? (
                        <form onSubmit={handleSearchSubmit} className="mb-4">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    autoFocus
                                    placeholder="Enter city name..."
                                    className="w-full text-sm border-b border-gold outline-none py-1 bg-transparent"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="text-gold-dark font-bold text-xs uppercase hover:text-ink">GO</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-full">
                                        {getWeatherIcon(weather.code, 32)}
                                    </div>
                                    <div>
                                        <span className="text-4xl font-black text-ink leading-none">{Math.round(weather.temp)}°</span>
                                        <span className="text-xs text-gray-400 font-serif mt-1 block">Celsius</span>
                                    </div>
                                </div>
                                {aqi !== null && (
                                    <div className="text-right">
                                        <span className={`block text-2xl font-black leading-none ${getAqiColor(aqi)}`}>{aqi}</span>
                                        <span className="text-[10px] font-bold uppercase text-gray-400 mt-1 block">{getAqiLabel(aqi)} Air</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Wind size={14} className="text-gray-400" />
                                    <span className="font-bold">{weather.windspeed} <span className="font-normal text-gray-400">km/h</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Droplets size={14} className="text-gray-400" />
                                    <span className="font-bold">{getAqiLabel(aqi || 0)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // --- HEADER LAYOUT (Compact) ---
    return (
        <div className="flex flex-row items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded border border-gray-200 shadow-sm transition-all hover:border-gold/50">
            {showSearch ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
                    <input 
                        type="text" 
                        autoFocus
                        placeholder="City..."
                        className="w-16 text-[10px] border-b border-gray-300 outline-none bg-transparent font-bold text-ink"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => !searchQuery && setShowSearch(false)}
                    />
                    <button type="submit" className="text-green-600 hover:text-green-800"><MapPin size={10} /></button>
                    <button type="button" onClick={() => setShowSearch(false)} className="text-red-500"><X size={10} /></button>
                </form>
            ) : (
                <>
                    <div className="flex items-center gap-1 border-r border-gray-300 pr-1.5">
                        {getWeatherIcon(weather.code, 12)}
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-black text-ink font-sans">{Math.round(weather.temp)}°</span>
                            <div className="flex items-center gap-0.5 group cursor-pointer" onClick={() => setShowSearch(true)} title="Change Location">
                                <span className="text-[8px] font-bold text-gray-500 uppercase max-w-[50px] truncate">{placeName}</span>
                                <Plus size={6} className="text-gold-dark group-hover:scale-125 transition-transform" />
                            </div>
                        </div>
                    </div>
                    {aqi !== null && (
                        <div className="flex flex-col leading-none">
                            <span className="text-[7px] text-gray-400 uppercase font-bold">AQI {aqi}</span>
                            <span className={`text-[7px] font-black uppercase ${getAqiColor(aqi)}`}>{getAqiLabel(aqi)}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
