const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add back variables
const variablesPatch = `  const creditAccounts = useDashboardStore((s) => s.creditAccounts);
  const userCards = useDashboardStore((s) => s.userCards);
  const activeCardId = useDashboardStore((s) => s.activeCardId);
  const setActiveCard = useDashboardStore((s) => s.setActiveCard);
  const [benefitsCardId, setBenefitsCardId] = useState<string | null>(null);`;
  
content = content.replace('  const creditAccounts = useDashboardStore((s) => s.creditAccounts);', variablesPatch);

// 2. Insert the Cards Section before Intelligence & Actions
const cardsSection = `
      {/* ── 3. YOUR CARDS ────────────────────────────────────────── */}
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
                  className={\`snap-center shrink-0 w-[78vw] sm:w-80 flex flex-col gap-3 cursor-pointer transition-all duration-300 rounded-3xl p-3 \${isActive ? 'bg-zinc-900/50 border border-[#5D8F74]/30' : 'opacity-60 hover:opacity-100'}\`}
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

      {/* ── 4. WHAT TO DO NEXT (Intelligence & Actions) ─────────────── */}
`;

content = content.replace('{/* ── 3. WHAT TO DO NEXT (Intelligence & Actions) ─────────────── */}', cardsSection);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched cards into App.tsx");
