/**
 * Hyperliquid Names (HL Names) Service
 * Integration with HLN REST API for name resolution
 */

import axios, { AxiosInstance } from 'axios';

// API Configuration
const HLNAMES_API_URL = 'https://api.hlnames.xyz';
const API_KEY = 'CPEPKMI-HUSUX6I-SE2DHEA-YYWFG5Y';

// Interfaces
export interface NameRecord {
  name: string;
  namehash: string;
  tokenid: string;
}

export interface PrimaryNameRecord {
  address: string;
  primaryName: string;
  namehash: string;
  tokenid: string;
}

export interface Profile {
  primaryName: string;
  avatar: string;
}

export interface FullRecord {
  owner: string;
  controller: string;
  resolver: string;
  expiry: number;
  name: string;
  namehash: string;
  tokenId: string;
  resolvedAddress: string;
  chainAddresses?: string[];
  dataRecord?: Record<string, any>;
}

export interface TokenUri {
  tokenUri: string;
}

export interface ImageData {
  image: string;
}

class HLNamesService {
  private api: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

  constructor() {
    this.api = axios.create({
      baseURL: HLNAMES_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'apiKey': API_KEY,
      },
    });
  }

  /**
   * Get from cache if valid
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear expired cache entries
   */
  private cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  // === Utils Endpoints ===

  /**
   * Get the NameHash for a given domain
   */
  async getNameHash(domain: string): Promise<string> {
    const cacheKey = `namehash:${domain}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get(`/utils/namehash/${domain}`);
      const data = response.data;
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting namehash:', error);
      throw error;
    }
  }

  /**
   * Get Token ID from NameHash
   */
  async getTokenIdFromHash(nameHash: string): Promise<string> {
    try {
      const response = await this.api.get(`/utils/hash_id/${nameHash}`);
      return response.data;
    } catch (error) {
      console.error('Error getting token ID:', error);
      throw error;
    }
  }

  /**
   * Check if a domain is registered
   */
  async isRegistered(nameHash: string): Promise<boolean> {
    try {
      const response = await this.api.get(`/utils/registered/${nameHash}`);
      return response.data;
    } catch (error) {
      console.error('Error checking registration:', error);
      throw error;
    }
  }

  /**
   * Get all names owned by an address
   */
  async getNamesOwnedBy(address: string): Promise<NameRecord[]> {
    const cacheKey = `names:${address}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get(`/utils/names_owner/${address}`);
      const data = response.data;
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting names for address:', error);
      throw error;
    }
  }

  /**
   * Get all registered names (with pagination)
   */
  async getAllNames(begin = 0, end = 999): Promise<NameRecord[]> {
    try {
      const response = await this.api.get('/utils/all_names', {
        params: { begin, end }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting all names:', error);
      throw error;
    }
  }

  /**
   * Get all primary names
   */
  async getAllPrimaryNames(begin = 0, end = 999, addresses?: string[]): Promise<PrimaryNameRecord[]> {
    try {
      const params: any = { begin, end };
      const response = await this.api.get('/utils/all_primary_names', {
        params,
        data: addresses ? { addresses } : undefined
      });
      return response.data;
    } catch (error) {
      console.error('Error getting primary names:', error);
      throw error;
    }
  }

  // === Resolve Endpoints ===

  /**
   * Resolve a domain to an address
   */
  async resolveAddress(domain: string): Promise<string> {
    const cacheKey = `resolve:${domain}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get(`/resolve/address/${domain}`);
      const data = response.data;
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error resolving address:', error);
      throw error;
    }
  }

  /**
   * Get primary name for an address
   */
  async getPrimaryName(address: string): Promise<string> {
    const cacheKey = `primary:${address}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get(`/resolve/primary_name/${address}`);
      const data = response.data;
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting primary name:', error);
      return ''; // Return empty string if no primary name
    }
  }

  /**
   * Get domain from NameHash or Token ID
   */
  async getDomain(nameHashOrId: string): Promise<string> {
    try {
      const response = await this.api.get(`/resolve/domain/${nameHashOrId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting domain:', error);
      throw error;
    }
  }

  /**
   * Get Token ID for a domain
   */
  async getTokenId(domain: string): Promise<string> {
    try {
      const response = await this.api.get(`/resolve/token_id/${domain}`);
      return response.data;
    } catch (error) {
      console.error('Error getting token ID:', error);
      throw error;
    }
  }

  /**
   * Get profile (primary name and avatar) for an address
   */
  async getProfile(address: string): Promise<Profile> {
    const cacheKey = `profile:${address}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get(`/resolve/profile/${address}`);
      const data = response.data;
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      return { primaryName: '', avatar: '' };
    }
  }

  /**
   * Get past resolved addresses for a domain
   */
  async getPastResolved(domain: string, blockNumStart?: string, blockNumEnd?: string): Promise<any> {
    try {
      let url = `/resolve/past_resolved/${domain}`;
      if (blockNumStart && blockNumEnd) {
        url += `/${blockNumStart}/${blockNumEnd}`;
      }
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error getting past resolved:', error);
      throw error;
    }
  }

  // === Metadata Endpoints ===

  /**
   * Get expiry date for a domain
   */
  async getExpiry(nameHash: string): Promise<number> {
    try {
      const response = await this.api.get(`/metadata/expiry/${nameHash}`);
      return response.data;
    } catch (error) {
      console.error('Error getting expiry:', error);
      throw error;
    }
  }

  /**
   * Get controller address for a domain
   */
  async getController(tokenId: string): Promise<string> {
    try {
      const response = await this.api.get(`/metadata/controller/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting controller:', error);
      throw error;
    }
  }

  /**
   * Get owner address for a domain
   */
  async getOwner(tokenId: string): Promise<string> {
    try {
      const response = await this.api.get(`/metadata/owner/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting owner:', error);
      throw error;
    }
  }

  // === Records Endpoints ===

  /**
   * Get basic name record
   */
  async getNameRecord(nameHash: string): Promise<any> {
    try {
      const response = await this.api.get(`/records/name_record/${nameHash}`);
      return response.data;
    } catch (error) {
      console.error('Error getting name record:', error);
      throw error;
    }
  }

  /**
   * Get data record
   */
  async getDataRecord(nameHash: string): Promise<any> {
    try {
      const response = await this.api.get(`/records/data_record/${nameHash}`);
      return response.data;
    } catch (error) {
      console.error('Error getting data record:', error);
      throw error;
    }
  }

  /**
   * Get full record for a domain
   */
  async getFullRecord(nameHash: string): Promise<FullRecord> {
    try {
      const response = await this.api.get(`/records/full_record/${nameHash}`);
      return response.data;
    } catch (error) {
      console.error('Error getting full record:', error);
      throw error;
    }
  }

  /**
   * Get Token URI for NFT metadata
   */
  async getTokenUri(tokenId: string): Promise<TokenUri> {
    try {
      const response = await this.api.get(`/records/token_uri/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting token URI:', error);
      throw error;
    }
  }

  /**
   * Get Base64-encoded SVG image for a token
   */
  async getImage(tokenId: string): Promise<ImageData> {
    const cacheKey = `image:${tokenId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get(`/records/image/${tokenId}`);
      const data = response.data;
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting image:', error);
      throw error;
    }
  }

  /**
   * Get supported coin types
   */
  async getCoinTypes(): Promise<number[]> {
    try {
      const response = await this.api.get('/records/coin_types');
      return response.data;
    } catch (error) {
      console.error('Error getting coin types:', error);
      throw error;
    }
  }

  /**
   * Get chain address for a specific coin type
   */
  async getChainAddress(nameHash: string, coinType: string): Promise<{ chainAddress: string }> {
    try {
      const response = await this.api.get(`/records/chain_address/${nameHash}/${coinType}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chain address:', error);
      throw error;
    }
  }

  /**
   * Get all chain addresses for a name
   */
  async getChainAddresses(nameHash: string): Promise<{ chainAddresses: string[] }> {
    try {
      const response = await this.api.get(`/records/chain_addresses/${nameHash}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chain addresses:', error);
      throw error;
    }
  }

  // === Helper Methods ===

  /**
   * Format address with primary name if available
   */
  async formatAddress(address: string, showFull = false): Promise<string> {
    try {
      const primaryName = await this.getPrimaryName(address);
      if (primaryName) {
        return showFull ? `${primaryName} (${this.truncateAddress(address)})` : primaryName;
      }
      return this.truncateAddress(address);
    } catch (error) {
      return this.truncateAddress(address);
    }
  }

  /**
   * Truncate address for display
   */
  truncateAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Validate HL domain format
   */
  isValidHLDomain(domain: string): boolean {
    return /^[a-z0-9-]+\.hl$/i.test(domain);
  }

  /**
   * Parse domain from full name (removes .hl)
   */
  parseDomain(fullName: string): string {
    return fullName.replace(/\.hl$/i, '');
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const hlnamesService = new HLNamesService();

// Export service class for testing
export { HLNamesService };