/**
 * Strategy Utilities
 * Helper functions for strategy-related calculations
 */

import {
    STRATEGY_APY,
    STRATEGY_ID_TO_NAME,
    DEFAULT_STRATEGY_APY
} from '../constants';

/**
 * Get APY percentage based on strategy name or ID
 * @param strategy - Strategy name (string) or ID (number)
 * @returns APY percentage value
 */
export function getApyFromStrategy(strategy: string | number): number {
    // Handle numeric strategy ID
    if (typeof strategy === 'number') {
        const strategyName = STRATEGY_ID_TO_NAME[strategy];
        if (strategyName && STRATEGY_APY[strategyName] !== undefined) {
            return STRATEGY_APY[strategyName];
        }
        return DEFAULT_STRATEGY_APY;
    }

    // Handle string strategy name
    const strategyLower = String(strategy).toLowerCase();

    if (STRATEGY_APY[strategyLower] !== undefined) {
        return STRATEGY_APY[strategyLower];
    }

    return DEFAULT_STRATEGY_APY;
}

/**
 * Get strategy name from ID
 * @param strategyId - Numeric strategy ID
 * @returns Strategy name or 'unknown'
 */
export function getStrategyName(strategyId: number): string {
    return STRATEGY_ID_TO_NAME[strategyId] || 'unknown';
}
