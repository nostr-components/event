/**
 * Unit tests for media detection module
 *
 * Run with: node --test test/media.test.js
 * Or: npm test
 *
 * Test vectors based on NIP-XX Content Rendering Guidelines
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  getExtension,
  detectMediaType,
  detectPlatform,
  parseMedia,
  isMediaUrl,
  isImage,
  isVideo,
  isAudio,
  EXTENSIONS
} from '../lib/media.js'

describe('getExtension', () => {
  it('extracts basic extensions', () => {
    assert.strictEqual(getExtension('https://example.com/photo.png'), 'png')
    assert.strictEqual(getExtension('https://example.com/video.mp4'), 'mp4')
    assert.strictEqual(getExtension('https://example.com/song.mp3'), 'mp3')
  })

  it('handles uppercase extensions (case insensitive)', () => {
    assert.strictEqual(getExtension('https://example.com/photo.PNG'), 'png')
    assert.strictEqual(getExtension('https://example.com/photo.JPEG'), 'jpeg')
    assert.strictEqual(getExtension('https://example.com/VIDEO.MP4'), 'mp4')
  })

  it('handles query parameters', () => {
    assert.strictEqual(getExtension('https://example.com/image.jpeg?size=large'), 'jpeg')
    assert.strictEqual(getExtension('https://example.com/photo.jpg?token=abc&width=100'), 'jpg')
  })

  it('handles URL fragments', () => {
    assert.strictEqual(getExtension('https://example.com/image.jpg#section'), 'jpg')
    assert.strictEqual(getExtension('https://example.com/photo.png#top'), 'png')
  })

  it('handles complex URLs', () => {
    assert.strictEqual(getExtension('https://nostr.build/i/abc123.webp'), 'webp')
    assert.strictEqual(getExtension('https://cdn.example.com/path/to/image.png?token=abc&size=large'), 'png')
    assert.strictEqual(getExtension('https://example.com/my%20image.png'), 'png')
  })

  it('returns null for URLs without extensions', () => {
    assert.strictEqual(getExtension('https://example.com/page'), null)
    assert.strictEqual(getExtension('https://example.com/api/image'), null)
    assert.strictEqual(getExtension('https://example.com/'), null)
  })

  it('returns null for hidden files', () => {
    assert.strictEqual(getExtension('https://example.com/.png'), null)
  })

  it('rejects suspicious double extensions', () => {
    assert.strictEqual(getExtension('https://example.com/fake.png.exe'), null)
    assert.strictEqual(getExtension('https://example.com/file.mp4.txt'), null)
    assert.strictEqual(getExtension('https://example.com/photo.jpg.php'), null)
  })

  it('handles null and invalid inputs', () => {
    assert.strictEqual(getExtension(null), null)
    assert.strictEqual(getExtension(undefined), null)
    assert.strictEqual(getExtension(''), null)
    assert.strictEqual(getExtension(123), null)
  })
})

describe('detectMediaType', () => {
  describe('image detection', () => {
    const imageTests = [
      ['https://example.com/photo.png', 'Basic PNG'],
      ['https://example.com/photo.PNG', 'Case insensitive'],
      ['https://nostr.build/i/abc123.webp', 'WebP format'],
      ['https://example.com/image.jpeg?size=large', 'With query params'],
      ['https://example.com/image.jpg#section', 'With fragment'],
      ['https://example.com/photo.heic', 'HEIC (iPhone)'],
      ['https://example.com/icon.svg', 'SVG vector'],
      ['https://example.com/photo.avif', 'AVIF format'],
      ['https://example.com/file.jxl', 'JPEG XL'],
      ['https://example.com/photo.gif', 'GIF'],
      ['https://example.com/photo.bmp', 'BMP'],
      ['https://example.com/favicon.ico', 'ICO'],
      ['https://example.com/scan.tiff', 'TIFF'],
      ['https://example.com/scan.tif', 'TIF']
    ]

    for (const [url, description] of imageTests) {
      it(`detects ${description}: ${url}`, () => {
        assert.strictEqual(detectMediaType(url), 'image')
      })
    }
  })

  describe('video detection', () => {
    const videoTests = [
      ['https://example.com/video.mp4', 'Basic MP4'],
      ['https://example.com/clip.webm', 'WebM format'],
      ['https://example.com/movie.mkv', 'Matroska'],
      ['https://example.com/clip.mov', 'QuickTime'],
      ['https://example.com/old.avi', 'AVI format'],
      ['https://example.com/mobile.3gp', 'Mobile format'],
      ['https://example.com/video.m4v', 'M4V'],
      ['https://example.com/video.ogv', 'OGV'],
      ['https://example.com/old.wmv', 'WMV'],
      ['https://example.com/old.flv', 'FLV']
    ]

    for (const [url, description] of videoTests) {
      it(`detects ${description}: ${url}`, () => {
        assert.strictEqual(detectMediaType(url), 'video')
      })
    }
  })

  describe('audio detection', () => {
    const audioTests = [
      ['https://example.com/song.mp3', 'Basic MP3'],
      ['https://example.com/track.flac', 'Lossless FLAC'],
      ['https://example.com/podcast.ogg', 'Ogg Vorbis'],
      ['https://example.com/voice.opus', 'Opus codec'],
      ['https://example.com/music.wav', 'Uncompressed WAV'],
      ['https://example.com/track.m4a', 'AAC container'],
      ['https://example.com/song.aac', 'AAC'],
      ['https://example.com/old.wma', 'WMA'],
      ['https://example.com/music.aiff', 'AIFF'],
      ['https://example.com/lossless.ape', 'APE']
    ]

    for (const [url, description] of audioTests) {
      it(`detects ${description}: ${url}`, () => {
        assert.strictEqual(detectMediaType(url), 'audio')
      })
    }
  })

  describe('non-media detection', () => {
    const nonMediaTests = [
      ['https://example.com/document.pdf', 'PDF document'],
      ['https://example.com/page', 'No extension'],
      ['https://example.com/api/image', 'No extension (API)'],
      ['https://example.com/.png', 'Hidden file'],
      ['https://png.example.com/file', 'Extension in domain'],
      ['https://example.com/fake.png.exe', 'Double extension'],
      ['https://example.com/file.mp4.txt', 'Text file'],
      ['https://example.com/script.js', 'JavaScript'],
      ['https://example.com/style.css', 'CSS'],
      ['https://example.com/data.json', 'JSON']
    ]

    for (const [url, description] of nonMediaTests) {
      it(`rejects ${description}: ${url}`, () => {
        assert.strictEqual(detectMediaType(url), null)
      })
    }
  })
})

describe('detectPlatform', () => {
  describe('YouTube', () => {
    it('detects youtube.com/watch?v= URLs', () => {
      const result = detectPlatform('https://youtube.com/watch?v=dQw4w9WgXcQ')
      assert.strictEqual(result.platform, 'youtube')
      assert.strictEqual(result.type, 'video')
      assert.strictEqual(result.id, 'dQw4w9WgXcQ')
    })

    it('detects www.youtube.com/watch?v= URLs', () => {
      const result = detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      assert.strictEqual(result.platform, 'youtube')
      assert.strictEqual(result.id, 'dQw4w9WgXcQ')
    })

    it('detects youtu.be short URLs', () => {
      const result = detectPlatform('https://youtu.be/dQw4w9WgXcQ')
      assert.strictEqual(result.platform, 'youtube')
      assert.strictEqual(result.id, 'dQw4w9WgXcQ')
    })

    it('detects YouTube Shorts', () => {
      const result = detectPlatform('https://youtube.com/shorts/abc123XYZ_-')
      assert.strictEqual(result.platform, 'youtube')
      assert.strictEqual(result.id, 'abc123XYZ_-')
    })

    it('handles YouTube URLs with extra params', () => {
      const result = detectPlatform('https://youtube.com/watch?v=dQw4w9WgXcQ&t=120')
      assert.strictEqual(result.id, 'dQw4w9WgXcQ')
    })
  })

  describe('Spotify', () => {
    it('detects Spotify track URLs', () => {
      const result = detectPlatform('https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC')
      assert.strictEqual(result.platform, 'spotify')
      assert.strictEqual(result.type, 'audio')
    })

    it('detects Spotify album URLs', () => {
      const result = detectPlatform('https://open.spotify.com/album/4uLU6hMCjMI75M1A2tKUQC')
      assert.strictEqual(result.platform, 'spotify')
    })

    it('detects Spotify playlist URLs', () => {
      const result = detectPlatform('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')
      assert.strictEqual(result.platform, 'spotify')
    })
  })

  describe('Vimeo', () => {
    it('detects Vimeo URLs', () => {
      const result = detectPlatform('https://vimeo.com/123456789')
      assert.strictEqual(result.platform, 'vimeo')
      assert.strictEqual(result.type, 'video')
      assert.strictEqual(result.id, '123456789')
    })
  })

  describe('Twitch', () => {
    it('detects Twitch channel URLs', () => {
      const result = detectPlatform('https://twitch.tv/ninja')
      assert.strictEqual(result.platform, 'twitch')
      assert.strictEqual(result.type, 'video')
    })
  })

  it('returns null for non-platform URLs', () => {
    assert.strictEqual(detectPlatform('https://example.com/video.mp4'), null)
    assert.strictEqual(detectPlatform('https://google.com'), null)
    assert.strictEqual(detectPlatform('https://nostr.com'), null)
  })

  it('handles null and invalid inputs', () => {
    assert.strictEqual(detectPlatform(null), null)
    assert.strictEqual(detectPlatform(undefined), null)
    assert.strictEqual(detectPlatform(''), null)
  })
})

describe('parseMedia', () => {
  it('extracts single image URL', () => {
    const result = parseMedia('Check out this photo https://example.com/photo.png')
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].url, 'https://example.com/photo.png')
    assert.strictEqual(result[0].type, 'image')
  })

  it('extracts multiple media URLs', () => {
    const content = 'Images: https://a.com/1.png https://b.com/2.jpg Video: https://c.com/v.mp4'
    const result = parseMedia(content)
    assert.strictEqual(result.length, 3)
    assert.strictEqual(result[0].type, 'image')
    assert.strictEqual(result[1].type, 'image')
    assert.strictEqual(result[2].type, 'video')
  })

  it('extracts platform embeds with metadata', () => {
    const result = parseMedia('Watch this: https://youtu.be/dQw4w9WgXcQ')
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].platform, 'youtube')
    assert.strictEqual(result[0].id, 'dQw4w9WgXcQ')
    assert.strictEqual(result[0].type, 'video')
  })

  it('handles mixed media and platform URLs', () => {
    const content = 'Photo https://x.com/a.png and video https://youtube.com/watch?v=abc123xyz_A'
    const result = parseMedia(content)
    assert.strictEqual(result.length, 2)
    assert.strictEqual(result[0].type, 'image')
    assert.strictEqual(result[1].platform, 'youtube')
  })

  it('ignores non-media URLs', () => {
    const result = parseMedia('Visit https://example.com and https://nostr.com/about')
    assert.strictEqual(result.length, 0)
  })

  it('handles empty and null content', () => {
    assert.deepStrictEqual(parseMedia(''), [])
    assert.deepStrictEqual(parseMedia(null), [])
    assert.deepStrictEqual(parseMedia(undefined), [])
  })

  it('handles content with no URLs', () => {
    assert.deepStrictEqual(parseMedia('Just some text without any URLs'), [])
  })
})

describe('isMediaUrl', () => {
  it('returns true for image URLs', () => {
    assert.strictEqual(isMediaUrl('https://example.com/photo.png'), true)
  })

  it('returns true for video URLs', () => {
    assert.strictEqual(isMediaUrl('https://example.com/video.mp4'), true)
  })

  it('returns true for audio URLs', () => {
    assert.strictEqual(isMediaUrl('https://example.com/song.mp3'), true)
  })

  it('returns true for platform URLs', () => {
    assert.strictEqual(isMediaUrl('https://youtube.com/watch?v=dQw4w9WgXcQ'), true)
  })

  it('returns false for non-media URLs', () => {
    assert.strictEqual(isMediaUrl('https://example.com/page'), false)
    assert.strictEqual(isMediaUrl('https://example.com/doc.pdf'), false)
  })
})

describe('type-specific helpers', () => {
  describe('isImage', () => {
    it('returns true for images', () => {
      assert.strictEqual(isImage('https://x.com/a.png'), true)
      assert.strictEqual(isImage('https://x.com/a.webp'), true)
    })

    it('returns false for non-images', () => {
      assert.strictEqual(isImage('https://x.com/a.mp4'), false)
      assert.strictEqual(isImage('https://youtube.com/watch?v=dQw4w9WgXcQ'), false)
    })
  })

  describe('isVideo', () => {
    it('returns true for video files', () => {
      assert.strictEqual(isVideo('https://x.com/a.mp4'), true)
      assert.strictEqual(isVideo('https://x.com/a.webm'), true)
    })

    it('returns true for video platforms', () => {
      assert.strictEqual(isVideo('https://youtube.com/watch?v=dQw4w9WgXcQ'), true)
      assert.strictEqual(isVideo('https://vimeo.com/123456789'), true)
    })

    it('returns false for non-videos', () => {
      assert.strictEqual(isVideo('https://x.com/a.png'), false)
      assert.strictEqual(isVideo('https://x.com/a.mp3'), false)
    })
  })

  describe('isAudio', () => {
    it('returns true for audio files', () => {
      assert.strictEqual(isAudio('https://x.com/a.mp3'), true)
      assert.strictEqual(isAudio('https://x.com/a.flac'), true)
    })

    it('returns true for audio platforms', () => {
      assert.strictEqual(isAudio('https://open.spotify.com/track/abc'), true)
    })

    it('returns false for non-audio', () => {
      assert.strictEqual(isAudio('https://x.com/a.png'), false)
      assert.strictEqual(isAudio('https://youtube.com/watch?v=dQw4w9WgXcQ'), false)
    })
  })
})

describe('EXTENSIONS constant', () => {
  it('exports image extensions', () => {
    assert.ok(Array.isArray(EXTENSIONS.image))
    assert.ok(EXTENSIONS.image.includes('png'))
    assert.ok(EXTENSIONS.image.includes('jpg'))
    assert.ok(EXTENSIONS.image.includes('webp'))
  })

  it('exports video extensions', () => {
    assert.ok(Array.isArray(EXTENSIONS.video))
    assert.ok(EXTENSIONS.video.includes('mp4'))
    assert.ok(EXTENSIONS.video.includes('webm'))
  })

  it('exports audio extensions', () => {
    assert.ok(Array.isArray(EXTENSIONS.audio))
    assert.ok(EXTENSIONS.audio.includes('mp3'))
    assert.ok(EXTENSIONS.audio.includes('flac'))
  })
})
