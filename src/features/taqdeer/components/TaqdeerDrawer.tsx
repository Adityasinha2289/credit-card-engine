/**
 * Reni in a panel: a sheet above the tab bar on phones, a floating panel at the
 * bottom right on wider screens. The conversation is kept while the panel is
 * closed, so reopening picks up where you left off.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ReniChat, type ReniMessage } from './ReniChat';

export function TaqdeerDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ReniMessage[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* phones: dim the page behind the sheet */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[99] bg-rc-night/50 backdrop-blur-[2px] md:hidden"
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Reni"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-[100] h-[86dvh] overflow-hidden rounded-t-[28px] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.5)] md:inset-x-auto md:bottom-24 md:right-6 md:h-[min(640px,calc(100dvh-140px))] md:w-[400px] md:rounded-[28px] md:border md:border-rc-ink/10 md:shadow-[0_40px_80px_-30px_rgba(10,31,21,0.55)]"
          >
            <div aria-hidden className="absolute left-1/2 top-2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-rc-ink/15 md:hidden" />
            <div className="h-full pb-[env(safe-area-inset-bottom)] md:pb-0">
              <ReniChat messages={messages} setMessages={setMessages} onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
