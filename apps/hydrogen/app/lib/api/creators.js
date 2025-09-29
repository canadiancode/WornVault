import { supabase } from '../supabase.js';
import { withCache, cacheKeys, cacheInvalidation } from '../cache.js';

/**
 * Creator API functions
 */

/**
 * Get all creators with pagination
 * @param {number} page - Page number (0-based)
 * @param {number} limit - Number of creators per page
 * @returns {Promise<{data: Array, error: string|null, hasMore: boolean}>}
 */
export async function getCreators(page = 0, limit = 20) {
  const cacheKey = cacheKeys.creators(page, limit);
  
  return await withCache(cacheKey, async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const from = page * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('creators')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching creators:', error);
        return { data: null, error: error.message, hasMore: false };
      }

      const hasMore = (from + data.length) < count;
      return { data, error: null, hasMore };
    } catch (err) {
      console.error('Error in getCreators:', err);
      return { data: null, error: err.message, hasMore: false };
    }
  });
}

/**
 * Get creator by ID
 * @param {string} creatorId - Creator UUID
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getCreatorById(creatorId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (error) {
      console.error('Error fetching creator:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getCreatorById:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Get creator by username
 * @param {string} username - Creator username
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getCreatorByUsername(username) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error fetching creator by username:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getCreatorByUsername:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Create a new creator profile for a Supabase user
 * @param {string} supabaseUserId - Supabase user ID
 * @param {Object} creatorData - Creator data
 * @param {string} creatorData.username - Unique username
 * @param {string} creatorData.display_name - Display name
 * @param {string} creatorData.bio - Bio text
 * @param {string} creatorData.avatar_url - Avatar image URL
 * @param {string} creatorData.role - User role (fan/creator)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function createCreator(supabaseUserId, creatorData) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    // Validate required fields
    if (!supabaseUserId || !creatorData.username || !creatorData.display_name) {
      return { data: null, error: 'Supabase user ID, username and display name are required' };
    }

    const creatorRecord = {
      supabase_user_id: supabaseUserId,
      username: creatorData.username,
      display_name: creatorData.display_name,
      bio: creatorData.bio || '',
      avatar_url: creatorData.avatar_url || null,
      role: creatorData.role || 'fan',
      is_creator: creatorData.role === 'creator' || false,
      ...creatorData
    };

    const { data, error } = await supabase
      .from('creators')
      .insert([creatorRecord])
      .select()
      .single();

    if (error) {
      console.error('Error creating creator:', error);
      return { data: null, error: error.message };
    }

    // Invalidate creator-related cache
    await cacheInvalidation.invalidateCreator(data.id);

    return { data, error: null };
  } catch (err) {
    console.error('Error in createCreator:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Get creator by Supabase user ID
 * @param {string} supabaseUserId - Supabase user ID
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getCreatorBySupabaseUserId(supabaseUserId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('supabase_user_id', supabaseUserId)
      .single();

    if (error) {
      console.error('Error fetching creator by Supabase user ID:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in getCreatorBySupabaseUserId:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Update creator profile
 * @param {string} creatorId - Creator UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function updateCreator(creatorId, updates) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('creators')
      .update(updates)
      .eq('id', creatorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating creator:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in updateCreator:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Delete creator (soft delete by archiving)
 * @param {string} creatorId - Creator UUID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteCreator(creatorId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    // Instead of hard delete, we could add a 'deleted_at' field
    // For now, we'll do a hard delete as per schema
    const { error } = await supabase
      .from('creators')
      .delete()
      .eq('id', creatorId);

    if (error) {
      console.error('Error deleting creator:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in deleteCreator:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Search creators by username or display name
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function searchCreators(query, limit = 10) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching creators:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in searchCreators:', err);
    return { data: null, error: err.message };
  }
}
