import { motion } from 'framer-motion';

const STORIES = [
  {
    image: 'https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&q=80',
    quote: 'Flew Qsuites to Doha. Paid $0.',
    colSpan: 'md:col-span-2',
    rowSpan: 'md:row-span-2'
  },
  {
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80',
    quote: 'Unlocked Marriott Titanium in 3 months.',
    colSpan: 'md:col-span-1',
    rowSpan: 'md:row-span-1'
  },
  {
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80',
    quote: 'Taj Epicure dining perks every weekend.',
    colSpan: 'md:col-span-1',
    rowSpan: 'md:row-span-1'
  },
  {
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80',
    quote: '4 free domestic flights this year.',
    colSpan: 'md:col-span-2',
    rowSpan: 'md:row-span-1'
  }
];

export function LifestyleStorytellingSection() {
  return (
    <section className="py-24 md:py-32 bg-editorial-light-cream text-editorial-deep-forest relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-serif font-medium tracking-tight mb-6">
            Beyond the Math. The Lifestyle.
          </h2>
          <p className="text-editorial-muted-sage text-lg md:text-xl font-light leading-relaxed">
            RenoCred isn’t just about numbers; it’s about what those numbers unlock. Experience the true power of an optimized wallet.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[250px]">
          {STORIES.map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className={`relative rounded-3xl overflow-hidden group cursor-pointer ${story.colSpan} ${story.rowSpan} min-h-[250px]`}
            >
              <div className="absolute inset-0 bg-editorial-deep-forest" />
              <img 
                src={story.image} 
                alt={story.quote} 
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <p className="text-white font-serif text-xl md:text-2xl font-medium leading-tight">
                  "{story.quote}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
