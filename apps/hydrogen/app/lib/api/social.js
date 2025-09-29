import { supabase } from '../supabase.js';

/**
 * Social interactions API functions
 */

/**
 * LIKE FUNCTIONS
 */

/**
 * Like a post
 * @param {string} userId - User UUID
 * @param {string} postId - Post UUID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function likePost(userId, postId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { error } = await supabase
      .from('likes')
      .insert([{ user_id: userId, post_id: postId }]);

    if (error) {
      console.error('Error liking post:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in likePost:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Unlike a post
 * @param {string} userId - User UUID
 * @param {string} postId - Post UUID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function unlikePost(userId, postId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('Error unliking post:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in unlikePost:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check if user liked a post
 * @param {string} userId - User UUID
 * @param {string} postId - Post UUID
 * @returns {Promise<{liked: boolean, error: string|null}>}
 */
export async function isPostLiked(userId, postId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking like status:', error);
      return { liked: false, error: error.message };
    }

    return { liked: !!data, error: null };
  } catch (err) {
    console.error('Error in isPostLiked:', err);
    return { liked: false, error: err.message };
  }
}

/**
 * FOLLOW FUNCTIONS
 */

/**
 * Follow a creator
 * @param {string} followerId - Follower UUID
 * @param {string} followingId - Creator being followed UUID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function followCreator(followerId, followingId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: followerId, following_id: followingId }]);

    if (error) {
      console.error('Error following creator:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in followCreator:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Unfollow a creator
 * @param {string} followerId - Follower UUID
 * @param {string} followingId - Creator being unfollowed UUID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function unfollowCreator(followerId, followingId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error unfollowing creator:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in unfollowCreator:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check if user follows a creator
 * @param {string} followerId - Follower UUID
 * @param {string} followingId - Creator UUID
 * @returns {Promise<{following: boolean, error: string|null}>}
 */
export async function isFollowing(followerId, followingId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking follow status:', error);
      return { following: false, error: error.message };
    }

    return { following: !!data, error: null };
  } catch (err) {
    console.error('Error in isFollowing:', err);
    return { following: false, error: err.message };
  }
}

/**
 * Get followers of a creator
 * @param {string} creatorId - Creator UUID
 * @param {number} page - Page number (0-based)
 * @param {number} limit - Number of followers per page
 * @returns {Promise<{data: Array, error: string|null, hasMore: boolean}>}
 */
export async function getFollowers(creatorId, page = 0, limit = 20) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('follows')
      .select(`
        *,
        creators!follows_follower_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          verification_status
        )
      `)
      .eq('following_id', creatorId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching followers:', error);
      return { data: null, error: error.message, hasMore: false };
    }

    const hasMore = (from + data.length) < count;
    return { data, error: null, hasMore };
  } catch (err) {
    console.error('Error in getFollowers:', err);
    return { data: null, error: err.message, hasMore: false };
  }
}

/**
 * Get creators that a user follows
 * @param {string} userId - User UUID
 * @param {number} page - Page number (0-based)
 * @param {number} limit - Number of creators per page
 * @returns {Promise<{data: Array, error: string|null, hasMore: boolean}>}
 */
export async function getFollowing(userId, page = 0, limit = 20) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('follows')
      .select(`
        *,
        creators!follows_following_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          verification_status
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching following:', error);
      return { data: null, error: error.message, hasMore: false };
    }

    const hasMore = (from + data.length) < count;
    return { data, error: null, hasMore };
  } catch (err) {
    console.error('Error in getFollowing:', err);
    return { data: null, error: err.message, hasMore: false };
  }
}

/**
 * COMMENT FUNCTIONS
 */

/**
 * Add a comment to a post
 * @param {string} postId - Post UUID
 * @param {string} userId - User UUID
 * @param {string} content - Comment content
 * @param {string} parentCommentId - Parent comment ID for replies (optional)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function addComment(postId, userId, content, parentCommentId = null) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        user_id: userId,
        content,
        parent_comment_id: parentCommentId
      }])
      .select(`
        *,
        creators (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in addComment:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Get comments for a post
 * @param {string} postId - Post UUID
 * @param {number} page - Page number (0-based)
 * @param {number} limit - Number of comments per page
 * @returns {Promise<{data: Array, error: string|null, hasMore: boolean}>}
 */
export async function getComments(postId, page = 0, limit = 20) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('comments')
      .select(`
        *,
        creators (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null) // Only top-level comments
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching comments:', error);
      return { data: null, error: error.message, hasMore: false };
    }

    const hasMore = (from + data.length) < count;
    return { data, error: null, hasMore };
  } catch (err) {
    console.error('Error in getComments:', err);
    return { data: null, error: err.message, hasMore: false };
  }
}

/**
 * SHARE FUNCTIONS
 */

/**
 * Share a post
 * @param {string} userId - User UUID
 * @param {string} postId - Post UUID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function sharePost(userId, postId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { error } = await supabase
      .from('shares')
      .insert([{ user_id: userId, post_id: postId }]);

    if (error) {
      console.error('Error sharing post:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in sharePost:', err);
    return { success: false, error: err.message };
  }
}
