import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/Button';

interface StepDatesProps {
  initialDeparture: string | null;
  initialReturn: string | null;
  initialTripType: 'one-way' | 'round-trip';
  onNext: (departure: string, returnDate: string | null, tripType: 'one-way' | 'round-trip') => void;
  onBack: () => void;
}

export function StepDates({ initialDeparture, initialReturn, initialTripType, onNext, onBack }: StepDatesProps) {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>(initialTripType);
  const [departure, setDeparture] = useState(initialDeparture || '');
  const [returnDate, setReturnDate] = useState(initialReturn || '');

  // Local date helper to avoid UTC bugs
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  const minDate = new Date(today.getTime() - offset).toISOString().split('T')[0];

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex-1">
        <h2 className="text-3xl font-display font-medium text-gray-900 tracking-tight mb-8">
          WHEN ARE YOU GOING?
        </h2>

        {/* Trip Type Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium rounded-xl transition-colors",
              tripType === 'one-way' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
            onClick={() => {
              setTripType('one-way');
              setReturnDate('');
            }}
          >
            One-way
          </button>
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium rounded-xl transition-colors",
              tripType === 'round-trip' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
            onClick={() => setTripType('round-trip')}
          >
            Round trip
          </button>
        </div>

        {/* Dates */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                min={minDate}
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-semantic-brand/50 focus:border-semantic-brand transition-all"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
              />
            </div>
          </div>

          {tripType === 'round-trip' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">Return Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  min={departure || minDate}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-semantic-brand/50 focus:border-semantic-brand transition-all"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </motion.div>
          )}
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
          disabled={
            !departure || 
            departure < minDate || 
            (tripType === 'round-trip' && (!returnDate || returnDate < departure))
          }
          onClick={() => onNext(departure, tripType === 'round-trip' ? returnDate : null, tripType)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
