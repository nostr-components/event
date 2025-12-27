<p align="center">
  <img src="https://raw.githubusercontent.com/nostr-components/event/gh-pages/assets/nostr-logo.svg" alt="Nostr Logo" width="120" height="120" onerror="this.style.display='none'">
</p>

<h1 align="center">nc-event</h1>

<p align="center">
  <strong>Render Nostr events with automatic media detection</strong>
</p>

<p align="center">
  <a href="https://nostr-components.github.io/event/examples/">Live Demo</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#api">API</a> ·
  <a href="#media-detection">Media Detection</a>
</p>

<p align="center">
  <a href="https://github.com/nostr-components/event/blob/gh-pages/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://npmjs.com/package/nc-event"><img src="https://img.shields.io/npm/v/nc-event" alt="npm version"></a>
  <a href="https://npmjs.com/package/nc-event"><img src="https://img.shields.io/npm/dm/nc-event.svg" alt="npm downloads"></a>
  <a href="https://github.com/nostr-components/event/"><img src="https://img.shields.io/github/stars/nostr-components/event.svg" alt="GitHub stars"></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="Zero dependencies">
  <img src="https://img.shields.io/badge/gzip-~3KB-blue" alt="Bundle size">
</p>

---

## Why nc-event?

**Smart, automatic media rendering** for Nostr events. Drop in a component and watch URLs transform into embedded images, videos, YouTube players, and more.

```
https://example.com/photo.png  →  🖼️ Rendered image
https://youtu.be/dQw4w9WgXcQ   →  ▶️ Embedded YouTube player
https://example.com/song.mp3   →  🎵 Audio player
```

### Features

- **Zero dependencies** — Uses bundled Preact (~3KB), nothing to install
- **Smart media detection** — Recognizes 30+ file formats + YouTube, Spotify, Vimeo, and more
- **Works everywhere** — ES modules, no build step required
- **Tested** — 88 unit tests covering edge cases
- **Lightweight** — ~3KB gzipped total

---

## Quick Start

### Option 1: Script Tag (Easiest)

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { html, render } from 'https://unpkg.com/nc-event/js/standalone.module.js'
    import Event from 'https://unpkg.com/nc-event/lib/index.js'

    const event = {
      pubkey: "npub1...",
      content: "Check out this photo! https://nostr.build/i/abc123.webp",
      created_at: 1699900000,
      kind: 1
    }

    render(html`<${Event} event=${event} />`, document.body)
  </script>
</head>
<body></body>
</html>
```

### Option 2: NPM

```bash
npm install nc-event
```

```javascript
import { html, render } from 'nc-event/js/standalone.module.js'
import Event from 'nc-event'

const event = {
  pubkey: "82341f882...",
  content: "Hello Nostr! https://example.com/image.png",
  kind: 1
}

render(html`<${Event} event=${event} />`, document.getElementById('app'))
```

### Option 3: Using the Media Module Standalone

The media detection module works independently — use it in any project:

```javascript
import { parseMedia, isImage, detectPlatform } from 'nc-event/lib/media.js'

// Parse all media from text
const media = parseMedia('Check https://x.com/a.png and https://youtu.be/abc123XYZ_A')
// → [
//   { url: 'https://x.com/a.png', type: 'image' },
//   { url: 'https://youtu.be/abc123XYZ_A', type: 'video', platform: 'youtube', id: 'abc123XYZ_A' }
// ]

// Simple type checks
isImage('https://example.com/photo.webp')  // true
isImage('https://example.com/video.mp4')   // false

