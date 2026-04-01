import React from 'react';
import { CheckCircle } from 'lucide-react';

export const VerifiedBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold uppercase tracking-wider border border-blue-100">
      <CheckCircle size={10} />
      <span>Verified by Parallel Pages</span>
    </div>
  );
};
