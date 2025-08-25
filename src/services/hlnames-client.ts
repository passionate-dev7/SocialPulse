/**
 * Hyperliquid Names (HL Names) Client Service
 * Client-side service that uses our API route to avoid CORS issues
 */

// Interfaces (same as before)
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

class HLNamesClientService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

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
   * Call our API route
   */
  private async callAPI(action: string, params: any): Promise<any> {
    const response = await fetch('/api/hlnames/resolve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, params }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'API call failed');
    }
    
    return result.data;
  }

  /**
   * Resolve a domain to an address
   */
  async resolveAddress(domain: string): Promise<string> {
    const cacheKey = `resolve:${domain}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.callAPI('resolveAddress', { domain });
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
      const data = await this.callAPI('getPrimaryName', { address });
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting primary name:', error);
      return ''; // Return empty string if no primary name
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
      const data = await this.callAPI('getProfile', { address });
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      return { primaryName: '', avatar: '' };
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
      const data = await this.callAPI('getNamesOwned', { address });
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting names for address:', error);
      return [];
    }
  }

  /**
   * Batch resolve multiple addresses
   */
  async batchResolve(addresses: string[]): Promise<Map<string, Profile>> {
    const result = new Map<string, Profile>();
    
    // Check cache first
    const uncached: string[] = [];
    for (const address of addresses) {
      const cached = this.getFromCache(`profile:${address}`);
      if (cached) {
        result.set(address, cached);
      } else {
        uncached.push(address);
      }
    }
    
    // Fetch uncached addresses
    if (uncached.length > 0) {
      try {
        const data = await this.callAPI('batchResolve', { addresses: uncached });
        for (const item of data) {
          const profile = item.profile || { primaryName: '', avatar: '' };
          result.set(item.address, profile);
          this.setCache(`profile:${item.address}`, profile);
        }
      } catch (error) {
        console.error('Error batch resolving:', error);
        // Set empty profiles for failed addresses
        for (const address of uncached) {
          result.set(address, { primaryName: '', avatar: '' });
        }
      }
    }
    
    return result;
  }

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
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const hlnamesService = new HLNamesClientService();

// Export service class for testing
export { HLNamesClientService };