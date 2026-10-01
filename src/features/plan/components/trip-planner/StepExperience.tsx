import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/Button';

interface StepExperienceProps {
  initialActivities: string[];
  onNext: (activities: string[]) => void;
  onBack: () => void;
}

const ACTIVITIES = [
  'VIEWPOINTS',
  'WATERFALLS',
  'NATURE',
  'CAFES',
  'SHOPPING',
  'ADVENTURE',
  'LOCAL FOOD',
  'TEMPLES / SPIRITUAL',
  'MUSEUMS',
  'NIGHTLIFE'
];

export function StepExperience({ initialActivities, onNext, onBack }: StepExperienceProps) {
  const [selected, setSelected] = useState<string[]>(initialActivities || []);

  const toggleActivity = (activity: string) => {
    setSelected(prev => 
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex-1">
        <h2 className="text-3xl font-display font-medium text-gray-900 tracking-tight mb-2">
          WHAT DO YOU WANT TO DO?
        </h2>
        <p className="text-gray-500 mb-8">Select as many as you like. We'll find the best spots.</p>

        <div className="flex flex-wrap gap-3">
          {ACTIVITIES.map((activity) => {
            const isActive = selected.includes(activity);
            return (
              <button
                key={activity}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 border-2",
                  isActive
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
                onClick={() => toggleActivity(activity)}
              >
                {isActive && <Check size={16} strokeWidth={2.5} />}
                {activity}
              </button>
            );
          })}
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
          onClick={() => onNext(selected)}
        >
          {selected.length > 0 ? 'Next' : 'Skip'}
        </Button>
      </div>
    </div>
  );
}
