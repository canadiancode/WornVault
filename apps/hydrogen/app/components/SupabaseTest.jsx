import { useEffect, useState } from 'react';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test using our new API functions
        const { getCreators } = await import('~/lib/api/index.js');
        
        const result = await getCreators(0, 1);
        
        if (result.error) {
          setConnectionStatus(`❌ API Error: ${result.error}`);
          setIsConnected(false);
        } else {
          setConnectionStatus('✅ Supabase + API Connected Successfully!');
          setIsConnected(true);
          console.log('API test data:', result.data);
        }
      } catch (err) {
        setConnectionStatus(`❌ API Test Failed: ${err.message}`);
        setIsConnected(false);
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px',
      backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
      border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
      color: isConnected ? '#155724' : '#721c24'
    }}>
      <strong>Supabase Status:</strong> {connectionStatus}
    </div>
  );
}
