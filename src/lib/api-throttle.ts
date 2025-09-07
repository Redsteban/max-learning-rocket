// Advanced API Throttling System to prevent 529 errors
// Implements exponential backoff, request queuing, and smart retry logic

import { EventEmitter } from 'events';

interface ThrottleConfig {
  maxRequestsPerSecond?: number;
  maxRequestsPerMinute?: number;
  maxRetries?: number;
  initialRetryDelay?: number;
  maxRetryDelay?: number;
  backoffMultiplier?: number;
  jitterRange?: number;
  enableCache?: boolean;
  cacheTTL?: number;
}

interface QueuedRequest {
  id: string;
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  retries: number;
  timestamp: number;
  priority?: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// Global throttle manager
class ApiThrottleManager extends EventEmitter {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private requestCounts = {
    second: { count: 0, resetTime: Date.now() + 1000 },
    minute: { count: 0, resetTime: Date.now() + 60000 },
  };
  private cache = new Map<string, CacheEntry>();
  private config: Required<ThrottleConfig>;
  private circuitBreaker = {
    failures: 0,
    lastFailureTime: 0,
    isOpen: false,
    halfOpenRetries: 0,
  };

  constructor(config: ThrottleConfig = {}) {
    super();
    this.config = {
      maxRequestsPerSecond: config.maxRequestsPerSecond ?? 5,
      maxRequestsPerMinute: config.maxRequestsPerMinute ?? 50,
      maxRetries: config.maxRetries ?? 3,
      initialRetryDelay: config.initialRetryDelay ?? 1000,
      maxRetryDelay: config.maxRetryDelay ?? 32000,
      backoffMultiplier: config.backoffMultiplier ?? 2,
      jitterRange: config.jitterRange ?? 0.1,
      enableCache: config.enableCache ?? true,
      cacheTTL: config.cacheTTL ?? 60000, // 1 minute default
    };
    
    // Start processing queue
    this.startProcessing();
    
    // Clean cache periodically
    if (this.config.enableCache) {
      setInterval(() => this.cleanCache(), 60000);
    }
  }

  // Add request to throttled queue
  async throttle<T>(
    fn: () => Promise<T>,
    options?: {
      cacheKey?: string;
      priority?: number;
      skipCache?: boolean;
    }
  ): Promise<T> {
    // Check circuit breaker
    if (this.isCircuitOpen()) {
      throw new Error('Circuit breaker is open. API temporarily unavailable.');
    }

    // Check cache if enabled
    if (this.config.enableCache && options?.cacheKey && !options.skipCache) {
      const cached = this.getFromCache(options.cacheKey);
      if (cached !== null) {
        this.emit('cache-hit', options.cacheKey);
        return cached;
      }
    }

    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: this.generateId(),
        fn: async () => {
          try {
            const result = await fn();
            
            // Cache successful response
            if (this.config.enableCache && options?.cacheKey) {
              this.addToCache(options.cacheKey, result);
            }
            
            // Reset circuit breaker on success
            this.circuitBreaker.failures = 0;
            this.circuitBreaker.isOpen = false;
            
            return result;
          } catch (error) {
            // Handle rate limit errors
            if (this.isRateLimitError(error)) {
              this.handleRateLimitError(error);
            }
            throw error;
          }
        },
        resolve,
        reject,
        retries: 0,
        timestamp: Date.now(),
        priority: options?.priority ?? 0,
      };

