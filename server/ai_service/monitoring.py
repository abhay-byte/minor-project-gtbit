"""
Monitoring and Metrics Module for AI Service
Tracks performance, errors, and usage statistics
"""

import time
from collections import defaultdict, deque
from threading import Lock
from datetime import datetime, timedelta
import json
from functools import wraps
from flask import request, g
import os

# Configuration
MONITORING_ENABLED = os.getenv("MONITORING_ENABLED", "true").lower() == "true"
METRICS_RETENTION_HOURS = int(os.getenv("METRICS_RETENTION_HOURS", "24"))


class MetricsCollector:
    """Collects and stores application metrics."""
    
    def __init__(self):
        self.lock = Lock()
        
        # Request metrics
        self.request_count = 0
        self.request_times = deque(maxlen=10000)
        self.requests_by_endpoint = defaultdict(int)
        self.requests_by_user = defaultdict(int)
        self.requests_by_agent = defaultdict(int)
        
        # Error tracking
        self.error_count = 0
        self.errors_by_type = defaultdict(int)
        self.recent_errors = deque(maxlen=100)
        
        # Agent usage
        self.agent_response_times = defaultdict(list)
        self.intent_distribution = defaultdict(int)
        self.collection_usage = defaultdict(int)
        
        # Image processing
        self.image_requests = 0
        self.image_processing_times = deque(maxlen=1000)
        
        # Rate limit hits
        self.rate_limit_hits = 0
        self.rate_limit_by_user = defaultdict(int)
        
        # Crisis detection
        self.crisis_detections = 0
        self.crisis_by_type = defaultdict(int)
        
        print("✅ Metrics collector initialized")
    
    def record_request(self, endpoint: str, user_id: int = None, duration: float = 0):
        """Record a request."""
        with self.lock:
            self.request_count += 1
            self.request_times.append({
                'timestamp': time.time(),
                'duration': duration,
                'endpoint': endpoint
            })
            self.requests_by_endpoint[endpoint] += 1
            
            if user_id:
                self.requests_by_user[user_id] += 1
    
    def record_agent_response(self, agent_name: str, duration: float, intent: str = None):
        """Record agent response time and usage."""
        with self.lock:
            self.requests_by_agent[agent_name] += 1
            self.agent_response_times[agent_name].append(duration)
            
            # Keep only last 1000 times per agent
            if len(self.agent_response_times[agent_name]) > 1000:
                self.agent_response_times[agent_name] = self.agent_response_times[agent_name][-1000:]
            
            if intent:
                self.intent_distribution[intent] += 1
    
    def record_collection_query(self, collection_name: str):
        """Record knowledge base collection usage."""
        with self.lock:
            self.collection_usage[collection_name] += 1
    
    def record_error(self, error_type: str, error_message: str, endpoint: str = None, user_id: int = None):
        """Record an error."""
        with self.lock:
            self.error_count += 1
            self.errors_by_type[error_type] += 1
            self.recent_errors.append({
                'timestamp': datetime.now().isoformat(),
                'type': error_type,
                'message': error_message,
                'endpoint': endpoint,
                'user_id': user_id
            })
    
    def record_image_processing(self, duration: float):
        """Record image processing time."""
        with self.lock:
            self.image_requests += 1
            self.image_processing_times.append({
                'timestamp': time.time(),
                'duration': duration
            })
    
    def record_rate_limit_hit(self, user_id: int):
        """Record rate limit exceeded event."""
        with self.lock:
            self.rate_limit_hits += 1
            self.rate_limit_by_user[user_id] += 1
    
    def record_crisis_detection(self, crisis_type: str):
        """Record crisis detection event."""
        with self.lock:
            self.crisis_detections += 1
            self.crisis_by_type[crisis_type] += 1
    
    def get_metrics_summary(self) -> dict:
        """Get summary of all metrics."""
        with self.lock:
            # Calculate average response times
            recent_times = [r['duration'] for r in list(self.request_times)[-100:]]
            avg_response_time = sum(recent_times) / len(recent_times) if recent_times else 0
            
            # Agent performance
            agent_performance = {}
            for agent, times in self.agent_response_times.items():
                recent_agent_times = times[-100:]
                agent_performance[agent] = {
                    'count': self.requests_by_agent[agent],
                    'avg_time': sum(recent_agent_times) / len(recent_agent_times) if recent_agent_times else 0,
                    'min_time': min(recent_agent_times) if recent_agent_times else 0,
                    'max_time': max(recent_agent_times) if recent_agent_times else 0
                }
            
            # Image processing stats
            recent_image_times = [r['duration'] for r in list(self.image_processing_times)[-100:]]
            avg_image_time = sum(recent_image_times) / len(recent_image_times) if recent_image_times else 0
            
            return {
                'timestamp': datetime.now().isoformat(),
                'uptime_seconds': time.time() - self.request_times[0]['timestamp'] if self.request_times else 0,
                'requests': {
                    'total': self.request_count,
                    'by_endpoint': dict(self.requests_by_endpoint),
                    'by_agent': dict(self.requests_by_agent),
                    'avg_response_time': round(avg_response_time, 3)
                },
                'errors': {
                    'total': self.error_count,
                    'by_type': dict(self.errors_by_type),
                    'error_rate': round(self.error_count / max(self.request_count, 1) * 100, 2)
                },
                'agent_performance': agent_performance,
                'intents': dict(self.intent_distribution),
                'collections': dict(self.collection_usage),
                'images': {
                    'total': self.image_requests,
                    'avg_processing_time': round(avg_image_time, 3)
                },
                'rate_limiting': {
                    'hits': self.rate_limit_hits,
                    'top_users': dict(sorted(self.rate_limit_by_user.items(), key=lambda x: x[1], reverse=True)[:10])
                },
                'crisis': {
                    'detections': self.crisis_detections,
                    'by_type': dict(self.crisis_by_type)
                },
                'top_users': dict(sorted(self.requests_by_user.items(), key=lambda x: x[1], reverse=True)[:10])
            }
    
    def get_recent_errors(self, limit: int = 20) -> list:
        """Get recent errors."""
        with self.lock:
            return list(self.recent_errors)[-limit:]
    
    def reset_metrics(self):
        """Reset all metrics (useful for testing)."""
        with self.lock:
            self.__init__()
            print("✅ Metrics reset")


