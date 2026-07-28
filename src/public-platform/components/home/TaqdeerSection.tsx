import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const conversation = [
  {
    id: 1,
    type: 'user',
    text: '₹4,000 Amazon',
    delay: 0.5,
  },
  {
    id: 2,
    type: 'ai',
    card: 'Amazon Pay ICICI',
    save: 'Save ₹200',
    details: ['5% Cashback', 'Better than HDFC Millennia'],
    delay: 1.5,
  },
  {
    id: 3,
    type: 'user',
    text: 'Uber to Airport',
    delay: 4,
  },
  {
    id: 4,
    type: 'ai',
    card: 'Axis ACE',
    save: '₹35 Saved',
    details: ['5% Cashback on Uber'],
    delay: 5,
  },
  {
    id: 5,
    type: 'user',
    text: '₹15,000 Flight Ticket',
    delay: 7.5,
  },
  {
    id: 6,
    type: 'ai',
    card: 'Axis Atlas',
    save: 'Earn 5X Miles',
    details: ['Best for Travel Bookings'],
    delay: 8.5,
  },
];

export function TaqdeerSection() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    
    // Auto-play sequence
    const playSequence = () => {
      setVisibleMessages([]);
      conversation.forEach((msg) => {
        const t = setTimeout(() => {
          setVisibleMessages(prev => [...prev, msg.id]);
        }, msg.delay * 1000);
        timeouts.push(t);
      });
      
      // Loop
      const loop = setTimeout(playSequence, 12000);
      timeouts.push(loop);
    };

    playSequence();

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <section className="w-full py-32 bg-[#050505] text-white relative">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#00E599]/10 text-[#00E599] px-4 py-2 rounded-full font-medium text-sm mb-6"
          >
            <Sparkles className="w-4 h-4" /> Meet TAQDEER
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold tracking-tight"
          >
            Your Personal Financial Intelligence.
          </motion.h2>
        </div>

        {/* Chat Interface */}
        <div className="bg-[#0B0B0D] border border-white/5 rounded-[2rem] p-4 md:p-8 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-end">
          
          <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto z-10 relative">
            <AnimatePresence>
              {conversation.map((msg) => {
                if (!visibleMessages.includes(msg.id)) return null;

                if (msg.type === 'user') {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex justify-end"
                    >
                      <div className="bg-[#1A1A1A] text-white px-6 py-4 rounded-3xl rounded-tr-sm max-w-[80%] border border-white/5">
                        <p className="text-lg font-medium">{msg.text}</p>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-4 max-w-[85%]">
                      <div className="w-10 h-10 rounded-full bg-[#00E599]/10 flex items-center justify-center shrink-0 border border-[#00E599]/20">
                        <Sparkles className="w-5 h-5 text-[#00E599]" />
                      </div>
                      <div className="bg-gradient-to-br from-[#00E599]/10 to-transparent border border-[#00E599]/20 p-5 rounded-3xl rounded-tl-sm backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-white font-bold text-lg">{msg.card}</p>
                          <span className="bg-[#00E599] text-[#0B0B0D] px-2 py-0.5 rounded text-xs font-bold">
                            {msg.save}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-gray-400">
                          {msg.details?.map((detail, idx) => (
                            <p key={idx} className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-[#00E599]" />
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {/* Typing indicator placeholder if waiting for AI */}
            <AnimatePresence>
              {visibleMessages.length % 2 !== 0 && visibleMessages.length < conversation.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-4 mt-2"
                >
                  <div className="w-10 h-10 rounded-full bg-[#00E599]/5 flex items-center justify-center shrink-0 border border-[#00E599]/10">
                    <Sparkles className="w-5 h-5 text-[#00E599]/50" />
                  </div>
                  <div className="bg-[#1A1A1A] px-6 py-4 rounded-3xl rounded-tl-sm flex items-center gap-1 border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Subtle gradient overlay at bottom for smooth visual */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0B0B0D] to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
