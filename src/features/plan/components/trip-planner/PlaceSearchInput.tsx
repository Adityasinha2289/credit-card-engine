import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Navigation, X, AlertCircle } from 'lucide-react';
import { LocationData } from '../../types';
import { DemoPlaceProvider } from '../../providers/DemoPlaceProvider';
import { RealPlaceProvider } from '../../providers/RealPlaceProvider';
import { cn } from '../../../../lib/utils';
import { useIsDemo } from '../../../demo/DemoAppProvider';

interface PlaceSearchInputProps {
  placeholder: string;
  initialPlace: LocationData | null;
  onSelect: (place: LocationData | null) => void;
  disallowedPlaceId?: string; // e.g., to prevent origin == destination
}

export function PlaceSearchInput({ placeholder, initialPlace, onSelect, disallowedPlaceId }: PlaceSearchInputProps) {
  const [query, setQuery] = useState(initialPlace?.name || '');
  const [results, setResults] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Is it fully selected (i.e. we have the structured place and not just text)
  const [selectedPlace, setSelectedPlace] = useState<LocationData | null>(initialPlace);
  
  // Track open state of the dropdown
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce & Race condition protection
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requestCounterRef = useRef<number>(0);

  // Determine Provider
  const isDemoContext = useIsDemo();
  const isDemoOnboarding = typeof window !== 'undefined' && window.location.search.includes('demo=onboarding');
  const isDemo = isDemoContext || isDemoOnboarding;
  
  // Since provider doesn't change during the lifecycle, we can store it in a ref
  const provider = useRef(isDemo ? new DemoPlaceProvider() : new RealPlaceProvider());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        // If clicking outside and we have no selected place, we shouldn't necessarily wipe the text, 
        // but we should close the dropdown.
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearch = (val: string) => {
    setQuery(val);
    
    if (selectedPlace) {
      // User started typing again, break the selection
      setSelectedPlace(null);
      onSelect(null);
    }

    if (val.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setError(null);
      return;
    }

    setIsOpen(true);
    setLoading(true);
    setError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const currentRequestId = ++requestCounterRef.current;
      
      try {
        const res = await provider.current.searchPlaces(val);
        // Race condition check
        if (currentRequestId === requestCounterRef.current) {
          setResults(res);
          setLoading(false);
        }
      } catch (err: any) {
        if (currentRequestId === requestCounterRef.current) {
          setError(err.message || 'Couldn\'t search locations.');
          setResults([]);
          setLoading(false);
        }
      }
    }, 300); // 300ms debounce
  };

  const selectPlace = (place: LocationData) => {
    if (place.placeId === disallowedPlaceId) {
      setError("Origin and destination can't be the same place.");
      setIsOpen(false);
      return;
    }
    
    setSelectedPlace(place);
    setQuery(place.name);
    setResults([]);
    setIsOpen(false);
    setError(null);
    onSelect(place);
  };

  const clearSelection = () => {
    setQuery('');
    setSelectedPlace(null);
    setResults([]);
    setIsOpen(false);
    setError(null);
    onSelect(null);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full" ref={inputRef}>
      <div className={cn(
        "relative flex items-center bg-white border rounded-2xl transition-all duration-200 overflow-hidden",
        isOpen ? "border-semantic-brand ring-2 ring-semantic-brand/20" : "border-gray-200",
        selectedPlace ? "bg-gray-50 border-gray-200" : ""
      )}>
        <div className="pl-4 pr-3 flex items-center pointer-events-none">
          {selectedPlace ? (
            <MapPin className="h-5 w-5 text-semantic-brand" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <input
          type="text"
          className={cn(
            "block w-full py-4 text-lg font-medium text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none",
            selectedPlace ? "text-gray-900" : ""
          )}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2 && !selectedPlace) setIsOpen(true);
          }}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="place-suggestions"
          aria-autocomplete="list"
        />

        {selectedPlace && (
          <button 
            onClick={clearSelection}
            className="p-3 text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Clear selection"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {!selectedPlace && !query && (
          <button className="flex items-center px-4 text-sm font-medium text-semantic-brand hover:text-semantic-brand/80 transition-colors shrink-0">
            <Navigation className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Use my location</span>
          </button>
        )}
      </div>

      {selectedPlace && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 mt-2 bg-semantic-brand/5 rounded-xl flex items-center gap-2 border border-semantic-brand/10"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-semantic-brand shrink-0" />
          <p className="text-sm font-medium text-semantic-brand truncate">
            {selectedPlace.address || selectedPlace.name}
          </p>
        </motion.div>
      )}

      {/* Suggestion Dropdown */}
      <AnimatePresence>
        {isOpen && (query.trim().length >= 2) && (
          <motion.div 
            id="place-suggestions"
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.08)] overflow-hidden max-h-[60vh] overflow-y-auto"
            role="listbox"
          >
            {loading ? (
              <div className="px-4 py-6 text-center text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-semantic-brand rounded-full animate-spin" />
                Searching places...
              </div>
            ) : error ? (
              <div className="px-4 py-6 flex items-start gap-3 bg-red-50/50">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  <button 
                    onClick={() => handleSearch(query)}
                    className="text-xs font-bold uppercase tracking-wider text-red-600 mt-2 hover:text-red-700"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : results.length > 0 ? (
              <ul className="py-2">
                {results.slice(0, 7).map((place) => (
                  <li key={place.placeId} role="option" aria-selected={false}>
                    <button
                      className="w-full text-left px-5 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors group focus:outline-none focus:bg-gray-50"
                      onClick={() => selectPlace(place)}
                    >
                      <div className="mt-0.5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all text-gray-500 group-hover:text-semantic-brand">
                        <MapPin size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{place.name}</p>
                        {place.address && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{place.address}</p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-gray-900">No places found</p>
                <p className="text-xs text-gray-500 mt-1">Try a city, neighbourhood or landmark.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
