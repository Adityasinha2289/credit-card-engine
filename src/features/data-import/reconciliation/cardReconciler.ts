import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

import * as dotenv from 'dotenv';
dotenv.config();

interface CardMasterIdentity {
  card_id: string;
  canonical_card_id: string;
  card_name: string;
}

export class CardReconciler {
  private static instance: CardReconciler;
  
  // Mapping of source slug / normalized name -> DB canonical ID
  private lookupMap = new Map<string, string>();
  
  // Track collisions to prevent unsafe resolution
  private collisions = new Set<string>();

  private constructor() {}

  public static async initialize(): Promise<CardReconciler> {
    if (!CardReconciler.instance) {
      CardReconciler.instance = new CardReconciler();
      await CardReconciler.instance.loadAndMapCards();
    }
    return CardReconciler.instance;
  }

  public static getInstance(): CardReconciler {
    if (!CardReconciler.instance) {
      throw new Error('CardReconciler must be initialized with await CardReconciler.initialize() first.');
    }
    return CardReconciler.instance;
  }

  // Token-sort normalization: strips non-alphanumeric except +, removes stop words, sorts tokens alphabetically
  public normalizeTokens(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9+\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0 && w !== 'card' && w !== 'credit' && w !== 'bank')
      .sort()
      .join(' ');
  }

  private async loadAndMapCards() {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
         console.warn('⚠️ No Supabase credentials found. Card resolution will fail.');
         return;
      }
  
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: dbCards, error } = await supabase.from('cards').select('id, name');
      
      if (error) {
         console.warn('⚠️ Failed to fetch cards from Supabase:', error);
         return;
      }

      // Map DB card token-sorted name -> DB ID
      const dbTokensToId = new Map<string, string>();
      for (const dbCard of dbCards || []) {
        const tokens = this.normalizeTokens(dbCard.name);
        
        if (dbTokensToId.has(tokens)) {
          this.collisions.add(tokens);
        } else {
          dbTokensToId.set(tokens, dbCard.id);
        }

        // Also map the raw ID just in case
        this.lookupMap.set(dbCard.id.toLowerCase(), dbCard.id);
      }

      // Load Master JSON to bridge the source dataset identifiers to DB names
      const datasetPath = path.join(process.cwd(), 'renocred-data/datasets/renocred_card_master.json');
      if (fs.existsSync(datasetPath)) {
        const rawData = fs.readFileSync(datasetPath, 'utf8');
        const dataset = JSON.parse(rawData);
        
        const cards = dataset.data || [];
        for (const card of cards) {
          const identity = card.identity as CardMasterIdentity;
          if (!identity || !identity.canonical_card_id || !identity.card_name) continue;
          
          const tokens = this.normalizeTokens(identity.card_name);
          
          // If we found a matching card in the DB and it is NOT a collision
          if (dbTokensToId.has(tokens) && !this.collisions.has(tokens)) {
             const dbId = dbTokensToId.get(tokens)!;
             // Map all known source identifiers to this verified DB ID
             this.lookupMap.set(identity.canonical_card_id.toLowerCase(), dbId);
             if (identity.card_id) this.lookupMap.set(identity.card_id.toLowerCase(), dbId);
          }
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not load card master for reconciliation:', e);
    }
  }

  public resolve(sourceCardSlug: string): string | null {
    if (!sourceCardSlug) return null;

    const lowerSlug = sourceCardSlug.toLowerCase();
    
    if (this.lookupMap.has(lowerSlug)) {
      return this.lookupMap.get(lowerSlug)!;
    }

    // 2. Known non-semantic formatting differences
    const deterministicAliases: Record<string, string> = {
      'sbi_simply_click_sbi_credit_card': 'sbi_simplyclick',
      'sbi_simply_click_sbi_credit_card_v2': 'sbi_simplyclick',
      'hdfc_infinia_metal_credit_card': 'hdfc_infinia'
    };

    if (deterministicAliases[lowerSlug]) {
      const alias = deterministicAliases[lowerSlug];
      // Only return the alias if it actually maps to a verified canonical DB ID
      if (this.lookupMap.has(alias)) {
        return this.lookupMap.get(alias)!;
      }
    }

    return null;
  }
}


