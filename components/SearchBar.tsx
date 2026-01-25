'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
  initialSearch?: string;
  initialLocation?: string;
}

export default function SearchBar({ initialSearch = '', initialLocation = '' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    if (location) {
      params.set('location', location);
    } else {
      params.delete('location');
    }
    
    // Reset to page 1 on new search
    params.delete('page');
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#F9F9F9] placeholder-[#6A6A6A] focus:outline-none focus:border-[#5A5A5A] transition-colors"
          />
        </div>
        <div className="sm:w-48">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#F9F9F9] placeholder-[#6A6A6A] focus:outline-none focus:border-[#5A5A5A] transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-[#F9F9F9] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E0E0E0] transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