// Detect embeddable platforms
detectPlatform('https://youtube.com/watch?v=dQw4w9WgXcQ')
// → { platform: 'youtube', type: 'video', id: 'dQw4w9WgXcQ' }
```

---

## Live Examples

Try these in your browser:

| Example | Description |
|---------|-------------|
| [**Single Image**](https://nostr-components.github.io/event/examples/pic.html) | Basic image rendering |
| [**Multiple Images**](https://nostr-components.github.io/event/examples/pics.html) | Gallery of images |
| [**Video**](https://nostr-components.github.io/event/examples/video.html) | Native video player |
| [**YouTube**](https://nostr-components.github.io/event/examples/youtube.html) | Embedded YouTube |
| [**Kind 1 Event**](https://nostr-components.github.io/event/examples/kind1.html) | Full event with metadata |

---

## API

### `<Event>` Component

Renders a Nostr event with automatic media embedding.

```javascript
html`<${Event} event=${nostrEvent} />`
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `event` | `Object` | Nostr event object (kind 1) |
| `event.pubkey` | `string` | Author's public key |
| `event.content` | `string` | Event content with URLs |
| `event.kind` | `number` | Event kind (typically 1 for text notes) |

### Media Detection Functions

Import from `nc-event/lib/media.js`:

| Function | Description |
|----------|-------------|
| `parseMedia(content)` | Extract all media URLs from text |
| `detectMediaType(url)` | Returns `'image'`, `'video'`, `'audio'`, or `null` |
| `detectPlatform(url)` | Detect YouTube, Spotify, Vimeo, etc. |
| `isImage(url)` | Check if URL is an image |
| `isVideo(url)` | Check if URL is a video (file or platform) |
| `isAudio(url)` | Check if URL is audio (file or platform) |
| `isMediaUrl(url)` | Check if URL is any media type |
| `getExtension(url)` | Extract file extension from URL |

---

## Media Detection

### Supported Formats

Based on [NIP-XX Content Rendering Guidelines](https://github.com/nostr-protocol/nips).

**Images:**
```
png, jpg, jpeg, gif, webp, avif, heic, svg, jxl, bmp, ico, tiff, tif
```

**Video:**
```
mp4, webm, mov, mkv, avi, m4v, 3gp, ogv, wmv, flv
```

**Audio:**
```
mp3, wav, flac, ogg, opus, aac, m4a, wma, aiff, ape
```

### Platform Embeds

| Platform | URL Patterns | Embed Type |
|----------|--------------|------------|
| YouTube | `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/` | Video |
| Spotify | `open.spotify.com/(track\|album\|playlist)/` | Audio |
| Vimeo | `vimeo.com/` | Video |
| Twitch | `twitch.tv/` | Video |
| SoundCloud | `soundcloud.com/` | Audio |

### Edge Case Handling

The media detector correctly handles:

- ✅ Query parameters: `image.png?size=large`
- ✅ URL fragments: `image.jpg#section`
- ✅ Case insensitivity: `photo.PNG`, `VIDEO.MP4`
- ✅ URL encoding: `my%20image.png`
- ❌ Rejects hidden files: `.png`
- ❌ Rejects double extensions: `file.png.exe`
- ❌ Rejects extension in query only: `?file=image.png`

---

## Testing

```bash
npm test
```

Runs 88 unit tests covering:
- File extension extraction
- Media type detection (images, video, audio)
- Platform detection (YouTube, Spotify, Vimeo, etc.)
- Edge cases and security checks

---

## Project Structure

```
nc-event/
├── lib/
│   ├── index.js      # Event component
│   └── media.js      # Media detection module (standalone)
├── test/
│   └── media.test.js # Unit tests
├── js/
│   └── standalone.module.js  # Bundled Preact + htm
└── examples/         # Live demos
```

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Run tests with `npm test`
4. Submit a pull request

---

## Related Projects

- [nostr-tools](https://github.com/nbd-wtf/nostr-tools) — Nostr utilities
- [Nostr Protocol](https://github.com/nostr-protocol/nostr) — Protocol spec
- [NIP-92](https://github.com/nostr-protocol/nips/blob/master/92.md) — Media Attachments

---

## License

MIT © [Melvin Carvalho](https://github.com/melvincarvalho)
