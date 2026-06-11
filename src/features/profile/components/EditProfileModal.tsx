import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { UserProfile, ProfileService } from '../services/profile.service';
import { districtOptions } from '@/lib/sign-up-options';

const CustomSelect = ({ 
  name, 
  value, 
  options, 
  onChange, 
  placeholder 
}: { 
  name: string, 
  value: string, 
  options: { label: string, value: string }[], 
  onChange: (e: any) => void,
  placeholder: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors flex items-center justify-between text-left"
      >
        <span className={selectedOption ? "text-white" : "text-[#A1A1AA]"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-[#A1A1AA] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl z-[100] max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`w-full text-left px-4 py-2.5 hover:bg-[#2A2A2A] transition-colors text-sm ${
                value === option.value ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'text-white'
              }`}
              onClick={() => {
                onChange({ target: { name, value: option.value } });
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: profile.full_name,
    phone: profile.phone,
    dob: profile.dob,
    gender: profile.gender,
    district: profile.district,
    standard: profile.standard,
    school_name: profile.school_name,
    school_type: profile.school_type,
    medium: profile.medium,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string, value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await ProfileService.updateProfile(profile.id, formData);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setIsSaving(false);
    }
  };

  // Option Definitions
  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];
  const standardOptions = [
    { label: '9', value: '9' },
    { label: '10', value: '10' },
    { label: '11', value: '11' },
    { label: '12', value: '12' },
  ];
  const schoolTypeOptions = [
    { label: 'Private', value: 'Private' },
    { label: 'Government', value: 'Government' },
  ];
  const mediumOptions = [
    { label: 'English', value: 'English' },
    { label: 'Tamil', value: 'Tamil' },
    { label: 'Other', value: 'Other' },
  ];
  const districtSelectOptions = districtOptions.map(d => ({ label: d, value: d }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#202024] rounded-2xl w-full max-w-2xl shadow-2xl relative my-8">
        <div className="flex items-center justify-between p-6 border-b border-[#202024]">
          <h2 className="text-xl font-bold text-white tracking-wide">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleChange}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="bg-[#111] border border-[#202020] rounded-lg px-4 py-2.5 text-[#666] cursor-not-allowed"
              />
              <span className="text-xs text-[#666]">Email address cannot be changed</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Mobile Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob || ''}
                onChange={handleChange}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Gender</label>
              <CustomSelect
                name="gender"
                value={formData.gender || ''}
                options={genderOptions}
                onChange={handleChange}
                placeholder="Select gender"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#A1A1AA]">District</label>
              <CustomSelect
                name="district"
                value={formData.district || ''}
                options={districtSelectOptions}
                onChange={handleChange}
                placeholder="Select district"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Standard</label>
              <CustomSelect
                name="standard"
                value={formData.standard || ''}
                options={standardOptions}
                onChange={handleChange}
                placeholder="Select standard"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#A1A1AA]">School Name</label>
              <input
                type="text"
                name="school_name"
                value={formData.school_name || ''}
                onChange={handleChange}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#A1A1AA]">School Type</label>
              <CustomSelect
                name="school_type"
                value={formData.school_type || ''}
                options={schoolTypeOptions}
                onChange={handleChange}
                placeholder="Select school type"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#A1A1AA]">Medium of Study</label>
              <CustomSelect
                name="medium"
                value={formData.medium || ''}
                options={mediumOptions}
                onChange={handleChange}
                placeholder="Select medium"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
