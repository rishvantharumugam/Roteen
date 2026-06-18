"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

export const SearchableSelect = ({
  name,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  loading = false,
  dropUp = false,
  searchable = true
}: {
  name: string,
  value: string,
  options: { label: string, value: string }[],
  onChange: (e: any) => void,
  placeholder: string,
  disabled?: boolean,
  loading?: boolean,
  dropUp?: boolean,
  searchable?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => options.find(o => o.value === value), [options, value]);
  const [inputValue, setInputValue] = useState("");

  // Sync input display value with selection when dropdown is closed or selection changes
  useEffect(() => {
    if (!isOpen) {
      setInputValue(selectedOption ? selectedOption.label : "");
    }
  }, [selectedOption, isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const handleInputClick = () => {
    if (disabled) return;
    if (!searchable) {
      setIsOpen(prev => !prev);
    } else {
      setIsOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!searchable) return;
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelectOption = (option: { label: string, value: string }) => {
    onChange({ target: { name, value: option.value } });
    setInputValue(option.label);
    setIsOpen(false);
  };

  // Filter options list by typed search query (only when searchable)
  const filteredOptions = useMemo(() => {
    if (!searchable) return options;
    if (!isOpen) return options;
    return options.filter(o => o.label.toLowerCase().includes(inputValue.toLowerCase()));
  }, [options, inputValue, searchable, isOpen]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative w-full flex items-center">
        <input
          type="text"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={handleInputClick}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={!searchable}
          className={`w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-4 pr-10 py-2.5 text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#8B5CF6] transition-colors text-left ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${!searchable ? 'cursor-pointer' : ''}`}
        />
        <div className="absolute right-3 flex items-center gap-2 pointer-events-none">
          {loading && <Loader2 size={16} className="text-[#8B5CF6] animate-spin" />}
          <ChevronDown size={16} className={`text-[#A1A1AA] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className={`absolute ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl z-[100] flex flex-col overflow-hidden`}>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#A1A1AA] text-center">No options found.</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full text-left px-4 py-2.5 hover:bg-[#2A2A2A] transition-colors text-sm ${value === option.value ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'text-white'}`}
                  onClick={() => handleSelectOption(option)}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
