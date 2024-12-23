/**
 * Simple metrics utility for basic application monitoring
 */
class MetricsUtil {
  /**
   * In-memory storage for metrics
   * @private
   */
  static _metrics = {
    requests: {
      total: 0,
      byEndpoint: {},
      byStatus: {},
    },
    responseTimes: [],
    errors: {
      total: 0,
      byType: {},
    },
    cache: {
      hits: 0,
      misses: 0,
    },
  };

  /**
   * Track an API request
   *
   * @param {string} endpoint - API endpoint
   * @param {number} statusCode - HTTP status code
   * @param {number} responseTime - Response time in ms
   */
  static trackRequest(endpoint, statusCode, responseTime) {
    // Increment total requests
    this._metrics.requests.total++;

    // Track by endpoint
    this._metrics.requests.byEndpoint[endpoint] =
      (this._metrics.requests.byEndpoint[endpoint] || 0) + 1;

    // Track by status code
    this._metrics.requests.byStatus[statusCode] =
      (this._metrics.requests.byStatus[statusCode] || 0) + 1;

    // Track response time
    this._metrics.responseTimes.push({
      endpoint,
      time: responseTime,
      timestamp: new Date(),
    });

    // Keep only last 1000 response times
    if (this._metrics.responseTimes.length > 1000) {
      this._metrics.responseTimes.shift();
    }
  }

  /**
   * Track an error occurrence
   *
   * @param {string} type - Error type
   */
  static trackError(type) {
    this._metrics.errors.total++;
    this._metrics.errors.byType[type] =
      (this._metrics.errors.byType[type] || 0) + 1;
  }

  /**
   * Track cache operations
   *
   * @param {boolean} isHit - Whether cache hit or miss
   */
  static trackCacheOperation(isHit) {
    if (isHit) {
      this._metrics.cache.hits++;
    } else {
      this._metrics.cache.misses++;
    }
  }

  /**
   * Get current metrics summary
   *
   * @returns {Object} Metrics summary
   */
  static getMetrics() {
    const avgResponseTime =
      this._metrics.responseTimes.length > 0
        ? this._metrics.responseTimes.reduce(
            (acc, curr) => acc + curr.time,
            0
          ) / this._metrics.responseTimes.length
        : 0;

    return {
      totalRequests: this._metrics.requests.total,
      requestsByEndpoint: this._metrics.requests.byEndpoint,
      statusCodes: this._metrics.requests.byStatus,
      errors: {
        total: this._metrics.errors.total,
        byType: this._metrics.errors.byType,
      },
      cache: {
        hits: this._metrics.cache.hits,
        misses: this._metrics.cache.misses,
        hitRate:
          this._metrics.cache.hits /
            (this._metrics.cache.hits + this._metrics.cache.misses) || 0,
      },
      performance: {
        averageResponseTime: Math.round(avgResponseTime),
        recentResponseTimes: this._metrics.responseTimes.slice(-10),
      },
    };
  }
}

module.exports = MetricsUtil;
