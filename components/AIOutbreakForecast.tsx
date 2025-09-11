import React, { useState, useEffect } from 'react';
import { SparklesIcon, SyncIcon, AlertTriangleIcon } from './icons';
import { diseaseTrendsData } from '../constants';
import { generateOutbreakForecast, ForecastError } from '../gemini';

const FORECAST_CACHE_KEY = 'aquaForecastCache';
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

const AIOutbreakForecast: React.FC = () => {
    const [forecast, setForecast] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchForecast = async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        if (!forceRefresh) {
            try {
                const cachedItem = localStorage.getItem(FORECAST_CACHE_KEY);
                if (cachedItem) {
                    const { forecast: cachedForecast, timestamp } = JSON.parse(cachedItem);
                    if (Date.now() - timestamp < CACHE_TTL) {
                        setForecast(cachedForecast);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (e) {
                console.error("Failed to read forecast from cache", e);
            }
        }

        try {
            const generatedForecast = await generateOutbreakForecast(diseaseTrendsData);
            
            setForecast(generatedForecast);
            setError(null); // Clear previous errors on success
            try {
                const cachePayload = { forecast: generatedForecast, timestamp: Date.now() };
                localStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify(cachePayload));
            } catch(e) {
                console.error("Failed to save forecast to cache", e);
            }
        } catch (e: unknown) {
            console.error("Error in fetchForecast component:", e);
            if (e instanceof ForecastError) {
                setError(e.message);
            } else {
                setError("An unexpected error occurred while processing the forecast.");
            }
            setForecast(''); // Ensure no stale forecast is shown
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchForecast();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-slate-700/80 rounded w-full"></div>
                    <div className="h-4 bg-slate-700/80 rounded w-5/6"></div>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex items-center gap-3 text-red-300">
                    <AlertTriangleIcon className="w-6 h-6 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            );
        }
        return <p className="text-gray-300 text-sm">{forecast}</p>;
    };

    const futureDays = ['Tomorrow', '+2 Days', '+3 Days'];
    const highRiskDisease = diseaseTrendsData.find(d => d.threatLevel === 'high' || d.trend === 'increasing');

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg shadow-purple-500/10 border border-purple-500/30 p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-purple-400"><SparklesIcon /></div>
                    <h3 className="text-xl font-semibold text-purple-300 tracking-wide">AI Outbreak Forecast</h3>
                </div>
                <button
                    onClick={() => fetchForecast(true)}
                    disabled={isLoading}
                    className="p-2 text-purple-300 hover:text-white disabled:text-gray-500 hover:bg-slate-700/80 rounded-full transition-colors"
                    aria-label="Regenerate forecast"
                >
                    <SyncIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="mb-4 min-h-[32px]">
                {renderContent()}
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-cyan-200">Predicted Risk Levels</h4>
                {futureDays.map((day, index) => (
                    <div key={day} className="flex justify-between items-center text-sm p-2 bg-slate-800/60 rounded-md">
                        <span className="font-medium text-white">{day}</span>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-yellow-300">
                                {highRiskDisease?.name || 'Cholera'}
                           </span>
                           <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${index === 1 ? 'bg-red-800 text-red-200' : 'bg-yellow-800 text-yellow-200'}`}>
                                {index === 1 ? 'High' : 'Moderate'}
                           </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(AIOutbreakForecast);