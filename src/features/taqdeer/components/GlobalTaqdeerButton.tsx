/** The way into Reni on wider screens: a quiet pill at the bottom right. */
import { X } from 'lucide-react';
import { ReniMark } from './ReniMark';
import { cn } from '../../../lib/utils';

export function GlobalTaqdeerButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Close Reni' : 'Ask Reni'}
      aria-expanded={isOpen}
      className={cn(
        'fixed bottom-6 right-6 z-[100] inline-flex h-12 items-center gap-2.5 rounded-full bg-rc-ink pl-1.5 pr-5 text-[14px] font-medium text-rc-cream',
        'shadow-[0_18px_40px_-16px_rgba(10,31,21,0.7)] ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-0.5',
      )}
    >
      {isOpen
        ? <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><X size={17} /></span>
        : <ReniMark size={36} tone="pistachio" />}
      {isOpen ? 'Close' : 'Ask Reni'}
    </button>
  );
}
