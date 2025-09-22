import React, { useState } from 'react';
import { SparklesIcon, SyncIcon, AlertTriangleIcon } from '../common/icons';
import { generateMapAnalysis } from '../../services/gemini';
import { villageData } from '../../constants';

const AIMapAnalysis: React.FC = () => {
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis('');
        try {
            const result = await generateMapAnalysis(villageData);
            if (result.startsWith("Could not generate analysis")) {
                setError(result);
            } else {
                setAnalysis(result);
            }
        } catch (e) {
            console.error("Error in getAnalysis component:", e);
            setError("An unexpected error occurred while contacting the AI service.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 h-full flex flex-col">
            <h4 className="font-semibold text-cyan-200 mb-3 text-center">AI Geographical Insights</h4>
            <div className="flex-grow p-3 bg-slate-900/50 rounded-md min-h-[100px] flex items-center justify-center">
                {isLoading ? (
                    <div className="text-center">
                        <SyncIcon className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                        <p className="text-sm text-gray-400 mt-2">Analyzing map data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-300">
                        <AlertTriangleIcon className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm">{error}</p>
                    </div>
                ) : analysis ? (
                    <p className="text-sm text-gray-300 animate-fade-in">{analysis}</p>
                ) : (
                    <p className="text-sm text-gray-500 text-center">Click below to generate an AI-powered summary of the current situation.</p>
                )}
            </div>
            <button
                onClick={getAnalysis}
                disabled={isLoading}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-cyan-600 text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed active:scale-[0.98]"
            >
                <SparklesIcon className="w-5 h-5" />
                {analysis ? 'Regenerate Analysis' : 'Generate Analysis'}
            </button>
        </div>
    );
};

export default AIMapAnalysis;