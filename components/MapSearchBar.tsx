import React from 'react';
import { SearchIcon } from './icons';

interface MapSearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({ value, onChange }) => {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-64 z-10">
            <div className="relative bg-slate-900/50 backdrop-blur-md rounded-full border border-slate-700/80 shadow-lg">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search for a village..."
                    className="w-full bg-transparent py-2.5 pl-11 pr-4 text-white placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500/80"
                />
            </div>
        </div>
    );
};

export default MapSearchBar;