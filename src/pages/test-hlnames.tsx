import React, { useState, useEffect } from 'react';
import { hlnamesService } from '@/services/hlnames-client';
import { NameResolver, NameSearch, BatchNameResolver } from '@/components/NameResolver';
import { ProfileCard } from '@/components/ProfileCard';

const TestHLNamesPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const testAddress = '0xF26F5551E96aE5162509B25925fFfa7F07B2D652'; // testooor.hl
  const testDomain = 'testooor.hl';
  
  const runTests = async () => {
    setLoading(true);
    let results = '';
    
    try {
      // Test 1: Resolve domain to address
      results += '1. Testing domain resolution...\n';
      try {
        const address = await hlnamesService.resolveAddress(testDomain);
        results += `✅ ${testDomain} -> ${address}\n\n`;
      } catch (e) {
        results += `❌ Failed to resolve domain: ${e}\n\n`;
      }
      
      // Test 2: Get primary name for address
      results += '2. Testing primary name lookup...\n';
      try {
        const primaryName = await hlnamesService.getPrimaryName(testAddress);
        results += `✅ Primary name for ${testAddress}: ${primaryName || 'None'}\n\n`;
      } catch (e) {
        results += `❌ Failed to get primary name: ${e}\n\n`;
      }
      
      // Test 3: Get profile with avatar
      results += '3. Testing profile lookup...\n';
      try {
        const profile = await hlnamesService.getProfile(testAddress);
        results += `✅ Profile: ${JSON.stringify(profile, null, 2)}\n\n`;
      } catch (e) {
        results += `❌ Failed to get profile: ${e}\n\n`;
      }
      
      // Test 4: Get all names owned by address
      results += '4. Testing owned names lookup...\n';
      try {
        const names = await hlnamesService.getNamesOwnedBy(testAddress);
        results += `✅ Owned names: ${JSON.stringify(names, null, 2)}\n\n`;
      } catch (e) {
        results += `❌ Failed to get owned names: ${e}\n\n`;
      }
      
    } catch (error) {
      results += `General error: ${error}\n`;
    }
    
    setTestResult(results);
    setLoading(false);
  };
  
  useEffect(() => {
    runTests();
  }, []);
  
  const testAddresses = [
    '0xF26F5551E96aE5162509B25925fFfa7F07B2D652',
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2',
    '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">HL Names API Test Page</h1>
        
        {/* API Test Results */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">API Test Results</h2>
          <button 
            onClick={runTests}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Run Tests Again'}
          </button>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {testResult || 'Running tests...'}
          </pre>
        </div>
        
        {/* Component Tests */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">NameResolver Component</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Resolve by address:</p>
                <NameResolver address={testAddress} />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Resolve by domain:</p>
                <NameResolver domain={testDomain} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">NameSearch Component</h2>
            <NameSearch 
              onSelect={(address, name) => {
                alert(`Selected: ${name} (${address})`);
              }}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">BatchNameResolver Component</h2>
            <BatchNameResolver
              addresses={testAddresses}
              render={(resolved) => (
                <div className="space-y-2">
                  {testAddresses.map(addr => {
                    const data = resolved.get(addr);
                    return (
                      <div key={addr} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                        {data?.avatar && (
                          <img src={data.avatar} alt="" className="h-8 w-8 rounded-full" />
                        )}
                        <div>
                          <div className="font-medium">{data?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{addr}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">ProfileCard Component</h2>
            <ProfileCard address={testAddress} showFullDetails />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHLNamesPage;