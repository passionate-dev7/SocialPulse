# Notification System & HL Names Integration Documentation

## Overview
This document describes the integrated notification system and Hyperliquid Names (HL Names) service implemented in the SocialPulse platform.

## 1. Notification System

### Features
- **Real-time Monitoring**: Polls Hyperliquid API for user activity
- **Multiple Notification Types**: Orders, positions, PnL updates, margin alerts, price alerts
- **Configurable Settings**: Thresholds, delivery methods, notification types
- **Priority Levels**: Low, Medium, High, Critical with different visual/audio indicators
- **Desktop Notifications**: Browser notification API integration
- **Sound Alerts**: Different tones for different priority levels

### Components

#### NotificationService (`/src/services/hyperliquid-notifications.ts`)
Core service handling all notification logic:
- Event-driven architecture using EventEmitter
- Polling intervals for different data types
- Notification creation and management
- Settings management

#### NotificationCenter (`/src/components/NotificationCenter.tsx`)
Main UI component in navigation bar:
- Dropdown notification list
- Unread count badge
- Quick settings access
- Mark as read/clear functions

#### NotificationSettings (`/src/components/NotificationSettings.tsx`)
Comprehensive settings interface:
- Toggle notification types
- Adjust thresholds (PnL %, margin ratio)
- Configure delivery methods
- Manage price alerts

#### Notifications Page (`/src/pages/notifications.tsx`)
Full dashboard for notification management:
- Start/stop monitoring
- View statistics
- Test notifications
- Full settings interface

### Usage Example
```typescript
import { notificationService, MonitoringConfig } from '@/services/hyperliquid-notifications';

// Start monitoring
const config: MonitoringConfig = {
  userAddress: '0x...',
  pollingInterval: 5000,
  notificationSettings: {
    enableOrderNotifications: true,
    enablePnlNotifications: true,
    pnlThreshold: 5, // 5% change triggers notification
    marginThreshold: 1.5,
    soundEnabled: true,
  },
  priceAlerts: [
    { coin: 'BTC', targetPrice: 50000, condition: 'above', enabled: true }
  ]
};

notificationService.startMonitoring(config);
```

## 2. HL Names Integration

### Features
- **Name Resolution**: Convert .hl domains to addresses and vice versa
- **Profile Display**: Show primary names and avatars
- **Batch Resolution**: Efficient resolution for multiple addresses
- **Search Functionality**: Search by name or address
- **Caching**: 5-minute cache for improved performance
- **Name Management**: Display owned names with expiry and details

### Components

#### HLNamesService (`/src/services/hlnames.ts`)
Core service for HL Names API integration:
- Full API implementation with all endpoints
- Automatic caching for performance
- Helper methods for formatting
- Profile and avatar fetching

#### NameResolver (`/src/components/NameResolver.tsx`)
Main resolution component:
- Displays names with avatars
- Copy address functionality
- Link to profiles
- Loading states

#### NameSearch Component
Search interface for finding names/addresses:
- Real-time search
- Support for .hl domains and addresses
- Dropdown results

#### ProfileCard (`/src/components/ProfileCard.tsx`)
Rich profile display:
- Large avatar display
- Primary name badge
- List of owned names
- Name details (expiry, controller, etc.)

### Usage Examples

#### Basic Name Resolution
```tsx
import { NameResolver } from '@/components/NameResolver';

// Resolve address to name
<NameResolver 
  address="0xF26F5551E96aE5162509B25925fFfa7F07B2D652"
  showAvatar={true}
  showCopyButton={true}
/>

// Resolve domain to address
<NameResolver 
  domain="testooor.hl"
  linkToProfile={true}
/>
```

#### Profile Display
```tsx
import { ProfileCard } from '@/components/ProfileCard';

<ProfileCard 
  address="0xF26F5551E96aE5162509B25925fFfa7F07B2D652"
  showFullDetails={true}
/>
```

