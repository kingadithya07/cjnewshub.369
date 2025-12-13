
import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, Droplets } from 'lucide-react';

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

    useEffect(() => {
        const fetchWeatherByIP = async () => {
            try {
                // 1. Get Location via IP (No User Permission Needed)
                const ipRes = await fetch('https://ipapi.co/json/');
                if (!ipRes.ok) throw new Error('IP Geo failed');
                const ipData = await ipRes.json();
                
                const latitude = ipData.latitude;
                const longitude = ipData.longitude;
                const city = ipData.city || ipData.region || "Local";
                
                setPlaceName(city);

                // 2. Fetch Weather from Open-Meteo
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                const weatherData = await weatherRes.json();

                // 3. Fetch AQI from Open-Meteo
                const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`);
                const aqiData = await aqiRes.json();

                setWeather({
                    temp: weatherData.current_weather.temperature,
                    code: weatherData.current_weather.weathercode,
                    windspeed: weatherData.current_weather.windspeed
                });
                setAqi(aqiData.current?.us_aqi || null);
                setLoading(false);
            } catch (e) {
                console.error("Weather fetch error", e);
                // Fallback to defaults or error state
                setError(true);
                setLoading(false);
            }
        };

        fetchWeatherByIP();
    }, []);

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
        if (aqi <= 100) return 'Mod'; // Shortened for mobile
        if (aqi <= 150) return 'Poor'; 
        return 'Bad';
    };

    if (loading) {
        if (variant === 'sidebar') {
            return (
                <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg mb-8 h-40 flex flex-col justify-center items-center gap-2">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-400">Locating...</span>
                </div>
            );
        }
        return <div className="text-[9px] text-gray-400 animate-pulse font-sans">...</div>;
    }

    if (error || !weather) {
        if (variant === 'sidebar') return null; 
        return null;
    }

    // Sidebar Layout (Desktop)
    if (variant === 'sidebar') {
        return (
            <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg mb-8 relative overflow-hidden group">
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110"></div>
                
                <div className="relative z-10">
                    {/* Updated: Removed "Weather" text, only showing placeName */}
                    <h4 className="font-sans font-bold text-sm uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                        <Thermometer size={18} className="text-gold-dark"/> {placeName}
                    </h4>
                    
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
                </div>
            </div>
        );
    }

    // Default Header Layout (Mobile / Top Bar)
    // Updated: Much smaller sizing
    return (
        <div className="flex flex-row items-center gap-1.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-gray-200 shadow-sm">
            <div className="flex items-center gap-1 border-r border-gray-300 pr-1.5">
                {getWeatherIcon(weather.code, 12)}
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-black text-ink font-sans">{Math.round(weather.temp)}°</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase max-w-[50px] truncate">{placeName}</span>
                </div>
            </div>
            {aqi !== null && (
                <div className="flex flex-col leading-none">
                    <span className="text-[7px] text-gray-400 uppercase font-bold">AQI {aqi}</span>
                    <span className={`text-[7px] font-black uppercase ${getAqiColor(aqi)}`}>{getAqiLabel(aqi)}</span>
                </div>
            )}
        </div>
    );
};