# Global metrics collector
metrics = MetricsCollector() if MONITORING_ENABLED else None


def monitor_request(f):
    """Decorator to monitor request performance."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not MONITORING_ENABLED or not metrics:
            return f(*args, **kwargs)
        
        # Record start time
        g.start_time = time.time()
        
        # Get endpoint info
        endpoint = request.endpoint or 'unknown'
        user_id = getattr(request, 'user', {}).get('user_id')
        
        try:
            # Execute the function
            response = f(*args, **kwargs)
            
            # Record successful request
            duration = time.time() - g.start_time
            metrics.record_request(endpoint, user_id, duration)
            
            return response
            
        except Exception as e:
            # Record error
            duration = time.time() - g.start_time
            metrics.record_error(
                error_type=type(e).__name__,
                error_message=str(e),
                endpoint=endpoint,
                user_id=user_id
            )
            metrics.record_request(endpoint, user_id, duration)
            raise
    
    return decorated_function


def log_agent_usage(agent_name: str, intent: str = None):
    """Log agent usage after processing."""
    if not MONITORING_ENABLED or not metrics:
        return
    
    if hasattr(g, 'start_time'):
        duration = time.time() - g.start_time
        metrics.record_agent_response(agent_name, duration, intent)


def log_collection_query(collection_name: str):
    """Log knowledge base collection query."""
    if MONITORING_ENABLED and metrics:
        metrics.record_collection_query(collection_name)


def log_image_processing(start_time: float):
    """Log image processing time."""
    if MONITORING_ENABLED and metrics:
        duration = time.time() - start_time
        metrics.record_image_processing(duration)


def log_rate_limit_hit(user_id: int):
    """Log rate limit hit."""
    if MONITORING_ENABLED and metrics:
        metrics.record_rate_limit_hit(user_id)


def log_crisis_detection(crisis_type: str):
    """Log crisis detection."""
    if MONITORING_ENABLED and metrics:
        metrics.record_crisis_detection(crisis_type)


class HealthCheck:
    """System health check."""
    
    @staticmethod
    def check_all() -> dict:
        """Run all health checks."""
        checks = {
            'timestamp': datetime.now().isoformat(),
            'status': 'healthy',
            'checks': {}
        }
        
        # Check embedding model
        try:
            from __main__ import embedding_model
            checks['checks']['embedding_model'] = {
                'status': 'healthy' if embedding_model is not None else 'unavailable',
                'message': 'Embedding model loaded' if embedding_model else 'Not initialized'
            }
        except:
            checks['checks']['embedding_model'] = {
                'status': 'error',
                'message': 'Could not access embedding model'
            }
        
        # Check collections
        try:
            from __main__ import collections
            checks['checks']['collections'] = {
                'status': 'healthy' if collections else 'unavailable',
                'count': len(collections) if collections else 0,
                'names': list(collections.keys()) if collections else []
            }
        except:
            checks['checks']['collections'] = {
                'status': 'error',
                'message': 'Could not access collections'
            }
        
        # Check Ollama connection
        try:
            import requests
            from __main__ import OLLAMA_API_URL
            response = requests.get(f"{OLLAMA_API_URL}/api/tags", timeout=2)
            checks['checks']['ollama'] = {
                'status': 'healthy' if response.status_code == 200 else 'degraded',
                'message': 'Ollama API accessible'
            }
        except:
            checks['checks']['ollama'] = {
                'status': 'error',
                'message': 'Cannot connect to Ollama API'
            }
            checks['status'] = 'degraded'
        
        # Check Node.js server
        try:
            import requests
            from __main__ import NODE_SERVER_URL
            response = requests.get(f"{NODE_SERVER_URL}/api/health", timeout=2)
            checks['checks']['node_server'] = {
                'status': 'healthy' if response.status_code == 200 else 'degraded',
                'message': 'Node.js server accessible'
            }
        except:
            checks['checks']['node_server'] = {
                'status': 'warning',
                'message': 'Cannot connect to Node.js server'
            }
        
        # Overall status
        if any(check['status'] == 'error' for check in checks['checks'].values()):
            checks['status'] = 'unhealthy'
        elif any(check['status'] in ['degraded', 'warning'] for check in checks['checks'].values()):
            checks['status'] = 'degraded'
        
        return checks
