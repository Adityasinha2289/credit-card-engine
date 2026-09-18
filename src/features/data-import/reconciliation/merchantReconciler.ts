import { createClient } from '@supabase/supabase-js';

// We need dotenv since this script runs in node, but we'll try to use VITE variables first
import * as dotenv from 'dotenv';
dotenv.config();

export class MerchantReconciler {
  private static instance: MerchantReconciler;
  
  // Mapping of slug -> canonical ID
  private slugToId = new Map<string, string>();
  private nameToId = new Map<string, string>();

  private constructor() {}

  public static async initialize(): Promise<MerchantReconciler> {
    if (!MerchantReconciler.instance) {
      MerchantReconciler.instance = new MerchantReconciler();
      await MerchantReconciler.instance.fetchPartners();
    }
    return MerchantReconciler.instance;
  }

  public static getInstance(): MerchantReconciler {
    if (!MerchantReconciler.instance) {
      throw new Error('MerchantReconciler must be initialized with await MerchantReconciler.initialize() first.');
    }
    return MerchantReconciler.instance;
  }

  private async fetchPartners() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
       console.warn('⚠️ No Supabase credentials found. Merchant resolution will fail.');
       return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.from('partners').select('id, slug, name');
    
    if (error) {
       console.warn('⚠️ Failed to fetch partners from Supabase:', error);
       return;
    }

    for (const partner of data || []) {
      if (partner.slug) this.slugToId.set(partner.slug.toLowerCase(), partner.id);
      if (partner.name) this.nameToId.set(this.normalize(partner.name), partner.id);
    }
  }

  private normalize(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  public resolve(sourceMerchantId: string | null | undefined, sourceMerchantName: string | null | undefined): string | null {
    if (!sourceMerchantId && !sourceMerchantName) return null;

    // 1. Exact canonical ID or known slug match
    if (sourceMerchantId) {
      const lowerSourceId = sourceMerchantId.toLowerCase();
      if (this.slugToId.has(lowerSourceId)) {
        return this.slugToId.get(lowerSourceId)!;
      }

      // Check normalized alias (e.g. 'm_amazon' -> 'merch-amazon')
      let strippedSourceId = lowerSourceId;
      if (strippedSourceId.startsWith('m_')) {
        strippedSourceId = strippedSourceId.substring(2);
      }
      
      const potentialCanonical = `part-${strippedSourceId}`;
      if (this.slugToId.has(potentialCanonical)) {
        return this.slugToId.get(potentialCanonical)!;
      }
    }

    // 2. Exact normalized-name match
    if (sourceMerchantName) {
      const normalizedName = this.normalize(sourceMerchantName);
      if (this.nameToId.has(normalizedName)) {
        return this.nameToId.get(normalizedName)!;
      }
    }

    return null;
  }
}

