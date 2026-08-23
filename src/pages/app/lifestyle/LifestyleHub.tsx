import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plane, Compass, ShoppingBag, Utensils, BookOpen, Receipt, TrendingUp, Heart, ArrowRight } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';

export default function LifestyleHub() {
  const navigate = useNavigate();

  const categories = [
    { 
      id: 'travel', 
      label: 'Travel & Flights', 
      desc: 'Maximize miles, hotel stays and travel rewards.', 
      icon: Plane, 
      path: '/app/lifestyle/plan',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop',
      level: 'hero'
    },
    { 
      id: 'dining', 
      label: 'Dining', 
      desc: 'Get the best rewards at your favourite restaurants.', 
      icon: Utensils, 
      path: '/app/lifestyle/plan/date',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop',
      level: 'secondary'
    },
    { 
      id: 'shopping', 
      label: 'Shopping', 
      desc: 'Earn more on every purchase across top brands.', 
      icon: ShoppingBag, 
      path: '/app/lifestyle/shop',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=600&auto=format&fit=crop',
      level: 'secondary'
    },
    { 
      id: 'lifestyle', 
      label: 'Lifestyle', 
      desc: 'Curated offers across fashion, wellness and premium life.', 
      icon: Compass, 
      path: '/app/lifestyle',
      image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600&auto=format&fit=crop',
      level: 'tertiary'
    },
    { 
      id: 'investment', 
      label: 'Investment', 
      desc: 'Grow your wealth with partners and smart reward strategies.', 
      icon: TrendingUp, 
      path: '/app/lifestyle/invest',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop',
      level: 'tertiary'
    },
    { 
      id: 'learning', 
      label: 'Learning', 
      desc: 'Pay less, learn more with exclusive offers on courses.', 
      icon: BookOpen, 
      path: '/app/lifestyle/invest',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop',
      level: 'tertiary'
    },
    { 
      id: 'debt', 
      label: 'Debt', 
      desc: 'Smart tools and offers to help you manage and repay better.', 
      icon: Receipt, 
      path: '/app/credit/advisor',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop',
      level: 'tertiary'
    },
    { 
      id: 'hobbies', 
      label: 'Hobbies', 
      desc: 'From gadgets to gear, rewards for what you love.', 
      icon: Heart, 
      path: '/app/lifestyle',
      image: 'https://images.unsplash.com/photo-1511871893393-82ce9c2aa4bf?q=80&w=600&auto=format&fit=crop',
      level: 'tertiary'
    },
  ];

  const heroCategory = categories.find(c => c.level === 'hero');
  const secondaryCategories = categories.filter(c => c.level === 'secondary');
  const tertiaryCategories = categories.filter(c => c.level === 'tertiary');

  return (
    <PageContainer
      eyebrow="Marketplace"
      title="Lifestyle & Experiences"
      subtitle="Curated offers and partner rewards across categories that matter to you."
      className="text-gray-900 font-body"
    >
      <div className="w-full flex flex-col gap-10 relative">
        {/* Global Background Atmosphere: Obsidian */}
        <div className="fixed inset-0 pointer-events-none z-[-1] bg-white" />

        {/* HERO SURFACE */}
        {heroCategory && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(heroCategory.path)}
              className="group relative h-[380px] md:h-[480px] rounded-[32px] overflow-hidden border border-gray-300 bg-white transition-transform duration-300 hover:-translate-y-[2px] shadow-lg hover:shadow-[#2A9D5C]/5 cursor-pointer flex flex-col justify-end"
            >
              <div className="absolute inset-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url('${heroCategory.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#050806]/10 via-[#050806]/60 to-[#050806] transition-opacity duration-300 group-hover:opacity-90" />
              </div>
              
              <div className="relative z-10 p-8 md:p-12 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-full border border-[#2A9D5C]/20 flex items-center justify-center bg-[#071A11]/60 backdrop-blur-md transition-colors duration-300 group-hover:border-[#2A9D5C]/40">
                  <heroCategory.icon className="w-5 h-5 text-[#2A9D5C]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-display font-medium text-gray-900 mb-2">{heroCategory.label}</h3>
                  <p className="text-base md:text-lg text-gray-600 max-w-lg">{heroCategory.desc}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-[#2A9D5C] mt-2 group-hover:text-gray-900 transition-colors">
                  Explore {heroCategory.label} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* SECONDARY SURFACES */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secondaryCategories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (idx * 0.1) }}
              onClick={() => navigate(cat.path)}
              className="group relative h-[280px] rounded-[24px] overflow-hidden border border-gray-300 bg-white transition-all duration-300 hover:border-[#2A9D5C]/20 hover:bg-gray-50 hover:-translate-y-[2px] cursor-pointer flex flex-col justify-end"
            >
              {cat.image && (
                <div className="absolute inset-x-0 top-0 h-[60%] overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    style={{ backgroundImage: `url('${cat.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#07120D]" />
                </div>
              )}
              
              <div className="relative z-10 p-6 md:p-8 flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50">
                    <cat.icon className="w-3.5 h-3.5 text-gray-700" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">{cat.label}</h3>
                </div>
                <p className="text-sm text-gray-600">{cat.desc}</p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mt-1 group-hover:text-[#2A9D5C] transition-colors">
                  Explore <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* TERTIARY SURFACES */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tertiaryCategories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (idx * 0.05) }}
                onClick={() => navigate(cat.path)}
                className="group relative h-[180px] rounded-[24px] overflow-hidden border border-gray-300 bg-white transition-all duration-300 hover:border-[#2A9D5C]/20 hover:bg-gray-50 hover:-translate-y-[2px] cursor-pointer flex flex-col justify-end"
              >
                {cat.image && (
                  <div className="absolute inset-x-0 top-0 h-[60%] overflow-hidden opacity-40 group-hover:opacity-80 transition-opacity">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url('${cat.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#07120D]" />
                  </div>
                )}
                
                <div className="relative z-10 p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50">
                      <cat.icon className="w-3.5 h-3.5 text-gray-700 group-hover:text-[#2A9D5C] transition-colors" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-base font-medium text-gray-900">{cat.label}</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </PageContainer>
  );
}
