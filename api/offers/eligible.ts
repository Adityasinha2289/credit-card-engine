import { VercelRequest, VercelResponse } from '@vercel/node';
import { ClerkAuth } from '../../src/features/recommendation/api/auth';
import { supabaseAdmin } from '../admin/_utils/supabaseAdmin';
import { OfferEligibilityEngine, OfferEligibilityContext } from '../../src/features/commerce/services/OfferEligibilityEngine';
import { CommerceMapper, PaymentMethodMapper } from '../../src/features/commerce/mappers';
import { CommerceOffer } from '../../src/features/commerce/types';

const auth = new ClerkAuth();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST method is allowed' }
    });
  }

  const startTime = Date.now();

  try {
    // 1. Authenticate user securely on the server
    const authHeader = req.headers.authorization;
    const authResult = await auth.verifyToken(authHeader);

    if (!authResult.authenticated || !authResult.userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: authResult.error || 'Authentication failed' }
      });
    }

    const userId = authResult.userId;
    const { merchantId, transactionAmount, location, transactionType, channel } = req.body;

    if (!supabaseAdmin) {
      throw new Error('Database admin client not configured');
    }

    // 2. Fetch User's Canonical Wallet (Server-side trust boundary)
    const { data: userCardsData, error: ucError } = await supabaseAdmin
      .from('user_cards')
      .select('card_id, status, cards (bank)')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (ucError) {
      console.error('[EligibleAPI] Error fetching user_cards:', ucError);
      throw new Error('Database error fetching user wallet');
    }

    const validUserCards = (userCardsData || []).filter(row => row.card_id);

    const walletCardIds = validUserCards.map(row => row.card_id);
    const walletCards = validUserCards.map(row => {
      const cardDef = Array.isArray(row.cards) ? row.cards[0] : row.cards;
      return {
        id: row.card_id,
        provider: cardDef?.bank || 'unknown'
      };
    });

    // 3. Bulk Fetch Candidate Offers (Using Service Role to bypass RLS and access internal_campaign_metadata safely)
    const { data: offersData, error: offersError } = await supabaseAdmin
      .from('offers')
      .select('*')
      .eq('status', 'active')
      .gte('valid_until', new Date().toISOString());

    if (offersError) {
      console.error('[EligibleAPI] Error fetching offers:', offersError);
      throw new Error('Database error fetching offers');
    }

    const allOffers: CommerceOffer[] = offersData.map(CommerceMapper.toOffer);
    
    // The mapper normally strips internal_campaign_metadata for safety. 
    // Wait! Let's check CommerceMapper.toOffer! 
    // If it strips metadata, the engine won't get it. We need to preserve it here.
    const candidates = offersData.map(row => {
      const offer = CommerceMapper.toOffer(row);
      // Inject internal_campaign_metadata securely here for the engine
      (offer as any).internal_campaign_metadata = row.internal_campaign_metadata;
      return offer;
    });

    // 4. Construct Trusted Evaluation Context
    const context: OfferEligibilityContext = {
      userId,
      walletCardIds,
      walletCards,
      merchantId,
      transactionAmount,
      location,
      transactionType,
      channel,
      evaluationTime: new Date() // Single evaluation boundary
    };

    // 5. Evaluate In-Memory
    const eligibleOffers: CommerceOffer[] = [];
    const evaluationDebug: Record<string, any> = {};

    for (const offer of candidates) {
      const result = OfferEligibilityEngine.evaluate(offer, context);
      
      // Preserve internal reasons for debugging (if admin/debug enabled), but we don't expose them globally
      evaluationDebug[offer.id] = result;

      if (result.isEligible) {
        // Strip sensitive metadata before returning to client
        delete (offer as any).internal_campaign_metadata;
        // Inject the applicable wallet cards metadata
        (offer as any).applicable_wallet_card_ids = result.applicableWalletCardIds;
        eligibleOffers.push(offer);
      }
    }

    const executionTimeMs = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      eligibleOffers,
      _debug: {
        totalEvaluated: candidates.length,
        totalEligible: eligibleOffers.length,
        executionTimeMs
      }
    });

  } catch (err: any) {
    console.error('[EligibleAPI] Fatal Error:', err);
    return res.status(500).json({ 
      success: false, 
      error: { code: 'INTERNAL_SERVER_ERROR', message: err.message || 'An unexpected error occurred' }
    });
  }
}
