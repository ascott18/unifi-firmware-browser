/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(1);
  return `${size} ${sizes[i]}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get channel display name
 */
export function getChannelDisplayName(channel: string): string {
  switch (channel) {
    case "release":
      return "Official";
    case "beta-public":
      return "Beta";
    case "beta":
      return "Beta";
    case "alpha":
      return "Alpha";
    default:
      return channel.charAt(0).toUpperCase() + channel.slice(1);
  }
}
