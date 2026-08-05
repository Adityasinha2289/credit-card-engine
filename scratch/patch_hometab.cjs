const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the Next Actions & Intelligence section to include recommendations and insights
const newSection = `
      {/* ── 3. WHAT TO DO NEXT (Intelligence & Actions) ─────────────── */}
      <section>
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-6">
          Intelligence & Actions
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Immediate Actions */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800/50 pb-2">Quick Actions</h3>
              <ul className="space-y-3">
                {quickActions.map((action, i) => (
                  <li key={i} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{action}</span>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-[#5D8F74] transition-colors" />
                  </li>
                ))}
                <li className="flex items-center justify-between group cursor-pointer pt-2" onClick={() => setShowAddModal(true)}>
                  <span className="text-sm font-medium text-[#5D8F74]">Add Another Card</span>
                  <Plus size={14} className="text-[#5D8F74]" />
                </li>
              </ul>
            </div>

            {isLiveOffersEnabled && bestOffer && (
              <div>
                <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800/50 pb-2">Best Offer</h3>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 p-1 shrink-0 flex items-center justify-center">
                    <img src={bestOffer.merchant.logo} alt={bestOffer.merchant.name} className="w-full h-full object-contain rounded-md" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white leading-tight mb-1">{bestOffer.offer.title}</p>
                    <p className="text-[11px] text-zinc-400">Save up to ₹{bestOffer.estimatedSavings.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Recommended Strategies */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800/50 pb-2">Strategic Recommendations</h3>
              <div className="space-y-4">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="border-l border-zinc-800 pl-4 py-1">
                    <p className="text-[10px] text-[#5D8F74] uppercase tracking-wider font-semibold mb-1">{rec.category.replace('_', ' ')} • {rec.confidence}% Match</p>
                    <p className="text-sm text-white font-medium mb-1">{rec.title}</p>
                    <p className="text-xs text-zinc-400 line-clamp-2">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-[10px] uppercase font-semibold text-[#5D8F74] tracking-wider mb-2">Tip of the Day</h3>
              <p className="text-xs text-zinc-400 leading-relaxed border-l-2 border-[#5D8F74]/30 pl-3">{tipOfTheDay.summary}</p>
            </div>
          </div>

          {/* Column 3: Financial Insights */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800/50 pb-2">Behavioural Insights</h3>
              <div className="space-y-4">
                {insights.slice(0, 3).map((ins) => (
                  <div key={ins.id} className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{ins.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-white font-medium mb-1">{ins.title}</p>
                    <p className="text-xs text-zinc-400 mb-2">{ins.description}</p>
                    {ins.actionableText && (
                      <p className="text-[10px] text-[#5D8F74] font-medium flex items-center justify-between">
                        {ins.actionableText} <ChevronRight size={12} />
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-4 border-b border-zinc-800/50 pb-2">Featured Card Intelligence</h3>
              <p className="text-sm font-medium text-white leading-tight mb-1">{featuredCard.cardName}</p>
              <p className="text-[11px] text-zinc-400 mb-2">{featuredCard.issuer} • {featuredCard.topBenefit}</p>
            </div>
          </div>

        </div>
      </section>
`;

// Replace the old section 3 with the new one
const oldSectionStart = content.indexOf('{/* ── 3. WHAT TO DO NEXT (Intelligence & Actions) ─────────────── */}');
const nextSectionStart = content.indexOf('{/* Dynamic Searchable Add Card Modal */}');
if (oldSectionStart !== -1 && nextSectionStart !== -1) {
  content = content.substring(0, oldSectionStart) + newSection + '\n      ' + content.substring(nextSectionStart);
}

// Remove unused state variables that the linter complained about
content = content.replace(/const \[isBooting, setIsBooting\] = useState\(true\);/g, '');
content = content.replace(/const activeCardId   = useDashboardStore\(\(s\) => s\.activeCardId\);/g, '');
content = content.replace(/const setActiveCard  = useDashboardStore\(\(s\) => s\.setActiveCard\);/g, '');
content = content.replace(/const userCards      = useDashboardStore\(\(s\) => s\.userCards\);/g, '');
content = content.replace(/const deleteUserCard = useDashboardStore\(\(s\) => s\.deleteUserCard\);/g, '');
content = content.replace(/const persona = usePersona\(\);/g, '');
content = content.replace(/const motivationBanner = PersonalizationEngine\.getMotivationBanner\(profile\);/g, '');
content = content.replace(/const \[deleteCardId, setDeleteCardId\] = useState<string \| null>\(null\);/g, '');
content = content.replace(/const \[deleteCardLabel, setDeleteCardLabel\] = useState<string>\(''\);/g, '');
content = content.replace(/const \[benefitsCardId, setBenefitsCardId\] = useState<string \| null>\(null\);/g, '');
content = content.replace(/const activeCard     = userCards\.find\(\(c\) => c\.id === activeCardId\) \|\| userCards\[0\];/g, '');
content = content.replace(/const activeAccount  = creditAccounts\.find\(\(a\) => a\.cardId === activeCardId\);/g, '');
content = content.replace(/const liveBalance    = activeAccount \? activeAccount\.currentBalance : 0;/g, '');

// also remove the `// Simulate network fetching to display premium skeleton loading` effect block
const effectStart = content.indexOf('// Simulate network fetching to display premium skeleton loading');
const effectEnd = content.indexOf('}, []);', effectStart) + 7;
if (effectStart !== -1) {
  content = content.substring(0, effectStart) + content.substring(effectEnd);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched HomeTab in App.tsx!");
