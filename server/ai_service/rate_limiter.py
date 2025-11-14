"""
Rate Limiting Module for AI Service
Implements token bucket algorithm with Redis backend (optional) or in-memory storage
"""

import time
from collections import defaultdict
from threading import Lock
from functools import wraps
from flask import request, jsonify
import redis
import os

# Configuration
RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
REDIS_URL = os.getenv("REDIS_URL", None)  

# Rate limit tiers by user role
RATE_LIMITS = {
    "Patient": {
        "requests_per_minute": 10,
        "requests_per_hour": 100,
        "requests_per_day": 500
    },
    "Professional": {
        "requests_per_minute": 20,
        "requests_per_hour": 300,
        "requests_per_day": 2000
    },
    "NGO": {
        "requests_per_minute": 30,
        "requests_per_hour": 500,
        "requests_per_day": 5000
    },
    "Admin": {
        "requests_per_minute": 100,
        "requests_per_hour": 1000,
        "requests_per_day": 10000
    }
}


class InMemoryRateLimiter:
    """In-memory rate limiter using token bucket algorithm."""
    
    def __init__(self):
        self.requests = defaultdict(list)
        self.lock = Lock()
    
    def is_allowed(self, user_id: int, role: str) -> tuple[bool, dict]:
        """
        Check if request is allowed for user.
        
        Returns:
            (allowed: bool, info: dict)
        """
        if not RATE_LIMIT_ENABLED:
            return True, {}
        
        limits = RATE_LIMITS.get(role, RATE_LIMITS["Patient"])
        current_time = time.time()
        
        with self.lock:
            # Get user's request history
            user_requests = self.requests[user_id]
            
            # Remove old requests
            user_requests = [
                req_time for req_time in user_requests
                if current_time - req_time < 86400  # Keep last 24 hours
            ]
            self.requests[user_id] = user_requests
            
            # Count requests in different windows
            minute_count = sum(1 for t in user_requests if current_time - t < 60)
            hour_count = sum(1 for t in user_requests if current_time - t < 3600)
            day_count = len(user_requests)
            
            # Check limits
            if minute_count >= limits["requests_per_minute"]:
                return False, {
                    "limit": limits["requests_per_minute"],
                    "window": "minute",
                    "retry_after": 60
                }
            
            if hour_count >= limits["requests_per_hour"]:
                return False, {
                    "limit": limits["requests_per_hour"],
                    "window": "hour",
                    "retry_after": 3600
                }
            
            if day_count >= limits["requests_per_day"]:
                return False, {
                    "limit": limits["requests_per_day"],
                    "window": "day",
                    "retry_after": 86400
                }
            
            # Add current request
            user_requests.append(current_time)
            
            return True, {
                "remaining_minute": limits["requests_per_minute"] - minute_count - 1,
                "remaining_hour": limits["requests_per_hour"] - hour_count - 1,
                "remaining_day": limits["requests_per_day"] - day_count - 1
            }


class RedisRateLimiter:
    """Redis-based rate limiter for distributed systems."""
    
    def __init__(self, redis_url: str):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
    
    def is_allowed(self, user_id: int, role: str) -> tuple[bool, dict]:
        """Check if request is allowed using Redis."""
        if not RATE_LIMIT_ENABLED:
            return True, {}
        
        limits = RATE_LIMITS.get(role, RATE_LIMITS["Patient"])
        current_time = int(time.time())
        
        # Keys for different windows
        minute_key = f"rate_limit:{user_id}:minute:{current_time // 60}"
        hour_key = f"rate_limit:{user_id}:hour:{current_time // 3600}"
        day_key = f"rate_limit:{user_id}:day:{current_time // 86400}"
        
        pipe = self.redis_client.pipeline()
        
        # Increment and get counts
        pipe.incr(minute_key)
        pipe.expire(minute_key, 120)  # Keep for 2 minutes
        pipe.incr(hour_key)
        pipe.expire(hour_key, 7200)  # Keep for 2 hours
        pipe.incr(day_key)
        pipe.expire(day_key, 172800)  # Keep for 2 days
        
        results = pipe.execute()
        minute_count = results[0]
        hour_count = results[2]
        day_count = results[4]
        
        # Check limits
        if minute_count > limits["requests_per_minute"]:
            return False, {
                "limit": limits["requests_per_minute"],
                "window": "minute",
                "retry_after": 60
            }
        
        if hour_count > limits["requests_per_hour"]:
            return False, {
                "limit": limits["requests_per_hour"],
                "window": "hour",
                "retry_after": 3600
            }
        
        if day_count > limits["requests_per_day"]:
            return False, {
                "limit": limits["requests_per_day"],
                "window": "day",
                "retry_after": 86400
            }
        
        return True, {
            "remaining_minute": limits["requests_per_minute"] - minute_count,
            "remaining_hour": limits["requests_per_hour"] - hour_count,
            "remaining_day": limits["requests_per_day"] - day_count
        }


