/**
 * M3U Playlist Parser
 *
 * Parses M3U/M3U8 playlist files into structured data.
 * Supports Extended M3U format with #EXTINF metadata.
 *
 * @see https://en.wikipedia.org/wiki/M3U
 * @see https://github.com/nostr-protocol/nips/issues/1945
 */

import { detectMediaType } from './media.js'

/**
 * Parse M3U playlist content into an array of track objects
 *
 * @param {string} content - Raw M3U file content
 * @returns {Array<{url: string, title: string, duration: number, type: string, artist?: string, thumbnail?: string}>}
 *
 * @example
 * const tracks = parseM3U(`#EXTM3U
 * #EXTINF:180,Artist - Song Title
 * https://example.com/song.mp3
 * `)
 * // [{ url: '...', title: 'Song Title', artist: 'Artist', duration: 180, type: 'audio' }]
 */
export function parseM3U(content) {
  if (!content || typeof content !== 'string') return []

  const lines = content.split('\n').map(line => line.trim()).filter(Boolean)
  const tracks = []
  let currentMeta = null

  for (const line of lines) {
    // Skip M3U header
    if (line === '#EXTM3U') continue

    // Parse EXTINF metadata line
    if (line.startsWith('#EXTINF:')) {
      currentMeta = parseExtInf(line)
      continue
    }

    // Skip other comments/directives
    if (line.startsWith('#')) continue

    // This is a URL line
    if (line.startsWith('http://') || line.startsWith('https://')) {
      const track = {
        url: line,
        type: detectMediaType(line) || 'unknown',
        duration: currentMeta?.duration ?? -1,
        title: currentMeta?.title || extractFilename(line),
        ...(currentMeta?.artist && { artist: currentMeta.artist }),
        ...(currentMeta?.thumbnail && { thumbnail: currentMeta.thumbnail })
      }
      tracks.push(track)
      currentMeta = null
    }
  }

  return tracks
}

/**
 * Parse #EXTINF line
 * Format: #EXTINF:duration,Artist - Title [tvg-logo="url"] [group-title="category"]
 */
function parseExtInf(line) {
  const meta = { duration: -1, title: '' }

  // Remove #EXTINF: prefix
  const content = line.slice(8)

  // Extract duration (before first comma)
  const commaIndex = content.indexOf(',')
  if (commaIndex > 0) {
    meta.duration = parseInt(content.slice(0, commaIndex), 10) || -1
  }

  // Get everything after the comma
  let titlePart = commaIndex > 0 ? content.slice(commaIndex + 1) : content

  // Extract tvg-logo if present
  const logoMatch = titlePart.match(/tvg-logo="([^"]+)"/)
  if (logoMatch) {
    meta.thumbnail = logoMatch[1]
    titlePart = titlePart.replace(logoMatch[0], '').trim()
  }

  // Extract group-title if present
  const groupMatch = titlePart.match(/group-title="([^"]+)"/)
  if (groupMatch) {
    meta.group = groupMatch[1]
    titlePart = titlePart.replace(groupMatch[0], '').trim()
  }

  // Parse "Artist - Title" format
  const dashIndex = titlePart.indexOf(' - ')
  if (dashIndex > 0) {
    meta.artist = titlePart.slice(0, dashIndex).trim()
    meta.title = titlePart.slice(dashIndex + 3).trim()
  } else {
    meta.title = titlePart.trim()
  }

  return meta
}

/**
 * Extract filename from URL for fallback title
 */
function extractFilename(url) {
  try {
    const path = new URL(url).pathname
    const filename = path.split('/').pop() || 'Unknown'
    // Remove extension and decode
    return decodeURIComponent(filename.replace(/\.[^.]+$/, ''))
  } catch {
    return 'Unknown'
  }
}

/**
 * Fetch and parse an M3U playlist from URL
 *
 * @param {string} url - URL to the M3U file
 * @returns {Promise<Array>} Parsed tracks
 */
export async function fetchM3U(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch M3U: ${response.status}`)
  }
  const content = await response.text()
  return parseM3U(content)
}

export default { parseM3U, fetchM3U }
