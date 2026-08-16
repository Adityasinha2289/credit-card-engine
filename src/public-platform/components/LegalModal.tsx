import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export type LegalDocType = 'editorial' | 'affiliate' | 'privacy' | 'terms' | 'disclaimer' | null;

interface LegalModalProps {
  doc: LegalDocType;
  onClose: () => void;
}

const docs = {
  editorial: {
    title: "Editorial Policy & Independence Standards",
    content: (
      <div className="space-y-5 text-[15px] text-gray-300 leading-relaxed font-serif">
        <p><strong>1. STATEMENT OF INDEPENDENCE:</strong> RenoCred operates under strict structural guidelines to maintain absolute editorial independence. Our algorithms, credit card rankings, and value projections are governed exclusively by mathematical modeling of publicly available banking data.</p>
        <p><strong>2. NON-INTERFERENCE CLAUSE:</strong> Commercial partnerships, affiliate relationships, or advertising agreements do not, under any circumstance, influence our proprietary recommendation engine. Financial institutions cannot purchase preferential placement in our optimized recommendations.</p>
        <p><strong>3. DATA INTEGRITY:</strong> We employ rigorous validation protocols to ensure the accuracy of reward structures, fees, and interest rates. However, users are strictly advised to review the official terms and conditions provided by the respective financial institution prior to executing any financial product application.</p>
      </div>
    )
  },
  affiliate: {
    title: "Affiliate Disclosure & Commercial Relations",
    content: (
      <div className="space-y-5 text-[15px] text-gray-300 leading-relaxed font-serif">
        <p><strong>1. COMMERCIAL COMPENSATION:</strong> In accordance with prevailing regulatory guidelines, RenoCred hereby discloses that it may maintain commercial agreements with certain financial institutions, issuers, and credit networks mentioned on this platform.</p>
        <p><strong>2. NATURE OF REMUNERATION:</strong> RenoCred may receive monetary compensation when a user navigates to an external banking portal via our platform and successfully completes a financial product application. This remuneration sustains our infrastructure and analytical operations.</p>
        <p><strong>3. NO IMPACT ON ANALYTICS:</strong> Such commercial remuneration bears no impact on our computational algorithms. Our value-maximization models remain objectively agnostic to affiliate payouts.</p>
      </div>
    )
  },
  privacy: {
    title: "Privacy Policy & Data Processing Agreement",
    content: (
      <div className="space-y-5 text-[15px] text-gray-300 leading-relaxed font-serif">
        <p><strong>1. DATA COLLECTION & MINIMIZATION:</strong> RenoCred adheres to stringent data minimization principles. We collect only the cryptographic and analytical telemetry required to render personalized financial optimization.</p>
        <p><strong>2. NON-DISCLOSURE OF FINANCIAL TELEMETRY:</strong> We explicitly prohibit the sale, leasing, or unauthorized distribution of user-specific spending profiles to third-party marketing entities. User data is processed strictly within our secured infrastructure.</p>
        <p><strong>3. SECURITY PROTOCOLS:</strong> All data transmissions are secured utilizing enterprise-grade TLS encryption. Stored telemetry is subjected to cryptographic obfuscation to preclude unauthorized access.</p>
      </div>
    )
  },
  terms: {
    title: "Terms of Service & Usage Constraints",
    content: (
      <div className="space-y-5 text-[15px] text-gray-300 leading-relaxed font-serif">
        <p><strong>1. ACCEPTANCE OF TERMS:</strong> By accessing and utilizing the RenoCred platform, the user agrees to be irrevocably bound by these Terms of Service. Continued usage constitutes affirmative consent to these provisions.</p>
        <p><strong>2. INTELLECTUAL PROPERTY:</strong> All proprietary algorithms, codebase, UI/UX methodologies, and textual content are the exclusive intellectual property of RenoCred. Unauthorized reproduction or scraping is strictly prohibited and subject to legal recourse.</p>
        <p><strong>3. LIMITATION OF LIABILITY:</strong> RenoCred provides analytical projections on an "as-is" basis. We bear no liability for discrepancies between projected reward values and actual realizations, nor for adverse financial events including, but not limited to, credit score degradation or application rejection.</p>
      </div>
    )
  },
  disclaimer: {
    title: "Financial Disclaimer & Limitation of Advice",
    content: (
      <div className="space-y-5 text-[15px] text-gray-300 leading-relaxed font-serif">
        <p><strong>1. NO FIDUCIARY DUTY:</strong> RenoCred is a software-as-a-service analytical platform. We are not registered financial advisors, fiduciaries, or wealth managers. The insights provided herein do not constitute professional financial advice.</p>
        <p><strong>2. INHERENT RISKS OF CREDIT:</strong> The utilization of credit products carries inherent financial risks, including the accumulation of interest and potential degradation of creditworthiness. Users are solely responsible for their financial decisions.</p>
        <p><strong>3. NO GUARANTEE OF APPROVAL:</strong> RenoCred's eligibility estimations do not guarantee final approval by a financial institution. Issuing banks maintain sole discretion over credit underwriting and approval processes.</p>
      </div>
    )
  }
};

export function LegalModal({ doc, onClose }: LegalModalProps) {
  if (!doc) return null;
  const currentDoc = docs[doc];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0f1115] border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#16181d]">
            <h2 className="text-xl font-display font-semibold text-white tracking-tight">{currentDoc.title}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar">
            {currentDoc.content}
            
            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-xs text-gray-500 font-serif tracking-wider uppercase">
                Document Revision: 2026.1a<br/>
                Authorized by: Office of the General Counsel, RenoCred
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
