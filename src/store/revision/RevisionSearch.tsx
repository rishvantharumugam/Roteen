import React from 'react';
import { Search } from 'lucide-react';
import { revisionStyles } from '@/styles/revisionStyles';

interface RevisionSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export const RevisionSearch: React.FC<RevisionSearchProps> = ({ value, onChange }) => (
  <div className={revisionStyles.searchWrapper}>
    <div className={revisionStyles.searchContainer}>
      <Search className={revisionStyles.searchIcon} />
      <input
        type="text"
        placeholder="Search playlist"
        className={revisionStyles.searchInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

