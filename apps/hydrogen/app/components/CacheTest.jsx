import { useEffect, useState } from 'react';

export function CacheTest() {
  const [cacheStatus, setCacheStatus] = useState('Testing...');
  const [isCaching, setIsCaching] = useState(false);

  useEffect(() => {
    async function testCache() {
      try {
        // Test using our cached API functions
        const { getCreators } = await import('~/lib/api/index.js');
        
        // First call - should be cache miss
        console.log('🔄 First API call (should be cache miss)...');
        const start1 = Date.now();
        const result1 = await getCreators(0, 1);
        const time1 = Date.now() - start1;
        
        // Second call - should be cache hit
        console.log('🔄 Second API call (should be cache hit)...');
        const start2 = Date.now();
        const result2 = await getCreators(0, 1);
        const time2 = Date.now() - start2;
        
        if (result1.error || result2.error) {
          setCacheStatus(`❌ API Error: ${result1.error || result2.error}`);
          setIsCaching(false);
        } else {
          const speedImprovement = time1 > 0 ? Math.round(((time1 - time2) / time1) * 100) : 0;
          setCacheStatus(`✅ Redis Caching Working! First call: ${time1}ms, Second call: ${time2}ms (${speedImprovement}% faster)`);
          setIsCaching(true);
        }
      } catch (err) {
        setCacheStatus(`❌ Cache Test Failed: ${err.message}`);
        setIsCaching(false);
      }
    }

    testCache();
  }, []);

  return (
    <div style={{
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px',
      backgroundColor: isCaching ? '#d4edda' : '#f8d7da',
      border: `1px solid ${isCaching ? '#c3e6cb' : '#f5c6cb'}`,
      color: isCaching ? '#155724' : '#721c24'
    }}>
      <strong>Redis Cache Status:</strong> {cacheStatus}
    </div>
  );
}
