/**
 * Utility functions for handling data serialization in Next.js
 * Ensures all data is JSON-serializable for SSR/SSG
 */

/**
 * Convert Date objects to ISO strings for JSON serialization
 */
export function serializeDate(date: Date | string | number): string {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === 'number') {
    return new Date(date).toISOString();
  }
  return date;
}

/**
 * Deep serialize an object, converting all Date objects to strings
 */
export function serializeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) {
    return obj.toISOString() as any;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeObject(item)) as any;
  }
  
  const serialized: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (value instanceof Date) {
      serialized[key] = value.toISOString();
    } else if (value && typeof value === 'object') {
      serialized[key] = serializeObject(value);
    } else {
      serialized[key] = value;
    }
  }
  
  return serialized;
}

/**
 * Parse ISO date strings back to Date objects on the client
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Check if a string is a valid ISO date string
 */
export function isISODateString(value: any): boolean {
  if (typeof value !== 'string') return false;
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoDateRegex.test(value);
}

/**
 * Deep parse an object, converting ISO date strings back to Date objects
 */
export function parseObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (typeof obj === 'string' && isISODateString(obj)) {
    return new Date(obj) as any;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => parseObject(item)) as any;
  }
  
  const parsed: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string' && isISODateString(value)) {
      parsed[key] = new Date(value);
    } else if (value && typeof value === 'object') {
      parsed[key] = parseObject(value);
    } else {
      parsed[key] = value;
    }
  }
  
  return parsed;
}