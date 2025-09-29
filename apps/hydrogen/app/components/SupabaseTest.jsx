import { useEffect, useState } from 'react';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        // Dynamically import Supabase to avoid SSR issues
        const { supabase } = await import('~/lib/supabase.js');
        
        if (!supabase) {
          setConnectionStatus('❌ Supabase not initialized (client-side only)');
          setIsConnected(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('creators')
          .select('*')
          .limit(1);
        
        if (error) {
          setConnectionStatus(`❌ Error: ${error.message}`);
          setIsConnected(false);
        } else {
          setConnectionStatus('✅ Supabase Connected Successfully!');
          setIsConnected(true);
          console.log('Supabase test data:', data);
        }
      } catch (err) {
        setConnectionStatus(`❌ Connection Failed: ${err.message}`);
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
