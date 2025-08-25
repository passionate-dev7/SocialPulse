import React, { useState, useEffect } from 'react';
import { hlnamesService, Profile, NameRecord } from '@/services/hlnames-client';
import { 
  UserIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  GlobeAltIcon,
  LinkIcon,
  CalendarIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface ProfileCardProps {
  address: string;
  showFullDetails?: boolean;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  address,
  showFullDetails = false,
  className = '',
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [names, setNames] = useState<NameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // Get profile with primary name and avatar
        const profileData = await hlnamesService.getProfile(address);
        setProfile(profileData);

        // Get all names owned by this address
        if (showFullDetails) {
          const ownedNames = await hlnamesService.getNamesOwnedBy(address);
          setNames(ownedNames);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [address, showFullDetails]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 animate-pulse ${className}`}>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            {profile?.avatar && !imageError ? (
              <img 
                src={profile.avatar}
                alt={profile.primaryName || 'Profile'}
                className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="h-20 w-20 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>

          {/* Name and address */}
          <div className="flex-1 text-white">
            <h2 className="text-2xl font-bold mb-1">
              {profile?.primaryName || hlnamesService.truncateAddress(address)}
            </h2>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-white/20 px-2 py-1 rounded">
                {hlnamesService.truncateAddress(address)}
              </code>
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details section */}
      <div className="p-6">
        {/* Primary name badge */}
        {profile?.primaryName && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <GlobeAltIcon className="h-4 w-4" />
              Primary Name: {profile.primaryName}
            </div>
          </div>
        )}

        {/* Owned names list */}
        {showFullDetails && names.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CubeIcon className="h-5 w-5" />
              Owned Names ({names.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {names.map((name) => (
                <NameCard key={name.tokenid} name={name} address={address} />
              ))}
            </div>
          </div>
        )}

        {/* No names message */}
        {showFullDetails && names.length === 0 && (
          <div className="text-center py-8">
            <GlobeAltIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No HL names owned by this address</p>
            <a 
              href="https://hlnames.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <LinkIcon className="h-4 w-4" />
              Register a name
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual name card component
interface NameCardProps {
  name: NameRecord;
  address: string;
}

const NameCard: React.FC<NameCardProps> = ({ name, address }) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadDetails = async () => {
    if (details || loading) return;
    
    setLoading(true);
    try {
      // For now, we'll just use the basic name info
      const fullRecord = { expiry: null, controller: address, resolver: '' };
      setDetails(fullRecord);
    } catch (error) {
      console.error('Error loading name details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!expanded && !details) {
      loadDetails();
    }
    setExpanded(!expanded);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <button
        onClick={handleToggle}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-gray-900">{name.name}</span>
          </div>
          <span className="text-xs text-gray-500">#{name.tokenid}</span>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {loading ? (
            <div className="text-sm text-gray-500">Loading details...</div>
          ) : details ? (
            <>
              {details.expiry && (
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Expires: {formatDistanceToNow(details.expiry * 1000, { addSuffix: true })}
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-500">
                <div>Controller: {hlnamesService.truncateAddress(details.controller || address)}</div>
                <div>Resolver: {hlnamesService.truncateAddress(details.resolver || '')}</div>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Unable to load details</div>
          )}
        </div>
      )}
    </div>
  );
};

// Mini profile component for inline use
interface MiniProfileProps {
  address: string;
  className?: string;
}

export const MiniProfile: React.FC<MiniProfileProps> = ({ address, className = '' }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hlnamesService.getProfile(address)
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) {
    return <span className={`inline-block animate-pulse bg-gray-200 h-4 w-24 rounded ${className}`}></span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {profile?.avatar && (
        <img 
          src={profile.avatar}
          alt={profile.primaryName || ''}
          className="h-6 w-6 rounded-full"
          onError={(e) => e.currentTarget.style.display = 'none'}
        />
      )}
      <span className="font-medium">
        {profile?.primaryName || hlnamesService.truncateAddress(address)}
      </span>
    </span>
  );
};