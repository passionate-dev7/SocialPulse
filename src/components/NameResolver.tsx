import React, { useState, useEffect } from 'react';
import { hlnamesService } from '@/services/hlnames-client';
import { 
  UserCircleIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface NameResolverProps {
  address?: string;
  domain?: string;
  showAvatar?: boolean;
  showCopyButton?: boolean;
  linkToProfile?: boolean;
  className?: string;
  truncate?: boolean;
}

export const NameResolver: React.FC<NameResolverProps> = ({
  address,
  domain,
  showAvatar = true,
  showCopyButton = true,
  linkToProfile = false,
  className = '',
  truncate = true,
}) => {
  const [resolvedName, setResolvedName] = useState<string>('');
  const [resolvedAddress, setResolvedAddress] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const resolve = async () => {
      setLoading(true);
      try {
        if (address) {
          // Resolve address to name
          const profile = await hlnamesService.getProfile(address);
          setResolvedName(profile.primaryName || '');
          setAvatar(profile.avatar || '');
          setResolvedAddress(address);
        } else if (domain) {
          // Resolve domain to address
          const addr = await hlnamesService.resolveAddress(domain);
          setResolvedAddress(addr);
          setResolvedName(domain);
          
          // Get avatar if available
          const profile = await hlnamesService.getProfile(addr);
          setAvatar(profile.avatar || '');
        }
      } catch (error) {
        console.error('Error resolving name:', error);
      } finally {
        setLoading(false);
      }
    };

    if (address || domain) {
      resolve();
    }
  }, [address, domain]);

  const handleCopy = () => {
    if (resolvedAddress) {
      navigator.clipboard.writeText(resolvedAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayText = () => {
    if (loading) return 'Loading...';
    if (resolvedName) return resolvedName;
    if (resolvedAddress) {
      return truncate 
        ? hlnamesService.truncateAddress(resolvedAddress)
        : resolvedAddress;
    }
    return 'Unknown';
  };

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      {showAvatar && (
        <div className="relative">
          {avatar ? (
            <img 
              src={avatar} 
              alt={resolvedName || 'Avatar'} 
              className="h-8 w-8 rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <UserCircleIcon className={`h-8 w-8 text-gray-400 ${avatar ? 'hidden' : ''}`} />
        </div>
      )}
      
      <div className="flex-1">
        <div className="font-medium text-gray-900">
          {displayText()}
        </div>
        {resolvedName && resolvedAddress && truncate && (
          <div className="text-xs text-gray-500">
            {hlnamesService.truncateAddress(resolvedAddress)}
          </div>
        )}
      </div>

      {showCopyButton && resolvedAddress && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Copy address"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ClipboardDocumentIcon className="h-4 w-4 text-gray-400" />
          )}
        </button>
      )}
    </div>
  );

  if (linkToProfile && resolvedAddress) {
    return (
      <a 
        href={`/trader/${resolvedAddress}`}
        className="hover:bg-gray-50 rounded-lg transition-colors block"
      >
        {content}
      </a>
    );
  }

  return content;
};

// Name search component
interface NameSearchProps {
  onSelect: (address: string, name: string) => void;
  placeholder?: string;
  className?: string;
}

export const NameSearch: React.FC<NameSearchProps> = ({
  onSelect,
  placeholder = 'Search by name or address...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ name: string; address: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Check if it's a valid HL domain
        if (hlnamesService.isValidHLDomain(query)) {
          const address = await hlnamesService.resolveAddress(query);
          setResults([{ name: query, address }]);
        } 
        // Check if it's an address
        else if (query.startsWith('0x') && query.length === 42) {
          const profile = await hlnamesService.getProfile(query);
          if (profile.primaryName) {
            setResults([{ name: profile.primaryName, address: query }]);
          } else {
            setResults([{ name: hlnamesService.truncateAddress(query), address: query }]);
          }
        }
        // Search for partial names (would need backend support for full search)
        else {
          // For now, just try adding .hl
          const possibleDomain = `${query}.hl`;
          try {
            const address = await hlnamesService.resolveAddress(possibleDomain);
            setResults([{ name: possibleDomain, address }]);
          } catch {
            setResults([]);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (result: { name: string; address: string }) => {
    onSelect(result.address, result.name);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 hover:bg-gray-50 flex items-center justify-between text-left"
            >
              <div>
                <div className="font-medium text-gray-900">{result.name}</div>
                <div className="text-sm text-gray-500">
                  {hlnamesService.truncateAddress(result.address)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Batch name resolver for lists
interface BatchNameResolverProps {
  addresses: string[];
  render: (resolved: Map<string, { name: string; avatar: string }>) => React.ReactNode;
}

export const BatchNameResolver: React.FC<BatchNameResolverProps> = ({
  addresses,
  render,
}) => {
  const [resolved, setResolved] = useState<Map<string, { name: string; avatar: string }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveAll = async () => {
      setLoading(true);
      
      console.log('Resolving addresses:', addresses);
      
      try {
        // Use batch resolve for better performance
        const profiles = await hlnamesService.batchResolve(addresses);
        
        const newResolved = new Map<string, { name: string; avatar: string }>();
        
        addresses.forEach(address => {
          const profile = profiles.get(address);
          
          // If we got a primary name, use it with .hl suffix if not already present
          const name = profile?.primaryName 
            ? (profile.primaryName.endsWith('.hl') ? profile.primaryName : `${profile.primaryName}.hl`)
            : '';
            
          newResolved.set(address, {
            name: name || hlnamesService.truncateAddress(address),
            avatar: profile?.avatar || '',
          });
        });
        
        console.log('All resolved:', newResolved);
        setResolved(newResolved);
      } catch (error) {
        console.error('Failed to batch resolve:', error);
        
        // Fallback: set all as truncated addresses
        const newResolved = new Map<string, { name: string; avatar: string }>();
        addresses.forEach(address => {
          newResolved.set(address, {
            name: hlnamesService.truncateAddress(address),
            avatar: '',
          });
        });
        setResolved(newResolved);
      } finally {
        setLoading(false);
      }
    };

    if (addresses.length > 0) {
      resolveAll();
    }
  }, [addresses]);

  if (loading) {
    return <div>Loading names...</div>;
  }

  return <>{render(resolved)}</>;
};