import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const HLNAMES_API_URL = 'https://api.hlnames.xyz';
const API_KEY = 'CPEPKMI-HUSUX6I-SE2DHEA-YYWFG5Y';

type ResolveResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResolveResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { action, params } = req.body;

  try {
    const api = axios.create({
      baseURL: HLNAMES_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'apiKey': API_KEY,
      },
    });

    let response;

    switch (action) {
      case 'resolveAddress':
        response = await api.get(`/resolve/address/${params.domain}`);
        break;
        
      case 'getPrimaryName':
        response = await api.get(`/resolve/primary_name/${params.address}`);
        break;
        
      case 'getProfile':
        try {
          response = await api.get(`/resolve/profile/${params.address}`);
          console.log(`Profile for ${params.address}:`, response.data);
        } catch (err) {
          console.log(`Profile error for ${params.address}:`, err);
          // Return empty profile if not found
          response = { data: { primaryName: '', avatar: '' } };
        }
        break;
        
      case 'getNamesOwned':
        response = await api.get(`/utils/names_owner/${params.address}`);
        break;
        
      case 'batchResolve':
        // Resolve multiple addresses in parallel
        console.log('Batch resolving addresses:', params.addresses);
        const results = await Promise.all(
          params.addresses.map(async (address: string) => {
            try {
              const profileRes = await api.get(`/resolve/profile/${address}`);
              console.log(`Resolved ${address}:`, profileRes.data);
              return {
                address,
                profile: profileRes.data,
                success: true
              };
            } catch (error: any) {
              console.log(`Failed to resolve profile for ${address}:`, error.response?.status);
              // If profile fails, try to get just the primary name
              try {
                const nameRes = await api.get(`/resolve/primary_name/${address}`);
                console.log(`Got primary name for ${address}:`, nameRes.data);
                return {
                  address,
                  profile: { primaryName: nameRes.data, avatar: '' },
                  success: true
                };
              } catch (nameError: any) {
                console.log(`No name found for ${address}:`, nameError.response?.status);
                return {
                  address,
                  profile: { primaryName: '', avatar: '' },
                  success: false
                };
              }
            }
          })
        );
        console.log('Batch resolve results:', results);
        response = { data: results };
        break;
        
      case 'getImage':
        response = await api.get(`/records/image/${params.tokenId}`);
        break;
        
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    res.status(200).json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('HL Names API error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to resolve' 
    });
  }
}