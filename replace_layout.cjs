const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '{/* ── Greeting ──────────────────────────────────────────────── */}';
const endMarker = '{/* Dynamic Searchable Add Card Modal */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found");
  process.exit(1);
}

const newLayout = `
      {/* ── HEADER: Greeting ────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-ink-primary">
          {getGreeting()}, <span className="text-gradient-brand">{profile?.name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p className="text-sm text-ink-secondary mt-1 font-medium">
          {contextualSentence}
        </p>
      </div>

      {/* ── WHAT NEEDS MY ATTENTION? ────────────────────────────── */}
      <section className="mb-10">
        <div className="mb-4">
          <p className="text-ink-tertiary text-xs font-semibold tracking-[0.2em] uppercase">Attention Required</p>
        </div>
        
        {highestPriorityAlert && (
          <div className="panel-glass rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-caution/20 bg-caution/5 text-left shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-caution/10 text-caution flex items-center justify-center font-bold shrink-0 border border-caution/20">
                <Zap size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-caution">
                    {highestPriorityAlert.priority} ALERT
                  </span>
                </div>
                <h4 className="text-sm font-bold text-ink-primary leading-tight mt-0.5">
                  {highestPriorityAlert.title}
                </h4>
                <p className="text-xs text-ink-tertiary mt-0.5">
                  {highestPriorityAlert.message}
                </p>
              </div>
            </div>
            <button className="shrink-0 self-end sm:self-auto px-3.5 py-1.5 rounded-xl bg-caution/10 hover:bg-caution/20 text-caution text-xs font-bold transition-colors">
              {highestPriorityAlert.action}
            </button>
          </div>
        )}

        {isLiveOffersEnabled && bestOffer && (
          <div className="panel-glass rounded-2xl p-5 mb-4 border border-canvas-200/50 dark:border-white/[0.05] shadow-xl text-left relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-brand-500">
                  LIVE OFFER
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-profit/10 text-profit border border-profit/20">
                  {bestOffer.confidence}% Match
                </span>
              </div>
              <span className="text-[10px] font-semibold text-ink-tertiary">
                Ends {new Date(bestOffer.offer.validity).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-canvas-200 dark:bg-white/10 p-1 flex items-center justify-center shrink-0 border border-canvas-300 dark:border-white/10">
                  <img src={bestOffer.merchant.logo} alt={bestOffer.merchant.name} className="w-full h-full object-contain rounded-lg" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink-primary leading-tight">
                    {bestOffer.offer.title}
                  </h4>
                  <p className="text-xs text-ink-tertiary mt-0.5">
                    <span className="font-semibold text-ink-secondary">{bestOffer.merchant.name}</span> • Eligible: <span className="font-semibold text-ink-secondary">Partner Cards</span>
                  </p>
                </div>
              </div>

              <div className="self-end md:self-auto shrink-0 text-right">
                <p className="text-[10px] uppercase font-bold text-ink-tertiary">Estimated Savings</p>
                <p className="text-sm font-bold text-profit">
                  ₹{bestOffer.estimatedSavings.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── WHAT SHOULD I DO NEXT? ────────────────────────────── */}
      <section className="mb-10">
        <div className="mb-4">
          <p className="text-ink-tertiary text-xs font-semibold tracking-[0.2em] uppercase">What to do next</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 panel-glass rounded-3xl p-6 border border-brand-500/30 shadow-2xl relative overflow-hidden bg-gradient-to-br from-brand-500/10 via-surface to-brand-500/5 text-left">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shrink-0 shadow-ag-glow-primary">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-brand-500">
                    TAQDEER'S PICK
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-profit/10 text-profit border border-profit/20">
                {decision.confidence}% Match
              </span>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-display font-extrabold text-ink-primary tracking-tight mb-2">
                {decision.title}
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed font-medium">
                {decision.summary}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 p-3.5 rounded-2xl bg-canvas-200/50 dark:bg-white/[0.04] border border-canvas-200/60 dark:border-white/[0.05]">
                <span className="text-[10px] uppercase font-bold text-ink-tertiary">Impact</span>
                <p className="text-sm font-bold text-brand-500 mt-0.5">
                  {decision.estimatedImpact.savings
                    ? \`₹\${decision.estimatedImpact.savings.toLocaleString('en-IN')} savings\`
                    : decision.estimatedImpact.rewards
                    ? \`\${decision.estimatedImpact.rewards.toLocaleString()} pts\`
                    : 'High Protection'}
                </p>
              </div>
              <div className="flex-1 p-3.5 rounded-2xl bg-canvas-200/50 dark:bg-white/[0.04] border border-canvas-200/60 dark:border-white/[0.05]">
                <span className="text-[10px] uppercase font-bold text-ink-tertiary">Timeframe</span>
                <p className="text-sm font-semibold text-ink-secondary capitalize mt-0.5">
                  {decision.estimatedImpact.timeFrame.replace('_', ' ')}
                </p>
              </div>
            </div>
            
            <p className="text-xs text-ink-secondary leading-relaxed">
              <span className="font-bold text-ink-primary">Why: </span>
              {decision.explanation}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="panel-glass rounded-2xl p-4 border border-canvas-200/50 dark:border-white/[0.05] shadow-lg text-left">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-brand-500 mb-3 block">
                Quick Actions
              </span>
              <div className="flex flex-col gap-2">
                {quickActions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-canvas-200/50 dark:border-white/[0.05] hover:border-brand-500/30 bg-canvas-50 dark:bg-white/[0.02] cursor-pointer transition-all"
                  >
                    <div className="w-6 h-6 rounded-md bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                      <Zap size={14} />
                    </div>
                    <span className="text-xs font-bold text-ink-primary truncate">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-glass rounded-2xl p-4 flex-1 border border-canvas-200/50 dark:border-white/[0.05] shadow-lg text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-brand-500">
                    Card Intel
                  </span>
                </div>
                <h4 className="text-sm font-bold text-ink-primary leading-tight mt-0.5">
                  {featuredCard.cardName}
                </h4>
                <p className="text-[11px] text-ink-tertiary mt-1">
                  {featuredCard.topBenefit}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-canvas-200/50 dark:border-white/[0.05] flex justify-between items-center">
                <span className="text-[10px] text-ink-tertiary">Fee</span>
                <span className="text-xs font-bold text-ink-primary">₹{featuredCard.annualFee.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT HAPPENED? (Context & Status) ───────────────────── */}
      <section>
        <div className="mb-4">
          <p className="text-ink-tertiary text-xs font-semibold tracking-[0.2em] uppercase">Context & Status</p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="panel-glass rounded-3xl p-5 border border-canvas-200/50 dark:border-white/[0.06] shadow-lg text-left relative overflow-hidden bg-gradient-to-br from-brand-500/10 via-surface to-profit/5">
                <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-brand-500 block mb-3">
                  Lifetime Value
                </span>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-tertiary">Estimated Savings</span>
                    <p className="text-2xl font-display font-bold text-profit mt-1">
                      ₹{ledgerSummary.totalSavings.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-tertiary">Reward Points</span>
                    <p className="text-xl font-display font-bold text-brand-500 mt-1">
                      {ledgerSummary.totalRewards.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="panel-glass rounded-2xl p-4 flex-1 border border-canvas-200/50 dark:border-white/[0.06] shadow-lg bg-gradient-to-br from-profit/10 via-surface to-brand-500/5 text-left">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-profit">
                      Financial Health
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-profit text-white shadow-ag-glow-profit">
                      {health.score}/100
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-ink-primary mt-1">
                    {health.strengths[0] || 'Profile Completeness: High accuracy'}
                  </p>
                </div>
                
                {recentWin && (
                  <div className="panel-glass rounded-2xl p-4 border border-profit/20 flex flex-col justify-center bg-profit/5 text-left">
                    <span className="text-[10px] uppercase font-bold text-profit tracking-wider mb-1">Recent Win</span>
                    <p className="text-[11px] font-semibold text-ink-primary">
                      {recentWin.explanation}
                    </p>
                    <span className="text-xs font-bold text-profit mt-1">
                      +₹{recentWin.estimatedSavings}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Section */}
            <div className="pt-4 border-t border-canvas-200/50 dark:border-white/[0.05]">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-display font-bold text-ink-primary">Your Wallet</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-xs font-bold text-brand-500 hover:text-brand-400 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add Card
                </button>
              </div>

              {isBooting ? (
                <div className="flex overflow-x-hidden gap-4 pb-4">
                  <Skeleton className="w-[280px] h-[180px] shrink-0 rounded-3xl" />
                  <Skeleton className="w-[280px] h-[180px] shrink-0 rounded-3xl hidden sm:block" />
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x snap-mandatory px-1">
                  {userCards.length === 0 ? (
                    <div className="w-full text-center py-8">
                      <p className="text-xs text-ink-tertiary mb-3">No cards in your wallet yet.</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold py-2 px-4 rounded-full"
                      >
                        Add Card
                      </button>
                    </div>
                  ) : (
                    userCards.map((card) => {
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
                        <motion.div
                          key={card.id}
                          onClick={() => setActiveCard(card.id)}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'snap-center shrink-0 w-[280px] flex flex-col gap-2 cursor-pointer transition-all duration-300 rounded-[2rem] p-3 border',
                            isActive
                              ? 'opacity-100 border-brand-500/50 bg-surface/40 shadow-lg'
                              : 'opacity-70 border-transparent hover:opacity-100 hover:bg-surface/20'
                          )}
                        >
                          <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-semibold tracking-wider uppercase text-ink-tertiary truncate">
                              {card.label || 'Credit Card'}
                            </span>
                            <span className="text-[10px] font-semibold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">
                              {formatCents(cardWithLiveCredit.availableCredit)} avail
                            </span>
                          </div>
                          <ActiveCard card={cardWithLiveCredit} revealed={false} />
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="xl:sticky xl:top-24 flex flex-col gap-6">
            {isBooting ? (
              <>
                <Skeleton className="h-[280px] w-full rounded-3xl" />
                <Skeleton className="h-[400px] w-full rounded-3xl" />
              </>
            ) : (
              <>
                <Suspense fallback={null}><SpendingAnalytics /></Suspense>
                <div className="panel-glass rounded-3xl p-5">
                  <TransactionFeed limit={8} />
                </div>
              </>
            )}
          </aside>
        </div>
      </section>

      `;

const finalContent = content.substring(0, startIndex) + newLayout + content.substring(endIndex);
fs.writeFileSync(file, finalContent);
console.log("Successfully rewrote HomeTab");
