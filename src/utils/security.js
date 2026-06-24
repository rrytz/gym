import { supabase } from '../supabaseClient';

// Track failed login attempts and block after 5 attempts
export const trackLoginAttempt = async (email, ipAddress = null, userAgent = null) => {
  try {
    // Record the attempt
    await supabase.from('failed_login_attempts').insert({
      email: email.toLowerCase(),
      ip_address: ipAddress,
      user_agent: userAgent
    });

    // Check if this email has 5+ failed attempts in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .eq('email', email.toLowerCase())
      .gte('attempt_timestamp', fifteenMinutesAgo);

    if (error) throw error;

    if (data && data.length >= 5) {
      return {
        blocked: true,
        remainingAttempts: 0,
        message: 'Too many failed attempts. Please try again in 15 minutes.'
      };
    }

    return {
      blocked: false,
      remainingAttempts: 5 - (data?.length || 0),
      message: `${5 - (data?.length || 0)} attempts remaining`
    };
  } catch (error) {
    console.error('Error tracking login attempt:', error);
    return { blocked: false, remainingAttempts: 5, message: 'Unable to track attempts' };
  }
};

// Clear failed login attempts on successful login
export const clearLoginAttempts = async (email) => {
  try {
    await supabase
      .from('failed_login_attempts')
      .delete()
      .eq('email', email.toLowerCase());
  } catch (error) {
    console.error('Error clearing login attempts:', error);
  }
};

// Rate limiting for sensitive operations
export const checkRateLimit = async (userId, operationType, maxRequests = 10) => {
  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    // Check existing rate limit record
    const { data: existing, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('operation_type', operationType)
      .gt('window_end', now.toISOString())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      // Update existing record
      if (existing.request_count >= maxRequests) {
        return {
          allowed: false,
          remainingRequests: 0,
          resetTime: existing.window_end
        };
      }

      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('id', existing.id);

      if (updateError) throw updateError;

      return {
        allowed: true,
        remainingRequests: maxRequests - existing.request_count - 1,
        resetTime: existing.window_end
      };
    }

    // Create new rate limit record
    const { error: insertError } = await supabase
      .from('rate_limits')
      .insert({
        user_id: userId,
        operation_type: operationType,
        request_count: 1,
        window_start: now.toISOString(),
        window_end: windowEnd.toISOString()
      });

    if (insertError) throw insertError;

    return {
      allowed: true,
      remainingRequests: maxRequests - 1,
      resetTime: windowEnd.toISOString()
    };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // Allow request if rate limiting fails
    return { allowed: true, remainingRequests: maxRequests, resetTime: null };
  }
};

// Check if user has admin role
export const isAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
