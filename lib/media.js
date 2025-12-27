/**
 * Media Detection Module for Nostr Events
 *
 * Detects and classifies media URLs in text content following NIP-XX conventions.
 * Supports images, video, audio, and platform-specific embeds (YouTube, etc.)
 *
 * @module media
 * @see https://github.com/nostr-protocol/nips
 */

/**
 * Supported file extensions by media type
 * Based on NIP-XX Content Rendering Guidelines
 */
export const EXTENSIONS = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'heic', 'svg', 'jxl', 'bmp', 'ico', 'tiff', 'tif'],
  video: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', '3gp', 'ogv', 'wmv', 'flv'],
  audio: ['mp3', 'wav', 'flac', 'ogg', 'opus', 'aac', 'm4a', 'wma', 'aiff', 'ape']
}

/**
 * Platform embed patterns
 */
export const PLATFORMS = {
  youtube: {
    pattern: /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    type: 'video'
  },
  spotify: {
    pattern: /open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/,
    type: 'audio'
  },
  soundcloud: {
    pattern: /soundcloud\.com\/[^/]+\/[^/\s]+/,
    type: 'audio'
  },
  twitch: {
    pattern: /twitch\.tv\/([a-zA-Z0-9_]+)/,
    type: 'video'
  },
  vimeo: {
    pattern: /vimeo\.com\/(\d+)/,
    type: 'video'
  }
}

/**
 * URL detection pattern
 */
const URL_PATTERN = /https?:\/\/[^\s<>\[\]"']+/gi

/**
 * Extract file extension from a URL
 * Handles query strings and fragments correctly
 *
 * @param {string} url - The URL to extract extension from
 * @returns {string|null} Lowercase extension or null if not found
 *
 * @example
 * getExtension('https://example.com/photo.PNG') // 'png'
 * getExtension('https://example.com/image.jpg?size=large') // 'jpg'
 * getExtension('https://example.com/page') // null
 */
export function getExtension(url) {
  if (!url || typeof url !== 'string') return null

  try {
    // Remove query string and fragment
    const cleanUrl = url.split(/[?#]/)[0]

    // Get filename from path
    const pathParts = cleanUrl.split('/')
    const filename = pathParts[pathParts.length - 1]

    // Reject hidden files (start with dot, e.g., .png)
    if (filename.startsWith('.')) return null

    // Match extension at end of path
    const match = cleanUrl.match(/\.([a-zA-Z0-9]{1,7})$/)
    if (!match) return null

    const ext = match[1].toLowerCase()

    // Reject suspicious double extensions (e.g., .png.exe)
    const extCount = (filename.match(/\./g) || []).length
    if (extCount > 1) {
      // Check if the second-to-last extension is a known media type
      const allExts = [...EXTENSIONS.image, ...EXTENSIONS.video, ...EXTENSIONS.audio]
      const parts = filename.split('.')
      if (parts.length > 2 && allExts.includes(parts[parts.length - 2].toLowerCase())) {
        return null // Likely malicious: photo.png.exe
      }
    }

    return ext
  } catch {
    return null
  }
}

/**
 * Detect the media type of a URL based on file extension
 *
 * @param {string} url - The URL to classify
 * @returns {'image'|'video'|'audio'|null} Media type or null if not media
 *
 * @example
 * detectMediaType('https://example.com/photo.png') // 'image'
 * detectMediaType('https://example.com/video.mp4') // 'video'
 * detectMediaType('https://example.com/song.mp3') // 'audio'
 * detectMediaType('https://example.com/document.pdf') // null
 */
export function detectMediaType(url) {
  const ext = getExtension(url)
  if (!ext) return null

  if (EXTENSIONS.image.includes(ext)) return 'image'
  if (EXTENSIONS.video.includes(ext)) return 'video'
  if (EXTENSIONS.audio.includes(ext)) return 'audio'

  return null
}

/**
 * Detect platform embed from URL
 *
 * @param {string} url - The URL to check for platform embeds
 * @returns {{platform: string, type: string, id: string}|null} Platform info or null
 *
 * @example
 * detectPlatform('https://youtube.com/watch?v=dQw4w9WgXcQ')
 * // { platform: 'youtube', type: 'video', id: 'dQw4w9WgXcQ' }
 *
 * detectPlatform('https://youtu.be/dQw4w9WgXcQ')
 * // { platform: 'youtube', type: 'video', id: 'dQw4w9WgXcQ' }
 */
export function detectPlatform(url) {
  if (!url || typeof url !== 'string') return null

  for (const [platform, config] of Object.entries(PLATFORMS)) {
    const match = url.match(config.pattern)
    if (match) {
      return {
        platform,
        type: config.type,
        id: match[1] || match[0]
      }
    }
  }

  return null
}

/**
 * Parse content and extract all media URLs with their types
 *
 * @param {string} content - Text content to parse
 * @returns {Array<{url: string, type: string, platform?: string, id?: string}>} Array of media items
 *
 * @example
 * parseMedia('Check out https://example.com/photo.png and https://youtu.be/abc123')
 * // [
 * //   { url: 'https://example.com/photo.png', type: 'image' },
 * //   { url: 'https://youtu.be/abc123', type: 'video', platform: 'youtube', id: 'abc123' }
 * // ]
 */
export function parseMedia(content) {
  if (!content || typeof content !== 'string') return []

  const urls = content.match(URL_PATTERN) || []
  const media = []

  for (const url of urls) {
    // Check for platform embeds first
    const platform = detectPlatform(url)
    if (platform) {
      media.push({
        url,
        type: platform.type,
        platform: platform.platform,
        id: platform.id
      })
      continue
    }

    // Check for media file extension
    const mediaType = detectMediaType(url)
    if (mediaType) {
      media.push({
        url,
        type: mediaType
      })
    }
  }

  return media
}

/**
 * Check if a URL is a valid media URL (image, video, or audio)
 *
 * @param {string} url - The URL to check
 * @returns {boolean} True if URL points to media content
 *
 * @example
 * isMediaUrl('https://example.com/photo.png') // true
 * isMediaUrl('https://youtube.com/watch?v=abc') // true
 * isMediaUrl('https://example.com/page') // false
 */
export function isMediaUrl(url) {
  return detectMediaType(url) !== null || detectPlatform(url) !== null
}

/**
 * Check if a URL is an image
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export function isImage(url) {
  return detectMediaType(url) === 'image'
}

/**
 * Check if a URL is a video
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export function isVideo(url) {
  return detectMediaType(url) === 'video' || detectPlatform(url)?.type === 'video'
}

/**
 * Check if a URL is audio
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export function isAudio(url) {
  return detectMediaType(url) === 'audio' || detectPlatform(url)?.type === 'audio'
}

export default {
  EXTENSIONS,
  PLATFORMS,
  getExtension,
  detectMediaType,
  detectPlatform,
  parseMedia,
  isMediaUrl,
  isImage,
  isVideo,
  isAudio
}
