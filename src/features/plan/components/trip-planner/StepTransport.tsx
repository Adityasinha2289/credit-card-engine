import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Train, Bus, Car, Navigation } from 'lucide-react';
import { TransportMode } from '../../types';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/Button';

interface StepTransportProps {
  initialMode: TransportMode | null;
  onNext: (mode: TransportMode) => void;
  onBack: () => void;
}

const MODES: { id: TransportMode; label: string; icon: any }[] = [
  { id: 'FLIGHT', label: 'Flight', icon: Plane },
  { id: 'TRAIN', label: 'Train', icon: Train },
  { id: 'BUS', label: 'Bus', icon: Bus },
  { id: 'CAB', label: 'Cab', icon: Navigation },
  { id: 'MY_OWN_VEHICLE', label: 'My Own Vehicle', icon: Car },
];

export function StepTransport({ initialMode, onNext, onBack }: StepTransportProps) {
  const [selected, setSelected] = useState<TransportMode | null>(initialMode);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex-1">
        <h2 className="text-3xl font-display font-medium text-gray-900 tracking-tight mb-8">
          HOW DO YOU WANT TO GET THERE?
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              className={cn(
                "flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 border-2",
                selected === mode.id 
                  ? "bg-gray-900 text-white border-gray-900 shadow-md transform -translate-y-1" 
                  : "bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              )}
              onClick={() => setSelected(mode.id)}
            >
              <mode.icon size={32} strokeWidth={1.5} className="mb-3" />
              <span className="font-medium">{mode.label}</span>
            </button>
          ))}
        </div>
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
