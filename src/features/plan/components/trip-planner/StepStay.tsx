import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Star, Building2, Palmtree } from 'lucide-react';
import { StayPreference } from '../../types';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/Button';

interface StepStayProps {
  initialPreference: StayPreference | null;
  onNext: (preference: StayPreference) => void;
  onBack: () => void;
}

const STAYS: { id: StayPreference; label: string; icon: any; desc: string }[] = [
  { id: 'HOSTEL_GUESTHOUSE', label: 'Hostel / Guest House', desc: 'Budget friendly, social', icon: Home },
  { id: '3_STAR', label: '3 Star Hotel', desc: 'Comfortable, good value', icon: Building2 },
  { id: '4_STAR', label: '4 Star Hotel', desc: 'Premium amenities', icon: Star },
  { id: '5_STAR', label: '5 Star Resort', desc: 'Luxury experience', icon: Palmtree },
  { id: 'NO_STAY', label: 'No Stay Needed', desc: "I've got it covered", icon: Home },
];

export function StepStay({ initialPreference, onNext, onBack }: StepStayProps) {
  const [selected, setSelected] = useState<StayPreference | null>(initialPreference);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex-1">
        <h2 className="text-3xl font-display font-medium text-gray-900 tracking-tight mb-8">
          WHERE ARE YOU STAYING?
        </h2>

        <div className="flex flex-col gap-3">
          {STAYS.map((stay) => (
            <button
              key={stay.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 border-2 text-left",
                selected === stay.id 
                  ? "bg-gray-900 text-white border-gray-900 shadow-md" 
                  : "bg-white text-gray-700 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              )}
              onClick={() => setSelected(stay.id)}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                selected === stay.id ? "bg-white/10 text-white" : "bg-gray-100 text-gray-500"
              )}>
                <stay.icon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <span className="block font-medium text-lg">{stay.label}</span>
                <span className={cn("block text-sm mt-0.5", selected === stay.id ? "text-gray-300" : "text-gray-500")}>
                  {stay.desc}
                </span>
              </div>
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
