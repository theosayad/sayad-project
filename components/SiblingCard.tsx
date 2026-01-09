
import React from 'react';
import { Sibling } from '../types';

interface SiblingCardProps {
  sibling: Sibling;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export const SiblingCard: React.FC<SiblingCardProps> = ({ sibling, onSelect, isSelected }) => {
  return (
    <div 
      onClick={() => onSelect(sibling.id)}
      className={`group cursor-pointer transition-all duration-500 p-6 md:p-8 rounded-xl border ${
        isSelected 
          ? 'border-aleppo bg-white shadow-xl scale-[1.01] md:scale-[1.02]' 
          : 'border-stone-200 bg-white/50 hover:bg-white hover:shadow-lg'
      }`}
    >
      <div className="flex items-center gap-4 mb-4 md:mb-6">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-serif text-xl md:text-2xl transition-colors duration-500 flex-shrink-0 ${
          isSelected ? 'bg-aleppo' : 'bg-stone-300 group-hover:bg-stone-400'
        }`}>
          {sibling.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight truncate">{sibling.name}</h3>
          {sibling.migrationDestination && (
            <p className="text-[10px] md:text-sm text-aleppo italic mt-0.5 truncate">{sibling.migrationDestination}</p>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 text-[13px] md:text-sm leading-relaxed mb-6 font-light line-clamp-3 md:line-clamp-none">
        {sibling.description}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-[9px] md:text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
        <span className="truncate mr-2">{sibling.childrenCount > 0 ? `${sibling.childrenCount} Confirmed Descendants` : 'Lineage Records'}</span>
        <span className={`transition-opacity flex-shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>Selected</span>
      </div>
    </div>
  );
};
