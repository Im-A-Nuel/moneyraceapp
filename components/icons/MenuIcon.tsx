/**
 * Menu Icon Component
 * 
 * SVG icons for sidebar navigation menu items.
 * Extracted from DashboardLayout for better separation of concerns.
 */

interface MenuIconProps {
  /** Icon type identifier */
  type: string;
  /** Optional className for styling */
  className?: string;
}

/**
 * MenuIcon Component
 * 
 * Renders SVG icons based on the type prop.
 * Used in DashboardLayout sidebar navigation.
 */
export function MenuIcon({ type, className = "w-6 h-6" }: MenuIconProps): JSX.Element | null {
  const iconClass = `${className}`;
  
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
      </svg>
    ),
    create: (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
    ),
    join: (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 12l-4-4v3H2v2h8v3l4-4zm7-7H11v2h10v14H11v2h10c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>
      </svg>
    ),
    history: (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
      </svg>
    ),
    mint: (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.89-8.9c.32-.24.51-.59.51-1.01 0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5h1.25c0-.14.11-.25.25-.25s.25.11.25.25-.11.25-.25.25h-.75v.5h.75c.14 0 .25.11.25.25s-.11.25-.25.25-.25-.11-.25-.25h-1.25c0 .83.67 1.5 1.5 1.5v.5h.5v-.5c.68-.09 1.23-.61 1.35-1.28h-1.35c-.14 0-.25-.11-.25-.25 0-.28.22-.5.5-.5h1.35c-.12-.67-.67-1.19-1.35-1.28v-.5h-.5v.5c-.39.05-.75.23-1.01.52z"/>
      </svg>
    ),
    profile: (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
      </svg>
    ),
    setting: (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
      </svg>
    ),
    faq: (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
      </svg>
    ),
    signout: (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
      </svg>
    ),
    room: (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
      </svg>
    ),
  };
  
  return icons[type] || null;
}
