import React, { useState } from 'react';
import { LocationData } from '../../types';
import { Button } from '../../../../components/ui/Button';
import { PlaceSearchInput } from './PlaceSearchInput';

interface StepDestinationProps {
  initialDestination: LocationData | null;
  originPlaceId?: string;
  onNext: (destination: LocationData) => void;
  onBack: () => void;
}

export function StepDestination({ initialDestination, originPlaceId, onNext, onBack }: StepDestinationProps) {
  const [selected, setSelected] = useState<LocationData | null>(initialDestination);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex-1">
        <h2 className="text-3xl font-display font-medium text-gray-900 tracking-tight mb-8">
          WHERE ARE YOU HEADING?
        </h2>

        <PlaceSearchInput 
          placeholder="e.g. Mussoorie, Goa"
          initialPlace={selected}
          onSelect={(place) => setSelected(place)}
          disallowedPlaceId={originPlaceId}
        />
      </div>

      <div className="pt-6 mt-auto flex gap-3">
        <Button 
          variant="outline"
          className="w-1/3 py-6 text-lg rounded-2xl border-gray-200 text-gray-900 hover:bg-gray-50"
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          className="flex-1 py-6 text-lg rounded-2xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
          disabled={!selected}
          onClick={() => selected && onNext(selected)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
