import { motion } from 'framer-motion';

const metrics = [
  { value: '250+', label: 'Credit Cards Supported' },
  { value: '20+', label: 'Banking Partners' },
  { value: '1000+', label: 'Merchant Categories' },
  { value: 'Live', label: 'Offer Intelligence' },
];

export function TrustSection() {
  return (
    <section className="w-full py-24 bg-[#0A0A0A] text-white relative border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="flex flex-col items-center justify-center text-center p-6"
            >
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                {metric.value}
              </h3>
              <p className="text-gray-500 font-medium text-xs md:text-sm uppercase tracking-widest max-w-[150px]">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
