import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Target, Share2, MousePointerClick, TrendingUp, MonitorSmartphone, PenTool, Layout, Activity, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export function BusinessPartnerPage() {
  return (
    <div className="w-full bg-[#FAFAFA] text-[#1A1F2B] font-sans selection:bg-[#2A9D5C]/30 relative overflow-x-hidden min-h-screen z-10 flex flex-col items-center">
      {/* 
        ==================================================
        SECTION 1 — HERO
        ==================================================
      */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 lg:py-40 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center border-b border-[#E5E7EB]/50">
        <div className="flex flex-col max-w-2xl">
          <span className="text-[10px] sm:text-xs font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-6 block">
            RenoCred for Business
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-[1.1] tracking-tight mb-8">
            Acquire Customers.<br />
            <span className="text-[#2A9D5C]">Spend Less.</span> Grow More.
          </h1>
          <p className="text-lg md:text-xl text-[#4B5563] leading-relaxed mb-10 max-w-lg">
            Turn your customer acquisition budget into a measurable growth channel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact?intent=partner"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1A1F2B] text-white rounded-full font-semibold text-sm hover:bg-[#0A0D14] hover:shadow-lg transition-all"
            >
              Become a Partner <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-[#D1D5DB] text-[#1A1F2B] rounded-full font-semibold text-sm hover:bg-[#F3F4F6] transition-all"
            >
              See How It Works
            </a>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5E7EB]">
            <div className="flex flex-col items-center gap-6">
              <div className="w-full p-4 bg-[#F9FAFB] rounded-2xl flex items-center justify-between border border-[#E5E7EB]">
                <span className="font-semibold text-sm tracking-wide">Brand</span>
                <span className="text-xs text-[#6B7280] font-medium px-2 py-1 bg-white rounded border border-[#E5E7EB]">Offer</span>
              </div>
              <ArrowRight size={20} className="text-[#2A9D5C] rotate-90" />
              <div className="w-full p-4 bg-[#2A9D5C]/10 rounded-2xl flex items-center justify-between border border-[#2A9D5C]/20">
                <span className="font-semibold text-[#166534] text-sm tracking-wide">RenoCred</span>
                <span className="text-xs text-[#166534] font-medium px-2 py-1 bg-white rounded border border-[#2A9D5C]/20">Distribution</span>
              </div>
              <ArrowRight size={20} className="text-[#2A9D5C] rotate-90" />
              <div className="w-full p-4 bg-[#F9FAFB] rounded-2xl flex items-center justify-between border border-[#E5E7EB]">
                <span className="font-semibold text-sm tracking-wide">Customer</span>
                <span className="text-xs text-[#6B7280] font-medium px-2 py-1 bg-white rounded border border-[#E5E7EB]">Purchase</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ==================================================
        SECTION 2 — THE CAC PROBLEM
        ==================================================
      */}
      <section className="w-full max-w-5xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Every customer has a cost.</h2>
        <p className="text-lg text-[#4B5563] max-w-2xl mb-16">
          Brands spend on ads, influencers, agencies, content, and discounts to acquire customers.
        </p>
        
        <div className="w-full flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#1A1F2B] text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-6 relative z-10">
            ₹100
          </div>
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Total CAC</div>
          <div className="h-12 border-l-2 border-dashed border-[#D1D5DB] mb-6"></div>
          
          <div className="bg-white px-8 py-4 rounded-2xl border border-[#E5E7EB] shadow-sm mb-6 z-10 text-sm font-semibold">
            Traditional Acquisition
          </div>
          
          <div className="h-8 border-l-2 border-[#E5E7EB] mb-4"></div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['Ads', 'Content', 'Influencers', 'Platforms'].map(item => (
              <span key={item} className="px-4 py-2 bg-[#F3F4F6] text-[#4B5563] text-sm font-medium rounded-full">
                {item}
              </span>
            ))}
          </div>

          <div className="h-8 border-l-2 border-[#E5E7EB] mb-4"></div>
          <div className="bg-[#1A1F2B] px-8 py-4 rounded-2xl text-white text-sm font-semibold shadow-md">
            Customer
          </div>
        </div>
      </section>

      {/* 
        ==================================================
        SECTION 3 — THE RENO CRED MODEL
        ==================================================
      */}
      <section id="how-it-works" className="w-full bg-white border-y border-[#E5E7EB]/50 py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-16">
            RenoCred changes how that CAC is spent.
          </h2>
          
          <div className="w-full max-w-4xl relative">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#1A1F2B] text-white flex items-center justify-center text-2xl font-bold shadow-lg relative z-20">
              ₹100
            </div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-4 mb-2 text-center">Total CAC</div>
            
            {/* Desktop Connector Lines */}
            <div className="hidden md:block absolute top-[112px] left-1/2 -translate-x-1/2 w-3/4 h-12 border-t-2 border-x-2 border-[#E5E7EB] rounded-t-3xl -z-10"></div>
            
            {/* Mobile Connector Line */}
            <div className="block md:hidden h-12 border-l-2 border-[#E5E7EB] mx-auto mb-4"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 md:mt-12 relative z-10">
              
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-3xl p-6 flex flex-col items-center shadow-sm">
                <div className="text-3xl font-bold text-[#1A1F2B] mb-2">₹40</div>
                <div className="font-semibold text-sm text-[#4B5563] mb-6">RenoCred Distribution</div>
                <div className="flex flex-col gap-2 w-full">
                  <div className="text-xs text-[#6B7280] bg-white border border-[#E5E7EB] py-2 px-3 rounded-lg text-center">Website</div>
                  <div className="text-xs text-[#6B7280] bg-white border border-[#E5E7EB] py-2 px-3 rounded-lg text-center">Social</div>
                  <div className="text-xs text-[#6B7280] bg-white border border-[#E5E7EB] py-2 px-3 rounded-lg text-center">Content</div>
                </div>
              </div>

              <div className="bg-[#2A9D5C]/5 border border-[#2A9D5C]/20 rounded-3xl p-6 flex flex-col items-center shadow-sm relative md:-translate-y-4">
                <div className="text-3xl font-bold text-[#2A9D5C] mb-2">₹30</div>
                <div className="font-semibold text-sm text-[#166534] mb-6">Customer Incentive</div>
                <div className="flex flex-col gap-2 w-full">
                  <div className="text-xs text-[#166534] bg-white border border-[#2A9D5C]/20 py-2 px-3 rounded-lg text-center font-medium">Discount</div>
                  <div className="text-xs text-[#166534] bg-white border border-[#2A9D5C]/20 py-2 px-3 rounded-lg text-center font-medium">Coupon</div>
                  <div className="text-xs text-[#166534] bg-white border border-[#2A9D5C]/20 py-2 px-3 rounded-lg text-center font-medium">Exclusive Offer</div>
                </div>
              </div>

              <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-3xl p-6 flex flex-col items-center shadow-sm">
                <div className="text-3xl font-bold text-[#1A1F2B] mb-2">₹30</div>
                <div className="font-semibold text-sm text-[#4B5563] mb-6">Brand Saving</div>
                <div className="flex flex-col gap-2 w-full mt-auto">
                  <div className="text-xs font-bold text-[#1A1F2B] bg-white border border-[#E5E7EB] py-3 px-3 rounded-lg text-center shadow-sm">
                    Lower Effective CAC
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <p className="mt-16 text-xs text-[#9CA3AF] max-w-lg mx-auto">
            * Illustrative model. Actual commercial terms and savings vary by campaign.
          </p>
        </div>
      </section>

      {/* 
        ==================================================
        SECTION 4 — WHAT RENO CRED HANDLES
        ==================================================
      */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold">One partnership. One acquisition layer.</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { title: "WEBSITE", desc: "Brand + offer distribution", icon: <MonitorSmartphone size={20} /> },
            { title: "SOCIAL", desc: "Campaign amplification", icon: <Share2 size={20} /> },
            { title: "CONTENT", desc: "Creative built in-house", icon: <PenTool size={20} /> },
            { title: "OFFERS", desc: "Customer incentives", icon: <Target size={20} /> },
            { title: "TRACKING", desc: "Measure performance", icon: <BarChart3 size={20} /> },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold tracking-wider mb-2 text-[#1A1F2B]">{item.title}</h3>
              <p className="text-sm text-[#6B7280]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 
        ==================================================
        SECTION 5 — THE ACQUISITION FLOW
        ==================================================
      */}
      <section className="w-full bg-[#1A1F2B] text-white py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 relative">
            
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-[#374151] -translate-y-1/2 z-0"></div>
            
            {/* Mobile Connector Line */}
            <div className="block md:hidden absolute top-0 left-1/2 w-[1px] h-full bg-[#374151] -translate-x-1/2 z-0"></div>

            {[
              "BRAND",
              "PARTNERS WITH RENO CRED",
              "CAMPAIGN CREATED",
              "RENO CRED DISTRIBUTES",
              "CUSTOMER DISCOVERS OFFER",
              "CUSTOMER PURCHASES",
              "ACQUISITION TRACKED"
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-3 group">
                <div className="w-3 h-3 rounded-full bg-[#2A9D5C] group-hover:scale-150 transition-transform"></div>
                <div className="bg-[#242A38] border border-[#374151] px-4 py-2 rounded-lg text-xs font-semibold text-center whitespace-nowrap">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ==================================================
        SECTION 6 — TRADITIONAL VS RENO CRED
        ==================================================
      */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          <div className="flex flex-col items-center p-8 bg-[#F9FAFB] rounded-3xl border border-[#E5E7EB]">
            <h3 className="text-sm font-bold tracking-widest text-[#6B7280] mb-8 uppercase">Traditional</h3>
            <div className="flex flex-col items-center gap-3 w-full">
              {['Marketing Spend', 'Ads', 'Reach', 'Clicks', 'Conversion', 'Customer'].map((t, i) => (
                <React.Fragment key={i}>
                  <div className="px-6 py-3 w-full max-w-[240px] text-center bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold shadow-sm">
                    {t}
                  </div>
                  {i < 5 && <ArrowRight size={16} className="text-[#9CA3AF] rotate-90" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center p-8 bg-[#2A9D5C]/5 rounded-3xl border border-[#2A9D5C]/20">
            <h3 className="text-sm font-bold tracking-widest text-[#166534] mb-8 uppercase">RenoCred</h3>
            <div className="flex flex-col items-center gap-3 w-full">
              {['Partnership', 'Distribution', 'Content', 'Offer', 'Customer', 'Tracked Acquisition'].map((t, i) => (
                <React.Fragment key={i}>
                  <div className={cn(
                    "px-6 py-3 w-full max-w-[240px] text-center border rounded-xl text-sm font-semibold shadow-sm",
                    t === 'Tracked Acquisition' ? "bg-[#2A9D5C] text-white border-transparent" : "bg-white border-[#2A9D5C]/20 text-[#166534]"
                  )}>
                    {t}
                  </div>
                  {i < 5 && <ArrowRight size={16} className="text-[#2A9D5C] rotate-90" />}
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>
        <div className="mt-16 text-center">
          <h4 className="text-xl font-semibold text-[#1A1F2B]">Same objective. <span className="text-[#2A9D5C]">A different acquisition path.</span></h4>
        </div>
      </section>

      {/* 
        ==================================================
        SECTION 7 — WHY BRANDS PARTNER
        ==================================================
      */}
      <section className="w-full bg-white border-y border-[#E5E7EB]/50 py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">You're not buying impressions.</h2>
            <p className="text-xl text-[#4B5563]">You're building another path to the customer.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: "LOWER EFFECTIVE CAC", i: <TrendingUp size={24} className="text-[#2A9D5C]" /> },
              { t: "DIRECT CUSTOMER INCENTIVE", i: <GiftIcon size={24} className="text-[#2A9D5C]" /> },
              { t: "DISTRIBUTION", i: <Share2 size={24} className="text-[#2A9D5C]" /> },
              { t: "CONTENT", i: <Layout size={24} className="text-[#2A9D5C]" /> },
              { t: "SOCIAL AMPLIFICATION", i: <Megaphone size={24} className="text-[#2A9D5C]" /> },
              { t: "PERFORMANCE TRACKING", i: <Activity size={24} className="text-[#2A9D5C]" /> }
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-4 p-6 bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB]">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                  {b.i}
                </div>
                <span className="font-bold text-sm tracking-wide text-[#1A1F2B]">{b.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ==================================================
        SECTION 8 — PILOT MODEL
        ==================================================
      */}
      <section className="w-full max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Start with a pilot. Scale with proof.</h2>
        <p className="text-lg text-[#4B5563] max-w-2xl mx-auto mb-16">
          We don't ask brands to move their entire marketing budget to RenoCred. We start small, measure the economics and scale what works.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-2 flex-wrap">
          <div className="px-5 py-3 bg-[#1A1F2B] text-white text-sm font-semibold rounded-xl shadow-md">PILOT</div>
          <ArrowRight size={16} className="text-[#9CA3AF] md:rotate-0 rotate-90" />
          <div className="px-5 py-3 bg-white border border-[#E5E7EB] text-[#4B5563] text-sm font-medium rounded-xl shadow-sm">Define CAC</div>
          <ArrowRight size={16} className="text-[#9CA3AF] md:rotate-0 rotate-90" />
          <div className="px-5 py-3 bg-white border border-[#E5E7EB] text-[#4B5563] text-sm font-medium rounded-xl shadow-sm">Set Budget</div>
          <ArrowRight size={16} className="text-[#9CA3AF] md:rotate-0 rotate-90" />
          <div className="px-5 py-3 bg-white border border-[#E5E7EB] text-[#4B5563] text-sm font-medium rounded-xl shadow-sm">Create Offer</div>
          <ArrowRight size={16} className="text-[#9CA3AF] md:rotate-0 rotate-90" />
          <div className="px-5 py-3 bg-white border border-[#E5E7EB] text-[#4B5563] text-sm font-medium rounded-xl shadow-sm">Launch</div>
          <ArrowRight size={16} className="text-[#9CA3AF] md:rotate-0 rotate-90" />
          <div className="px-5 py-3 bg-white border border-[#E5E7EB] text-[#4B5563] text-sm font-medium rounded-xl shadow-sm">Measure</div>
          <ArrowRight size={16} className="text-[#9CA3AF] md:rotate-0 rotate-90" />
          <div className="px-5 py-3 bg-[#2A9D5C] text-white text-sm font-semibold rounded-xl shadow-md">Scale</div>
        </div>
      </section>

      {/* 
        ==================================================
        SECTION 9 — THE WIN-WIN
        ==================================================
      */}
      <section className="w-full bg-[#1A1F2B] text-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-medium text-[#D1D5DB]">Everyone wins when the economics work.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#242A38] border border-[#374151] rounded-3xl p-8 flex flex-col items-center text-center">
              <h3 className="text-sm font-bold tracking-widest text-[#9CA3AF] mb-6 uppercase">Brand</h3>
              <div className="text-lg font-medium mb-2">More efficient acquisition</div>
              <div className="text-[#2A9D5C] mb-2">+</div>
              <div className="text-lg font-medium">New distribution</div>
            </div>

            <div className="bg-[#2A9D5C]/10 border border-[#2A9D5C]/30 rounded-3xl p-8 flex flex-col items-center text-center relative md:-translate-y-4">
              <h3 className="text-sm font-bold tracking-widest text-[#10B981] mb-6 uppercase">Customer</h3>
              <div className="text-lg font-medium mb-2">Exclusive value</div>
              <div className="text-[#2A9D5C] mb-2">+</div>
              <div className="text-lg font-medium">Relevant offers</div>
            </div>

            <div className="bg-[#242A38] border border-[#374151] rounded-3xl p-8 flex flex-col items-center text-center">
              <h3 className="text-sm font-bold tracking-widest text-[#9CA3AF] mb-6 uppercase">RenoCred</h3>
              <div className="text-lg font-medium mb-2">Acquisition partnership</div>
              <div className="text-[#2A9D5C] mb-2">+</div>
              <div className="text-lg font-medium">Sustainable revenue</div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ==================================================
        SECTION 10 — FINAL CTA
        ==================================================
      */}
      <section className="w-full max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
          Your next customer<br />could come through RenoCred.
        </h2>
        <p className="text-xl text-[#4B5563] mb-12">
          Let's build an acquisition channel that works for both sides.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/contact?intent=partner"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#2A9D5C] text-white rounded-full font-bold text-base hover:bg-[#22824B] hover:shadow-[0_8px_30px_rgba(42,157,92,0.3)] transition-all"
          >
            Become a RenoCred Partner <ArrowRight size={18} />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white border border-[#D1D5DB] text-[#1A1F2B] rounded-full font-bold text-base hover:bg-[#F9FAFB] transition-all shadow-sm"
          >
            Talk to the Team
          </Link>
        </div>
      </section>
      
    </div>
  );
}

// Quick fallback for icons missing from normal import
function GiftIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"></polyline>
      <rect x="2" y="7" width="20" height="5"></rect>
      <line x1="12" y1="22" x2="12" y2="7"></line>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>
  );
}