      // Add to queue with priority
      this.addToQueue(request);
      this.emit('request-queued', request.id);
    });
  }

  // Process queue with rate limiting
  private async startProcessing() {
    if (this.processing) return;
    this.processing = true;

    while (true) {
      await this.processNext();
      await this.sleep(100); // Check queue every 100ms
    }
  }

  private async processNext() {
    // Check if we can process
    if (!this.canProcess()) {
      return;
    }

    // Get next request from queue
    const request = this.queue.shift();
    if (!request) {
      return;
    }

    // Update rate limit counters
    this.updateCounters();

    try {
      this.emit('request-processing', request.id);
      const result = await request.fn();
      request.resolve(result);
      this.emit('request-success', request.id);
    } catch (error: any) {
      // Handle retries
      if (request.retries < this.config.maxRetries && this.shouldRetry(error)) {
        request.retries++;
        const delay = this.calculateRetryDelay(request.retries);
        
        this.emit('request-retry', { 
          id: request.id, 
          retry: request.retries, 
          delay 
        });
        
        // Re-queue with delay
        setTimeout(() => {
          this.addToQueue(request);
        }, delay);
      } else {
        request.reject(error);
        this.emit('request-failed', { id: request.id, error });
        
        // Update circuit breaker
        this.circuitBreaker.failures++;
        this.circuitBreaker.lastFailureTime = Date.now();
        
        // Open circuit if too many failures
        if (this.circuitBreaker.failures >= 5) {
          this.circuitBreaker.isOpen = true;
          setTimeout(() => {
            this.circuitBreaker.isOpen = false;
            this.circuitBreaker.halfOpenRetries = 0;
          }, 30000); // 30 seconds cooldown
        }
      }
    }
  }

  private canProcess(): boolean {
    const now = Date.now();

    // Reset counters if needed
    if (now >= this.requestCounts.second.resetTime) {
      this.requestCounts.second = { count: 0, resetTime: now + 1000 };
    }
    if (now >= this.requestCounts.minute.resetTime) {
      this.requestCounts.minute = { count: 0, resetTime: now + 60000 };
    }

    // Check rate limits
    return (
      this.requestCounts.second.count < this.config.maxRequestsPerSecond &&
      this.requestCounts.minute.count < this.config.maxRequestsPerMinute
    );
  }

  private updateCounters() {
    this.requestCounts.second.count++;
    this.requestCounts.minute.count++;
  }

  private addToQueue(request: QueuedRequest) {
    // Insert based on priority
    const index = this.queue.findIndex(r => r.priority! < request.priority!);
    if (index === -1) {
      this.queue.push(request);
    } else {
      this.queue.splice(index, 0, request);
    }
  }

  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = Math.min(
      this.config.initialRetryDelay * Math.pow(this.config.backoffMultiplier, retryCount - 1),
      this.config.maxRetryDelay
    );

    // Add jitter to prevent thundering herd
    const jitter = baseDelay * this.config.jitterRange * (Math.random() - 0.5) * 2;
    return Math.max(0, baseDelay + jitter);
  }

  private isRateLimitError(error: any): boolean {
    return (
      error?.status === 429 ||
      error?.status === 529 ||
      error?.message?.includes('rate limit') ||
      error?.message?.includes('too many requests')
    );
  }

  private handleRateLimitError(error: any) {
    // Extract retry-after header if available
    const retryAfter = error?.headers?.['retry-after'];
    if (retryAfter) {
      const delay = parseInt(retryAfter) * 1000;
      
      // Pause processing for the specified duration
      this.pauseProcessing(delay);
    }
  }

  private pauseProcessing(duration: number) {
    const wasProcessing = this.processing;
    this.processing = false;
    
    setTimeout(() => {
      this.processing = wasProcessing;
      if (wasProcessing) {
        this.startProcessing();
      }
    }, duration);
    
    this.emit('processing-paused', duration);
  }

  private shouldRetry(error: any): boolean {
    // Retry on rate limit errors or network errors
    return (
      this.isRateLimitError(error) ||
      error?.code === 'ECONNRESET' ||
      error?.code === 'ETIMEDOUT' ||
      error?.status >= 500
    );
  }

  private isCircuitOpen(): boolean {
    if (!this.circuitBreaker.isOpen) return false;

    // Check if we should try half-open state
    const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime;
    if (timeSinceLastFailure > 15000 && this.circuitBreaker.halfOpenRetries < 3) {
      this.circuitBreaker.halfOpenRetries++;
      return false; // Allow one request through
    }

    return true;
  }

  // Cache management
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private addToCache(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.config.cacheTTL,
    });
  }

  private cleanCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for monitoring
  getQueueSize(): number {
    return this.queue.length;
  }

  getStats() {
    return {
      queueSize: this.queue.length,
      requestsPerSecond: this.requestCounts.second.count,
      requestsPerMinute: this.requestCounts.minute.count,
      cacheSize: this.cache.size,
      circuitBreakerStatus: this.circuitBreaker.isOpen ? 'open' : 'closed',
      failures: this.circuitBreaker.failures,
    };
  }

  clearQueue() {
    const requests = [...this.queue];
    this.queue = [];
    
    // Reject all queued requests
    for (const request of requests) {
      request.reject(new Error('Queue cleared'));
    }
  }

  updateConfig(config: Partial<ThrottleConfig>) {
    this.config = { ...this.config, ...config };
  }
}

// Create singleton instances for different API types
export const claudeThrottle = new ApiThrottleManager({
  maxRequestsPerSecond: 2,
  maxRequestsPerMinute: 20,
  maxRetries: 3,
  initialRetryDelay: 2000,
  maxRetryDelay: 60000,
  enableCache: true,
  cacheTTL: 300000, // 5 minutes for Claude responses
});

export const generalApiThrottle = new ApiThrottleManager({
  maxRequestsPerSecond: 10,
  maxRequestsPerMinute: 100,
  maxRetries: 2,
  initialRetryDelay: 1000,
  maxRetryDelay: 10000,
  enableCache: true,
  cacheTTL: 60000,
});

// Utility function for easy use
export async function throttleApiCall<T>(
  fn: () => Promise<T>,
  options?: {
    throttle?: ApiThrottleManager;
    cacheKey?: string;
    priority?: number;
  }
): Promise<T> {
  const throttle = options?.throttle || generalApiThrottle;
  return throttle.throttle(fn, options);
}

// React hook for monitoring throttle status
export function useThrottleStatus(throttle: ApiThrottleManager) {
  if (typeof window === 'undefined') return null;
  
  const [stats, setStats] = require('react').useState(throttle.getStats());
  
  require('react').useEffect(() => {
    const interval = setInterval(() => {
      setStats(throttle.getStats());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [throttle]);
  
  return stats;
}

export default ApiThrottleManager;