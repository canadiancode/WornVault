import { getCreators, getPosts, createCreator, createPost } from './index.js';

/**
 * Test API functions
 * This is a temporary testing file - remove in production
 */
export async function testApiFunctions() {
  console.log('🧪 Testing API functions...');

  try {
    // Test 1: Get creators
    console.log('1. Testing getCreators...');
    const creatorsResult = await getCreators(0, 5);
    if (creatorsResult.error) {
      console.error('❌ getCreators failed:', creatorsResult.error);
    } else {
      console.log('✅ getCreators success:', creatorsResult.data?.length || 0, 'creators found');
    }

    // Test 2: Get posts
    console.log('2. Testing getPosts...');
    const postsResult = await getPosts(0, 5);
    if (postsResult.error) {
      console.error('❌ getPosts failed:', postsResult.error);
    } else {
      console.log('✅ getPosts success:', postsResult.data?.length || 0, 'posts found');
    }

    // Test 3: Create a test creator (only if none exist)
    if (creatorsResult.data?.length === 0) {
      console.log('3. Testing createCreator...');
      const testCreator = {
        username: 'testcreator2',
        display_name: 'Test Creator 2',
        bio: 'This is a test creator for API testing',
        verification_status: 'pending'
      };
      
      const createResult = await createCreator(testCreator);
      if (createResult.error) {
        console.error('❌ createCreator failed:', createResult.error);
      } else {
        console.log('✅ createCreator success:', createResult.data?.username);
        
        // Test 4: Create a test post
        console.log('4. Testing createPost...');
        const testPost = {
          creator_id: createResult.data.id,
          content: 'This is a test post for API testing!',
          price: 25.00,
          currency: 'USD',
          status: 'published'
        };
        
        const postResult = await createPost(testPost);
        if (postResult.error) {
          console.error('❌ createPost failed:', postResult.error);
        } else {
          console.log('✅ createPost success:', postResult.data?.content);
        }
      }
    }

    console.log('🎉 API testing completed!');
    return true;
  } catch (error) {
    console.error('💥 API testing failed:', error);
    return false;
  }
}

/**
 * Test specific API function
 * @param {string} functionName - Name of function to test
 * @param {Array} args - Arguments to pass to function
 */
export async function testSpecificFunction(functionName, args = []) {
  console.log(`🧪 Testing ${functionName} with args:`, args);
  
  try {
    // Import the function dynamically
    const apiModule = await import('./index.js');
    const func = apiModule[functionName];
    
    if (!func) {
      console.error(`❌ Function ${functionName} not found`);
      return false;
    }
    
    const result = await func(...args);
    console.log(`✅ ${functionName} result:`, result);
    return result;
  } catch (error) {
    console.error(`❌ ${functionName} failed:`, error);
    return false;
  }
}
