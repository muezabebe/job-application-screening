export function getStaticDocumentUrl(rawUrl: string): string {
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl
  }

  // Convert Windows backslashes to forward slashes and strip leading slashes
  const normalizedPath = rawUrl.replace(/\\/g, "/").replace(/^\/+/, "")

  // Encode individual path segments to safely handle spaces (%20) without escaping the slashes
  const encodedPath = normalizedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")

  // Ensure it points cleanly to root static path (e.g. /uploads/filename.pdf)
  return `/${encodedPath}`
}