# Initialize rate limiter
if REDIS_URL:
    try:
        rate_limiter = RedisRateLimiter(REDIS_URL)
        print("✅ Using Redis-based rate limiter")
    except Exception as e:
        print(f"⚠️  Redis connection failed, using in-memory rate limiter: {e}")
        rate_limiter = InMemoryRateLimiter()
else:
    rate_limiter = InMemoryRateLimiter()
    print("✅ Using in-memory rate limiter")


def rate_limit(f):
    """
    Decorator to apply rate limiting to endpoints.
    Requires verify_user_token to be applied first.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not RATE_LIMIT_ENABLED:
            return f(*args, **kwargs)
        
        # Get user info from request (set by verify_user_token)
        if not hasattr(request, 'user'):
            return jsonify({
                "error": "Unauthorized",
                "message": "Authentication required for rate limiting"
            }), 401
        
        user_id = request.user.get('user_id')
        role = request.user.get('role', 'Patient')
        
        # Check rate limit
        allowed, info = rate_limiter.is_allowed(user_id, role)
        
        if not allowed:
            response = jsonify({
                "error": "Rate Limit Exceeded",
                "message": f"Too many requests. Limit: {info['limit']} per {info['window']}",
                "retry_after": info['retry_after'],
                "limit": info['limit'],
                "window": info['window']
            })
            response.status_code = 429
            response.headers['Retry-After'] = str(info['retry_after'])
            response.headers['X-RateLimit-Limit'] = str(info['limit'])
            response.headers['X-RateLimit-Window'] = info['window']
            
            print(f"⚠️  Rate limit exceeded for user {user_id} ({role}): {info['limit']}/{info['window']}")
            
            return response
        
        # Add rate limit info to response headers
        response = f(*args, **kwargs)
        
        if isinstance(response, tuple):
            response_obj, status_code = response[0], response[1]
        else:
            response_obj = response
        
        if hasattr(response_obj, 'headers'):
            if 'remaining_minute' in info:
                response_obj.headers['X-RateLimit-Remaining-Minute'] = str(info['remaining_minute'])
            if 'remaining_hour' in info:
                response_obj.headers['X-RateLimit-Remaining-Hour'] = str(info['remaining_hour'])
            if 'remaining_day' in info:
                response_obj.headers['X-RateLimit-Remaining-Day'] = str(info['remaining_day'])
        
        return response
    
    return decorated_function


def get_rate_limit_status(user_id: int, role: str) -> dict:
    """Get current rate limit status for a user."""
    limits = RATE_LIMITS.get(role, RATE_LIMITS["Patient"])
    
    if isinstance(rate_limiter, InMemoryRateLimiter):
        with rate_limiter.lock:
            user_requests = rate_limiter.requests.get(user_id, [])
            current_time = time.time()
            
            minute_count = sum(1 for t in user_requests if current_time - t < 60)
            hour_count = sum(1 for t in user_requests if current_time - t < 3600)
            day_count = sum(1 for t in user_requests if current_time - t < 86400)
    else:
        # Redis implementation
        current_time = int(time.time())
        minute_key = f"rate_limit:{user_id}:minute:{current_time // 60}"
        hour_key = f"rate_limit:{user_id}:hour:{current_time // 3600}"
        day_key = f"rate_limit:{user_id}:day:{current_time // 86400}"
        
        minute_count = int(rate_limiter.redis_client.get(minute_key) or 0)
        hour_count = int(rate_limiter.redis_client.get(hour_key) or 0)
        day_count = int(rate_limiter.redis_client.get(day_key) or 0)
    
    return {
        "user_id": user_id,
        "role": role,
        "limits": limits,
        "current_usage": {
            "minute": minute_count,
            "hour": hour_count,
            "day": day_count
        },
        "remaining": {
            "minute": max(0, limits["requests_per_minute"] - minute_count),
            "hour": max(0, limits["requests_per_hour"] - hour_count),
            "day": max(0, limits["requests_per_day"] - day_count)
        }
    }
