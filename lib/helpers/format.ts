/**
 * Formatting Utilities
 * Helper functions for data formatting and display
 */

import { USDC_DECIMALS, ADDRESS_DISPLAY_CHARS } from '../constants';

/**
 * Format raw USDC balance to display string
 * @param rawBalance - Balance in smallest unit (6 decimals)
 * @returns Formatted balance string (e.g., "100.50")
 */
export function formatUsdcBalance(rawBalance: number): string {
    const balance = rawBalance / USDC_DECIMALS;
    return balance.toFixed(2);
}

/**
 * Truncate blockchain address for display
 * @param address - Full blockchain address
 * @param chars - Number of characters to show at start and end (default: 4)
 * @returns Truncated address (e.g., "0x1234...5678")
 */
export function truncateAddress(
    address: string,
    chars: number = ADDRESS_DISPLAY_CHARS
): string {
    if (!address) return '';
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @returns Formatted string with commas
 */
export function formatNumber(num: number): string {
    return num.toLocaleString();
}
