/**
 * Time Formatting Utilities
 * Helper functions for time-related formatting and calculations
 */

/**
 * Format a date to relative time string (e.g., "5m ago", "2h ago")
 * @param date - Date to format
 * @returns Formatted relative time string
 */
export function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

/**
 * Format seconds into countdown display string
 * @param seconds - Number of seconds remaining
 * @returns Formatted countdown string (e.g., "5m 30s", "2h 15m")
 */
export function formatCountdown(seconds: number): string {
    if (seconds <= 0) return "Ready!";

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins >= 60) {
        const hours = Math.floor(mins / 60);
        const remainMins = mins % 60;
        return `${hours}h ${remainMins}m`;
    }

    return `${mins}m ${secs}s`;
}
