'use client';

import React, { useEffect, useState } from 'react';
import { claudeThrottle, generalApiThrottle } from '@/src/lib/api-throttle';

interface ThrottleStats {
  queueSize: number;
  requestsPerSecond: number;
  requestsPerMinute: number;
  cacheSize: number;
  circuitBreakerStatus: string;
  failures: number;
}

export default function ThrottleMonitor() {
  const [claudeStats, setClaudeStats] = useState<ThrottleStats | null>(null);
  const [generalStats, setGeneralStats] = useState<ThrottleStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setClaudeStats(claudeThrottle.getStats());
      setGeneralStats(generalApiThrottle.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        title="Toggle Throttle Monitor"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Monitor Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-white rounded-lg shadow-xl p-4 w-80 border border-gray-200">
          <h3 className="text-lg font-bold mb-3 text-gray-800">API Throttle Monitor</h3>
          
          {/* Claude API Stats */}
          <div className="mb-4">
            <h4 className="font-semibold text-purple-600 mb-2">Claude API</h4>
            {claudeStats && (
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Queue Size:</span>
                  <span className={`font-mono ${claudeStats.queueSize > 5 ? 'text-orange-500' : 'text-green-500'}`}>
                    {claudeStats.queueSize}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requests/sec:</span>
                  <span className="font-mono">{claudeStats.requestsPerSecond}/2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requests/min:</span>
                  <span className="font-mono">{claudeStats.requestsPerMinute}/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cache Size:</span>
                  <span className="font-mono">{claudeStats.cacheSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Circuit:</span>
                  <span className={`font-mono ${
                    claudeStats.circuitBreakerStatus === 'open' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {claudeStats.circuitBreakerStatus}
                  </span>
                </div>
                {claudeStats.failures > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Failures:</span>
                    <span className="font-mono text-orange-500">{claudeStats.failures}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* General API Stats */}
          <div>
            <h4 className="font-semibold text-blue-600 mb-2">General API</h4>
            {generalStats && (
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Queue Size:</span>
                  <span className={`font-mono ${generalStats.queueSize > 10 ? 'text-orange-500' : 'text-green-500'}`}>
                    {generalStats.queueSize}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requests/sec:</span>
                  <span className="font-mono">{generalStats.requestsPerSecond}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requests/min:</span>
                  <span className="font-mono">{generalStats.requestsPerMinute}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cache Size:</span>
                  <span className="font-mono">{generalStats.cacheSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Circuit:</span>
                  <span className={`font-mono ${
                    generalStats.circuitBreakerStatus === 'open' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {generalStats.circuitBreakerStatus}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Status Indicators */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {claudeStats?.circuitBreakerStatus === 'open' || generalStats?.circuitBreakerStatus === 'open' ? (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-500">Circuit Open - Requests Paused</span>
                </>
              ) : claudeStats?.queueSize > 0 || generalStats?.queueSize > 0 ? (
                <>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-yellow-600">Processing Queue</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">All Systems Operational</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}