/**
 * Unit tests for M3U parser
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import { parseM3U } from '../lib/m3u-parser.js'

describe('parseM3U', () => {
  it('parses basic M3U with EXTINF', () => {
    const content = `#EXTM3U
#EXTINF:180,Artist - Song Title
https://example.com/song.mp3`

    const tracks = parseM3U(content)
    assert.strictEqual(tracks.length, 1)
    assert.strictEqual(tracks[0].url, 'https://example.com/song.mp3')
    assert.strictEqual(tracks[0].title, 'Song Title')
    assert.strictEqual(tracks[0].artist, 'Artist')
    assert.strictEqual(tracks[0].duration, 180)
    assert.strictEqual(tracks[0].type, 'audio')
  })

  it('parses multiple tracks', () => {
    const content = `#EXTM3U
#EXTINF:200,Track One
https://example.com/one.mp3
#EXTINF:150,Track Two
https://example.com/two.mp3`

    const tracks = parseM3U(content)
    assert.strictEqual(tracks.length, 2)
    assert.strictEqual(tracks[0].title, 'Track One')
    assert.strictEqual(tracks[1].title, 'Track Two')
  })

  it('parses tvg-logo attribute', () => {
    const content = `#EXTM3U
#EXTINF:60,Video Title tvg-logo="https://example.com/thumb.jpg"
https://example.com/video.mp4`

    const tracks = parseM3U(content)
    assert.strictEqual(tracks[0].thumbnail, 'https://example.com/thumb.jpg')
    assert.strictEqual(tracks[0].title, 'Video Title')
  })

  it('detects media types correctly', () => {
    const content = `#EXTM3U
#EXTINF:-1,Audio File
https://example.com/audio.mp3
#EXTINF:-1,Video File
https://example.com/video.mp4
#EXTINF:-1,Image File
https://example.com/image.png`

    const tracks = parseM3U(content)
    assert.strictEqual(tracks[0].type, 'audio')
    assert.strictEqual(tracks[1].type, 'video')
    assert.strictEqual(tracks[2].type, 'image')
  })

  it('handles missing EXTINF metadata', () => {
    const content = `#EXTM3U
https://example.com/song.mp3`

    const tracks = parseM3U(content)
    assert.strictEqual(tracks.length, 1)
    assert.strictEqual(tracks[0].url, 'https://example.com/song.mp3')
    assert.strictEqual(tracks[0].title, 'song')
    assert.strictEqual(tracks[0].duration, -1)
  })

  it('handles title without artist', () => {
    const content = `#EXTM3U
#EXTINF:120,Just A Title
https://example.com/track.mp3`

    const tracks = parseM3U(content)
    assert.strictEqual(tracks[0].title, 'Just A Title')
    assert.strictEqual(tracks[0].artist, undefined)
  })

  it('handles empty and null input', () => {
    assert.deepStrictEqual(parseM3U(''), [])
    assert.deepStrictEqual(parseM3U(null), [])
    assert.deepStrictEqual(parseM3U(undefined), [])
  })

  it('ignores non-URL lines', () => {
    const content = `#EXTM3U
#EXTINF:100,Song
# This is a comment
not a url
https://example.com/song.mp3`

    const tracks = parseM3U(content)
    assert.strictEqual(tracks.length, 1)
  })

  it('parses group-title attribute', () => {
    const content = `#EXTM3U
#EXTINF:60,Song group-title="Rock"
https://example.com/song.mp3`

    const tracks = parseM3U(content)
    assert.strictEqual(tracks[0].title, 'Song')
  })
})
