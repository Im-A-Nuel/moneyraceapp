/**
 * Application Constants
 */

// =============================================================================
// BLOCKCHAIN NETWORK CONSTANTS
// =============================================================================

// Sui Network
export const SUI_COIN_TYPE = '0x2::sui::SUI';

// USDC Mock Coin Type
// TODO: Replace with your actual USDC mock package ID
// Format: 0x[package_id]::usdc::USDC
export const USDC_COIN_TYPE = process.env.NEXT_PUBLIC_USDC_COIN_TYPE || '0x2::sui::SUI';

// Default coin type to use for deposits
export const DEFAULT_COIN_TYPE = USDC_COIN_TYPE;

// Sui Clock object (standard across all networks)
export const SUI_CLOCK_ID = '0x6';

// =============================================================================
// TOKEN DECIMALS
// =============================================================================

// USDC has 6 decimals (1 USDC = 1,000,000 smallest units)
export const USDC_DECIMALS = 1_000_000;

// SUI has 9 decimals (1 SUI = 1,000,000,000 MIST)
export const SUI_DECIMALS = 1_000_000_000;

// Minimum balance required for transactions (in smallest unit)
export const MIN_BALANCE_USDC = 1_000_000n; // 1 USDC
export const MIN_BALANCE_SUI = 1_000_000n; // 0.001 SUI

// =============================================================================
// STRATEGY CONFIGURATION
// =============================================================================

// APY values for each strategy (in percentage)
export const STRATEGY_APY: Record<string, number> = {
    conservative: 5,
    balanced: 10,
    aggressive: 15,
};

// Strategy ID to name mapping
export const STRATEGY_ID_TO_NAME: Record<number, string> = {
    1: 'conservative',
    2: 'balanced',
    3: 'aggressive',
};

// Default APY when strategy is unknown
export const DEFAULT_STRATEGY_APY = 5;

// =============================================================================
// TIMING CONSTANTS
// =============================================================================

// Period length in milliseconds (1 week)
export const PERIOD_LENGTH_MS = 7 * 24 * 60 * 60 * 1000;

// Test mode period length (1 minute)
export const PERIOD_LENGTH_MS_TEST = 60 * 1000;

// Buffer time for transaction processing (5 seconds)
export const TX_BUFFER_MS = 5000;

// =============================================================================
// UI CONSTANTS
// =============================================================================

// Address truncation display length
export const ADDRESS_DISPLAY_CHARS = 4;
