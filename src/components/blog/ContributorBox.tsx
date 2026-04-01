import React from 'react';
import { Contributor } from '../../types';

interface ContributorBoxProps {
  contributor: Contributor;
}

export const ContributorBox: React.FC<ContributorBoxProps> = ({ contributor }) => {
  return (
    <div className="my-12 p-6 md:p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
      {contributor.image && (
        <img 
          src={contributor.image} 
          alt={contributor.name} 
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="flex-1">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
          About the Contributor
        </span>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{contributor.name}</h3>
        <p className="text-gray-600 leading-relaxed max-w-2xl">
          {contributor.bio}
        </p>
        <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
          <span className="text-sm italic text-gray-500">
            "Real Stories. Real Operators."
          </span>
        </div>
      </div>
    </div>
  );
};
