import { supabase } from '../supabase.js';

/**
 * Posts API functions
 */

/**
 * Get all posts with pagination (for feed)
 * @param {number} page - Page number (0-based)
 * @param {number} limit - Number of posts per page
 * @param {string} status - Post status filter (default: 'published')
 * @returns {Promise<{data: Array, error: string|null, hasMore: boolean}>}
 */
export async function getPosts(page = 0, limit = 20, status = 'published') {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        creators (
          id,
          username,
          display_name,
          avatar_url,
          verification_status
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching posts:', error);
      return { data: null, error: error.message, hasMore: false };
    }

    const hasMore = (from + data.length) < count;
    return { data, error: null, hasMore };
  } catch (err) {
    console.error('Error in getPosts:', err);
    return { data: null, error: err.message, hasMore: false };
  }
}

/**
 * Get posts by creator ID
 * @param {string} creatorId - Creator UUID
 * @param {number} page - Page number (0-based)
 * @param {number} limit - Number of posts per page
 * @returns {Promise<{data: Array, error: string|null, hasMore: boolean}>}
 */
export async function getPostsByCreator(creatorId, page = 0, limit = 20) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        creators (
          id,
          username,
          display_name,
          avatar_url,
          verification_status
        )
      `)
      .eq('creator_id', creatorId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching creator posts:', error);
      return { data: null, error: error.message, hasMore: false };
    }

    const hasMore = (from + data.length) < count;
    return { data, error: null, hasMore };
  } catch (err) {
    console.error('Error in getPostsByCreator:', err);
    return { data: null, error: err.message, hasMore: false };
  }
}

/**
 * Get single post by ID
 * @param {string} postId - Post UUID
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getPostById(postId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        creators (
          id,
          username,
          display_name,
          avatar_url,
          verification_status,
          bio
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getPostById:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @param {string} postData.creator_id - Creator UUID
 * @param {string} postData.content - Post content
 * @param {number} postData.price - Price
 * @param {string} postData.currency - Currency code
 * @param {string} postData.featured_image_url - Featured image URL
 * @param {Array} postData.image_urls - Array of image URLs
 * @param {Array} postData.tags - Array of tags
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function createPost(postData) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    // Validate required fields
    if (!postData.creator_id || !postData.content || !postData.price) {
      return { data: null, error: 'Creator ID, content, and price are required' };
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select(`
        *,
        creators (
          id,
          username,
          display_name,
          avatar_url,
          verification_status
        )
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in createPost:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Update post
 * @param {string} postId - Post UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function updatePost(postId, updates) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select(`
        *,
        creators (
          id,
          username,
          display_name,
          avatar_url,
          verification_status
        )
      `)
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in updatePost:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Delete post
 * @param {string} postId - Post UUID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deletePost(postId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in deletePost:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Search posts by content or tags
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function searchPosts(query, limit = 20) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        creators (
          id,
          username,
          display_name,
          avatar_url,
          verification_status
        )
      `)
      .or(`content.ilike.%${query}%,tags.cs.{${query}}`)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching posts:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in searchPosts:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Get trending posts (most liked in last 7 days)
 * @param {number} limit - Maximum results
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function getTrendingPosts(limit = 10) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        creators (
          id,
          username,
          display_name,
          avatar_url,
          verification_status
        )
      `)
      .eq('status', 'published')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('like_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending posts:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getTrendingPosts:', err);
    return { data: null, error: err.message };
  }
}
