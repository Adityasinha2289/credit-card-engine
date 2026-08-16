const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Find the start and end of HomeTab
const startIndex = content.indexOf('function HomeTab() {');
let braceCount = 0;
let endIndex = -1;
let started = false;

for (let i = startIndex; i < content.length; i++) {
  if (content[i] === '{') {
    braceCount++;
    started = true;
  } else if (content[i] === '}') {
    braceCount--;
    if (started && braceCount === 0) {
      endIndex = i;
      break;
    }
  }
}

// Extract everything inside HomeTab before `return (`
const returnIndex = content.indexOf('return (', startIndex);
const hookCode = content.substring(startIndex, returnIndex);

const updatedHookCode = hookCode.replace(
  'const availablePoints = rewards.totalPoints - rewards.redeemedPoints;',
  `const availablePoints = rewards.totalPoints - rewards.redeemedPoints;
  const totalOutstanding = creditAccounts.reduce((acc, account) => acc + account.currentBalance, 0);`
);

// We'll rewrite the JSX return completely.
const newJSX = `return (
    <div className="max-w-4xl mx-auto pb-24 text-text-primary bg-black min-h-screen">
      
      {/* ── 1. GREETINGS & SAVINGS ────────────────────────────────────── */}
      <section className="mb-12 pt-8">
        <header className="mb-8">
          <p className="text-[#5D8F74] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
            <Sparkles size={12} /> Executive Briefing
          </p>
          <h1 className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-white mb-3 leading-tight">
            {getGreeting()}, {profile?.name?.split(' ')[0] || 'there'}.
          </h1>
          <p className="text-lg text-zinc-400 font-light max-w-2xl leading-relaxed mb-8">
            {contextualSentence}
          </p>
          
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 mb-8 inline-block pr-16">
            <p className="text-xs uppercase font-semibold text-zinc-500 tracking-wider mb-2">Total Savings via RenoCred</p>
            <p className="text-5xl font-display font-bold text-white tabular-nums tracking-tight">
              ₹{ledgerSummary.totalSavings.toLocaleString('en-IN')}
            </p>
          </div>
        </header>

        {/* Taqdeer Briefing integrated directly */}
        <div className="border-l-2 border-[#5D8F74] pl-6 py-1 mb-8">
          <h3 className="text-xl font-medium text-white mb-2 tracking-tight">
            {decision.title}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4 max-w-2xl">
            {decision.summary}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-medium text-[#5D8F74]">
              {decision.estimatedImpact.savings
                ? \\\`+ ₹\${decision.estimatedImpact.savings.toLocaleString('en-IN')} /yr\\\`
                : decision.estimatedImpact.rewards
                ? \\\`+\${decision.estimatedImpact.rewards.toLocaleString()} pts\\\`
                : 'High Impact'}
            </span>
            <span className="text-zinc-600 font-medium uppercase tracking-wider text-[10px]">
              {decision.confidence}% Match • {decision.estimatedImpact.timeFrame.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* High Priority Alerts */}
        {highestPriorityAlert && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">{highestPriorityAlert.title}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{highestPriorityAlert.message}</p>
              </div>
            </div>
            <button className="text-[10px] uppercase tracking-wider font-bold text-red-400 hover:text-red-300 transition-colors">
              {highestPriorityAlert.action}
            </button>
          </div>
        )}
      </section>

      {/* ── 2. YOUR CARDS ────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-6">
          Your Cards
        </h2>
        
        {userCards.length === 0 ? (
          <div className="border border-zinc-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-zinc-400 mb-4">You have no active credit cards.</p>
            <button onClick={() => setShowAddModal(true)} className="text-sm font-medium text-[#5D8F74] hover:text-[#4a725c] transition-colors">
              + Add a Card
            </button>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
            {userCards.map((card) => {
              const account = creditAccounts.find((a) => a.cardId === card.id);
              const cardWithLiveCredit = {
                ...card,
                creditLimit: account ? account.totalLimit : card.creditLimit,
                availableCredit: account
                  ? Math.max(0, account.totalLimit - account.currentBalance)
                  : card.availableCredit,
              };
              const isActive = activeCardId === card.id;

              return (
                <div 
                  key={card.id} 
                  onClick={() => setActiveCard(card.id)}
                  className={\\\`snap-center shrink-0 w-[78vw] sm:w-80 flex flex-col gap-3 cursor-pointer transition-all duration-300 rounded-3xl p-3 \${isActive ? 'bg-zinc-900/50 border border-[#5D8F74]/30' : 'opacity-60 hover:opacity-100'}\\\`}
                >
                  <div className="flex items-center justify-between px-1 gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-500 truncate">
                        {card.label || 'Credit Card'}
                      </span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#5D8F74] flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-semibold text-[#5D8F74] bg-[#5D8F74]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {formatCents(cardWithLiveCredit.availableCredit)} avail.
                      </span>
                    </div>
                  </div>
                  <ActiveCard card={cardWithLiveCredit} revealed={false} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <hr className="border-zinc-800/50 my-12" />

      {/* ── 3. FINANCIAL STATUS ──────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-6">
          Financial Status
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
          
          {/* Total Outstanding */}
          <div>
            <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-2">Total Outstanding</p>
            <p className="text-3xl font-display font-medium text-white tabular-nums tracking-tight">
              {formatCents(totalOutstanding)}
            </p>
          </div>

          {/* Total Rewards */}
          <div>
            <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-2">Total Reward Points</p>
            <p className="text-3xl font-display font-medium text-[#5D8F74] tabular-nums tracking-tight">
              {availablePoints.toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1 capitalize">{rewards.tier} Tier</p>
          </div>

          {/* Credit Health */}
          <div>
            <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-2">Credit Health</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-display font-medium text-white tabular-nums tracking-tight">
                {health.score}
              </p>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Grade {health.grade}</span>
            </div>
          </div>

        </div>

        {/* Ledger Recent Win */}
        {recentWin && (
          <p className="text-xs text-zinc-400 leading-relaxed border-l border-zinc-800 pl-4 mt-8">
            <span className="text-[#5D8F74] font-semibold">Recent Win: </span> 
            {recentWin.explanation} (+₹{recentWin.estimatedSavings})
          </p>
        )}
      </section>

      <hr className="border-zinc-800/50 my-12" />

      {/* ── 4. WHAT TO DO NEXT (Intelligence & Actions) ─────────────── */}
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

      {/* Dynamic Searchable Add Card Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Suspense fallback={null}>
              <AddCardModal onClose={() => setShowAddModal(false)} />
            </Suspense>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );\n}\n`;

const finalContent = content.substring(0, startIndex) + updatedHookCode + newJSX + content.substring(endIndex + 1);

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log("Successfully updated layout!");
