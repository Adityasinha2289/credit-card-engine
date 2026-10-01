import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Minus } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

interface StepTravelersProps {
  initialTravelers: number;
  onNext: (travelers: number) => void;
  onBack: () => void;
}

export function StepTravelers({ initialTravelers, onNext, onBack }: StepTravelersProps) {
  const [count, setCount] = useState(initialTravelers || 2);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex-1 flex flex-col justify-center items-center">
        <h2 className="text-3xl font-display font-medium text-gray-900 tracking-tight mb-12 text-center">
          WHO'S COMING?
        </h2>

        <div className="flex items-center gap-8">
          <button 
            className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors disabled:opacity-50"
            onClick={() => setCount(Math.max(1, count - 1))}
            disabled={count <= 1}
          >
            <Minus size={24} />
          </button>
          
          <div className="flex flex-col items-center justify-center w-32">
            <span className="text-7xl font-display font-medium text-gray-900">{count}</span>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mt-2">
              {count === 1 ? 'Person' : 'People'}
            </span>
          </div>

          <button 
            className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors"
            onClick={() => setCount(count + 1)}
          >
            <Plus size={24} />
          </button>
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
          className="flex-1 py-6 text-lg rounded-2xl bg-gray-900 text-white hover:bg-gray-800"
          onClick={() => onNext(count)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
