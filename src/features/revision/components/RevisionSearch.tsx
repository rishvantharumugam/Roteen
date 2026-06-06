import React from 'react';
import { Search } from 'lucide-react';

interface RevisionSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export const RevisionSearch: React.FC<RevisionSearchProps> = ({ value, onChange }) => (
  <div className="flex items-center gap-4 w-full md:w-auto">
    <div className="relative w-full md:w-[340px]">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
      <input
        type="text"
        placeholder="Search playlist"
        className="w-full bg-[#121212] border border-zinc-800 focus:border-violet-500/50 rounded-full py-3 pl-11 pr-5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

