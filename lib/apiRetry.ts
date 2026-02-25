/**
 * API Retry Utility - Global Retry Logic for all API calls
 *
 * Provides configurable retry logic with exponential backoff for failed API requests.
 * Implements best practices for handling transient network errors.
 */

export interface RetryConfig {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxRetries?: number;

  /**
   * Initial delay in milliseconds before first retry (default: 1000ms)
   */
  initialDelay?: number;

  /**
   * Maximum delay in milliseconds between retries (default: 10000ms)
   */
  maxDelay?: number;

  /**
   * Exponential backoff multiplier (default: 2)
   */
  backoffMultiplier?: number;

  /**
   * HTTP status codes that should trigger a retry (default: [408, 429, 500, 502, 503, 504])
   */
  retryableStatusCodes?: number[];

  /**
   * Callback function called on each retry attempt
   */
  onRetry?: (attempt: number, error: any, delay: number) => void;

  /**
   * Callback function called when all retries fail
   */
  onAllRetiresFailed?: (error: any) => void;

  /**
   * Timeout for each individual request in milliseconds (default: 15000ms)
   */
  timeout?: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  onRetry: () => {},
  onAllRetiresFailed: () => {},
  timeout: 15000,
};

/**
 * Calculate delay for next retry attempt using exponential backoff
 */
function calculateDelay(attempt: number, config: Required<RetryConfig>): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Check if error is retryable based on status code or network error
 */
function isRetryable(error: any, config: Required<RetryConfig>): boolean {
  // Network errors (no response)
  if (!error.response && (error.name === 'TypeError' || error.name === 'NetworkError' || error.name === 'AbortError')) {
    return true;
  }

  // HTTP status code errors
  if (error.response?.status) {
    return config.retryableStatusCodes.includes(error.response.status);
  }

  // Response status from fetch API
  if (typeof error.status === 'number') {
    return config.retryableStatusCodes.includes(error.status);
  }

  return false;
}

/**
 * Generic retry wrapper for any async function
 *
 * @example
 * ```typescript
 * const result = await retryAsync(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *   },
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  const finalConfig: Required<RetryConfig> = { ...DEFAULT_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
    try {
      console.log(`🔄 [RETRY] Attempt ${attempt + 1}/${finalConfig.maxRetries}`);

      const data = await fn();

      console.log(`✅ [RETRY] Success on attempt ${attempt + 1}`);
      return {
        success: true,
        data,
        attempts: attempt + 1,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`❌ [RETRY] Attempt ${attempt + 1} failed:`, error.message || error);

      // Check if we should retry
      const shouldRetry = attempt < finalConfig.maxRetries - 1 && isRetryable(error, finalConfig);

      if (!shouldRetry) {
        console.error(`❌ [RETRY] Not retryable or max retries reached`);
        break;
      }

      // Calculate delay and notify
      const delay = calculateDelay(attempt, finalConfig);
      finalConfig.onRetry(attempt + 1, error, delay);

      console.log(`⏳ [RETRY] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  finalConfig.onAllRetiresFailed(lastError);

  return {
    success: false,
    error: lastError,
    attempts: finalConfig.maxRetries,
  };
}

/**
 * Retry wrapper specifically for fetch API calls
 *
 * @example
 * ```typescript
 * const result = await retryFetch('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ data: 'value' })
 * }, {
 *   maxRetries: 3
 * });
 * ```
 */
export async function retryFetch(
  url: string,
  fetchOptions: RequestInit = {},
  retryConfig: RetryConfig = {}
): Promise<RetryResult<Response>> {
  const finalConfig: Required<RetryConfig> = { ...DEFAULT_CONFIG, ...retryConfig };

  return retryAsync(async () => {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        const error: any = new Error(`HTTP Error ${response.status}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Enhance error with status for retryability check
      if (error.name === 'AbortError') {
        error.status = 408; // Request Timeout
      }

      throw error;
    }
  }, finalConfig);
}

/**
 * Retry wrapper for fetch with automatic JSON parsing
 *
 * @example
 * ```typescript
 * const result = await retryFetchJSON<UserData>('/api/user', {
 *   method: 'GET'
 * });
 *
 * if (result.success) {
 *   console.log(result.data); // TypeScript knows this is UserData
 * }
 * ```
 */
export async function retryFetchJSON<T = any>(
  url: string,
  fetchOptions: RequestInit = {},
  retryConfig: RetryConfig = {}
): Promise<RetryResult<T>> {
  const result = await retryFetch(url, fetchOptions, retryConfig);

  if (result.success && result.data) {
    try {
      const jsonData = await result.data.json();
      return {
        success: true,
        data: jsonData,
        attempts: result.attempts,
      };
    } catch (error) {
      return {
        success: false,
        error: new Error('Failed to parse JSON response'),
        attempts: result.attempts,
      };
    }
  }

  return {
    success: false,
    error: result.error,
    attempts: result.attempts,
  };
}

/**
 * Utility to create a custom retry function with predefined config
 *
 * @example
 * ```typescript
 * const retryWithCustomConfig = createRetryFunction({
 *   maxRetries: 5,
 *   initialDelay: 2000,
 *   onRetry: (attempt, error, delay) => {
 *     console.log(`Retrying... attempt ${attempt}`);
 *   }
 * });
 *
 * const result = await retryWithCustomConfig(async () => {
 *   return await someAsyncOperation();
 * });
 * ```
 */
export function createRetryFunction(defaultConfig: RetryConfig) {
  return async function retry<T>(
    fn: () => Promise<T>,
    overrideConfig: RetryConfig = {}
  ): Promise<RetryResult<T>> {
    return retryAsync(fn, { ...defaultConfig, ...overrideConfig });
  };
}