#### Name Search
```tsx
import { NameSearch } from '@/components/NameResolver';

<NameSearch 
  onSelect={(address, name) => {
    console.log(`Selected: ${name} (${address})`);
  }}
  placeholder="Search by name or address..."
/>
```

#### Service Direct Usage
```typescript
import { hlnamesService } from '@/services/hlnames';

// Resolve name to address
const address = await hlnamesService.resolveAddress('testooor.hl');

// Get profile with avatar
const profile = await hlnamesService.getProfile('0x...');
console.log(profile.primaryName, profile.avatar);

// Get all names owned by address
const names = await hlnamesService.getNamesOwnedBy('0x...');

// Format address with name
const formatted = await hlnamesService.formatAddress('0x...', showFull);
```

## 3. Integration Points

### Trader Profiles
The HL Names system can be integrated into trader profiles to:
- Display primary names instead of addresses
- Show avatars in leaderboards
- Enable name-based search

### Notifications with Names
Notifications can display user-friendly names:
```typescript
const name = await hlnamesService.getPrimaryName(userAddress);
const displayName = name || hlnamesService.truncateAddress(userAddress);
```

### Navigation Updates
Add name display to user menu:
```tsx
<MiniProfile address={userAddress} />
```

## 4. API Configuration

### HL Names API
- **Endpoint**: https://api.hlnames.xyz
- **API Key**: CPEPKMI-HUSUX6I-SE2DHEA-YYWFG5Y
- **Example Domain**: testooor.hl

### Available Endpoints
- `/resolve/address/{domain}` - Get address from domain
- `/resolve/primary_name/{address}` - Get primary name
- `/resolve/profile/{address}` - Get profile with avatar
- `/utils/names_owner/{address}` - Get all owned names
- `/records/image/{tokenId}` - Get NFT image

## 5. Performance Considerations

### Caching Strategy
- 5-minute cache for profiles and names
- Batch resolution for lists
- Lazy loading for name details

### Best Practices
1. Use `BatchNameResolver` for lists
2. Cache results in parent components
3. Show loading states during resolution
4. Fallback to truncated addresses

## 6. Future Enhancements

### Potential Features
1. **Name Registration Helper**: Guide users through registration
2. **Expiry Notifications**: Alert before name expiration
3. **Name Trading**: Show name marketplace data
4. **Multi-chain Support**: Resolve names on different chains
5. **Social Features**: Follow users by name
6. **Name Analytics**: Track name popularity and usage

### Integration Ideas
1. **Copy Trading by Name**: Follow traders using .hl names
2. **Name-based Portfolios**: Group traders by names
3. **Notification Subscriptions**: Subscribe to alerts by name
4. **Name Badges**: Special badges for verified names
5. **Name History**: Track name ownership changes

## 7. Testing

### Test Data
- **Test Name**: testooor.hl
- **Test Address**: 0xF26F5551E96aE5162509B25925fFfa7F07B2D652

### Component Testing
```tsx
// Test name resolution
<NameResolver domain="testooor.hl" />

// Test profile display
<ProfileCard address="0xF26F5551E96aE5162509B25925fFfa7F07B2D652" />

// Test search
<NameSearch onSelect={console.log} />
```

## 8. Troubleshooting

### Common Issues
1. **API Rate Limits**: Implement exponential backoff
2. **Cache Invalidation**: Clear cache on errors
3. **Image Loading**: Fallback to default avatars
4. **Network Errors**: Show appropriate error states

### Debug Mode
```typescript
// Enable debug logging
hlnamesService.debugMode = true;

// Clear cache
hlnamesService.clearCache();

// Check cache status
hlnamesService.getCacheStats();
```

## Summary
The notification system and HL Names integration provide a comprehensive user experience enhancement for the SocialPulse platform. The notification system keeps users informed of important trading events, while the HL Names integration makes the platform more user-friendly by replacing complex addresses with memorable names and avatars.