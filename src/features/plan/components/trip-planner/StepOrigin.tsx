import React, { useState } from 'react';
import { LocationData } from '../../types';
import { Button } from '../../../../components/ui/Button';
import { PlaceSearchInput } from './PlaceSearchInput';

interface StepOriginProps {
  initialOrigin: LocationData | null;
  onNext: (origin: LocationData) => void;
}

export function StepOrigin({ initialOrigin, onNext }: StepOriginProps) {
  const [selected, setSelected] = useState<LocationData | null>(initialOrigin);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1">
        <h2 className="text-3xl font-display font-medium text-gray-900 tracking-tight mb-8">
          WHERE ARE YOU STARTING FROM?
        </h2>

        <PlaceSearchInput 
          placeholder="e.g. Noida, Delhi"
          initialPlace={selected}
          onSelect={(place) => setSelected(place)}
        />
      </div>

      <div className="pt-6 mt-auto">
        <Button 
          className="w-full py-6 text-lg rounded-2xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
          disabled={!selected}
          onClick={() => selected && onNext(selected)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
