NIP-MEDIA
=========

Content Rendering Guidelines
----------------------------

`draft` `optional`

This NIP defines standard guidelines for how clients SHOULD detect and render inline media URLs and other embeddable content within event `.content` fields. The goal is to provide a consistent user experience across different Nostr clients.

## Motivation

Currently, each Nostr client implements its own regex patterns and heuristics for detecting media URLs, leading to inconsistent rendering of the same content across clients. A post that displays an embedded image in one client may show a raw URL in another.

This NIP aims to:

1. Document canonical file extension lists for media type detection
2. Provide reference regex patterns and test vectors
3. Establish a fallback hierarchy that prioritizes structured metadata over URL sniffing
4. Enable interoperability testing between clients

## Detection Priority

Clients SHOULD detect media and embeddable content in the following priority order:

1. **`imeta` tags** ([NIP-92](92.md)) - Structured metadata attached by the publisher
2. **`r` tags with metadata** - URL references with type hints
3. **URL extension sniffing** - Inferring type from file extension (this NIP)
4. **Content-Type fetching** - HTTP HEAD request to determine MIME type (optional, expensive)

Clients SHOULD prefer `imeta` tags when present, as they provide authoritative metadata from the publisher. Extension sniffing SHOULD be used as a fallback for URLs without accompanying metadata.

## Media Type Detection

### File Extensions

Clients SHOULD recognize the following file extensions as media types:

#### Images

```
png, jpg, jpeg, gif, webp, avif, heic, svg, jxl, bmp, ico, tiff, tif
```

#### Video

```
mp4, webm, mov, mkv, avi, m4v, 3gp, ogv, wmv, flv, m3u, m3u8
```

#### Audio

```
mp3, wav, flac, ogg, opus, aac, m4a, wma, aiff, ape
```

### Reference Regex Patterns

The following patterns are provided as reference implementations. Clients MAY use equivalent patterns suited to their programming language.

#### URL Detection

```regex
https?:\/\/[^\s<>\[\]"']+
```

#### Extension Extraction

```regex
\.([a-zA-Z0-9]{1,7})(?:[?#]|$)
```

#### Combined Media URL Detection

For convenience, clients MAY use combined patterns:

**Images:**
```regex
https?:\/\/[^\s<>\[\]"']+\.(?:png|jpe?g|gif|webp|avif|heic|svg|jxl|bmp|ico|tiff?)(?:[?#].*)?(?=\s|$)
```

**Video:**
```regex
https?:\/\/[^\s<>\[\]"']+\.(?:mp4|webm|mov|mkv|avi|m4v|3gp|ogv|wmv|flv|m3u8?)(?:[?#].*)?(?=\s|$)
```

**Audio:**
```regex
https?:\/\/[^\s<>\[\]"']+\.(?:mp3|wav|flac|ogg|opus|aac|m4a)(?:[?#].*)?(?=\s|$)
```

### Platform-Specific Embeds

Clients MAY additionally recognize and embed content from specific platforms. These are OPTIONAL and client-specific, but common patterns include:

| Platform | URL Pattern | Embed Type |
|----------|-------------|------------|
| YouTube | `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/` | Video player |
| Spotify | `open.spotify.com/(track\|album\|playlist)/` | Audio player |
| Apple Music | `music.apple.com/` | Audio player |
| SoundCloud | `soundcloud.com/` | Audio player |
| Twitch | `twitch.tv/` | Video player |
| Wavlake | `wavlake.com/` | Audio player |
| Zap.Stream | `zap.stream/` | Live stream |
| Nostr Nests | `nostrnests.com/` | Audio room |

Clients implementing platform embeds SHOULD:
- Provide user controls to disable automatic embedding
- Respect user privacy preferences (e.g., no auto-loading third-party content)
- Fall back to displaying the URL as a link if embedding fails

## Test Vectors

Clients SHOULD validate their implementation against these test cases:

### Image Detection

| Input URL | Expected Type | Notes |
|-----------|---------------|-------|
| `https://example.com/photo.png` | image | Basic PNG |
| `https://example.com/photo.PNG` | image | Case insensitive |
| `https://nostr.build/i/abc123.webp` | image | WebP format |
| `https://example.com/image.jpeg?size=large` | image | With query params |
| `https://example.com/image.jpg#section` | image | With fragment |
| `https://example.com/photo.heic` | image | HEIC (iPhone) |
| `https://example.com/icon.svg` | image | SVG vector |
| `https://example.com/photo.avif` | image | AVIF format |
| `https://example.com/file.jxl` | image | JPEG XL |

### Video Detection

| Input URL | Expected Type | Notes |
|-----------|---------------|-------|
| `https://example.com/video.mp4` | video | Basic MP4 |
| `https://example.com/clip.webm` | video | WebM format |
| `https://example.com/movie.mkv` | video | Matroska |
| `https://example.com/clip.mov` | video | QuickTime |
| `https://example.com/old.avi` | video | AVI format |
| `https://example.com/mobile.3gp` | video | Mobile format |

### Audio Detection

| Input URL | Expected Type | Notes |
|-----------|---------------|-------|
| `https://example.com/song.mp3` | audio | Basic MP3 |
| `https://example.com/track.flac` | audio | Lossless FLAC |
| `https://example.com/podcast.ogg` | audio | Ogg Vorbis |
| `https://example.com/voice.opus` | audio | Opus codec |
| `https://example.com/music.wav` | audio | Uncompressed WAV |
| `https://example.com/track.m4a` | audio | AAC container |

### Non-Media (Should NOT embed as media)

| Input URL | Expected Type | Notes |
|-----------|---------------|-------|
| `https://example.com/document.pdf` | link | PDF document |
| `https://example.com/page` | link | No extension |
| `https://example.com/api/image` | link | No extension (requires HEAD) |
| `https://example.com/.png` | link | Hidden file, not image |
| `https://png.example.com/file` | link | Extension in domain |
| `https://example.com/fake.png.exe` | link | Double extension |
| `https://example.com/file.mp4.txt` | link | Text file |
| `https://example.com/download?file=image.png` | link | Extension in query only |

### Edge Cases

| Input URL | Expected Type | Notes |
|-----------|---------------|-------|
| `https://example.com/path/to/image.png?token=abc&size=large` | image | Complex query |
| `https://example.com/image.PNG` | image | Uppercase extension |
| `https://example.com/my%20image.png` | image | URL encoded space |
| `https://example.com/image.jpeg` | image | JPEG alternate spelling |
| `https://example.com/image.jpg` | image | JPG short form |

## Content Display Guidelines

### URL Deduplication

When a URL appears in both `.content` and as an `imeta` tag, clients SHOULD:

1. Use the `imeta` metadata for rendering decisions
2. Optionally hide the raw URL from the text content to avoid duplication
3. Display the media embed in a consistent location (inline or at end of post)

### Fallback Behavior

When media cannot be loaded, clients SHOULD:

1. Display the URL as a clickable link
2. Optionally show an error indicator
3. NOT remove the URL entirely from display

### Security Considerations

Clients MUST:

- Sanitize URLs before rendering to prevent XSS attacks
- Validate URL schemes (only `https://` and `http://` for media)
- Consider Content Security Policy implications for embedded content
- Provide users the option to disable automatic media loading

Clients SHOULD:

- Use `rel="noopener noreferrer"` on external links
- Consider lazy loading for media-heavy content
- Implement rate limiting for media fetching

## Implementation Notes

### Regex Portability

Regex syntax varies between programming languages. Implementers should note:

- `\w` may include Unicode in some languages (Python) but not others (JavaScript)
- Lookahead/lookbehind support varies
- Case-insensitive flags differ (`/i` in JS, `(?i)` in Python, `RegexOptions.IgnoreCase` in C#)

The patterns in this NIP use common features available in most regex engines.

### Performance

Clients processing many events SHOULD:

- Compile regex patterns once at startup
- Consider using string methods (`endsWith`, `includes`) for simple checks before regex
- Cache parsing results for frequently-viewed events

## Reference Implementations

| Client | Language | File | Approach |
|--------|----------|------|----------|
| nc-event | JavaScript | [media.js](https://github.com/nostr-components/event/blob/gh-pages/lib/media.js) | Extension allowlist + platform regex |
| nostr-tools | TypeScript | [nip27.ts](https://github.com/nbd-wtf/nostr-tools/blob/master/nip27.ts) | Regex on `url.pathname` |
| Snort | TypeScript | [text.ts](https://github.com/v0l/snort/blob/main/packages/system/src/text.ts), [const.ts](https://github.com/v0l/snort/blob/main/packages/system/src/const.ts) | Regex patterns |
| Jumble | TypeScript | [url.ts#L130-L157](https://github.com/CodyTseng/jumble/blob/master/src/lib/url.ts#L130-L157), [constants.ts#L125-L140](https://github.com/CodyTseng/jumble/blob/master/src/constants.ts#L125-L140) | `URL.pathname.endsWith()` |
| Primal | TypeScript | [constants.ts#L338-L348](https://github.com/PrimalHQ/primal-web-app/blob/main/src/constants.ts#L338-L348) | Regex patterns |
| Damus | Swift | [NoteContent.swift](https://github.com/damus-io/damus/blob/master/damus/Features/Events/Models/NoteContent.swift) | `lastPathComponent` + switch |
| Amethyst | Kotlin | [RichTextParser.kt](https://github.com/vitorpamplona/amethyst/blob/main/commons/src/main/java/com/vitorpamplona/amethyst/commons/richtext/RichTextParser.kt) | `endsWith()` on extension list |
| Coracle | TypeScript | [welshman/parser.ts](https://github.com/coracle-social/welshman/blob/master/packages/content/src/parser.ts) | Regex on URL string |
| Nostria | TypeScript | [utils.ts](https://github.com/nostria-app/nostria/blob/main/src/app/services/format/utils.ts), [utilities.service.ts](https://github.com/nostria-app/nostria/blob/main/src/app/services/utilities.service.ts) | Regex + CDN pattern matching |

### Implementation Comparison

| Format | nc-event | nostr-tools | Snort | Jumble | Primal | Damus | Amethyst | Coracle | Nostria |
|--------|----------|-------------|-------|--------|--------|-------|----------|---------|---------|
| **Images** |
| heic | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| svg | ✅ | ✅ | varies | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| avif | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| bmp | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| ico | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| tiff | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Video** |
| webm | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| avi | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| mkv | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| m3u | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| m3u8 | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| wmv | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| flv | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Audio** |
| mp3 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️* | ✅ | ❌ |
| wav | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| flac | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Method** |
| Uses URL API | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| CDN patterns | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*⚠️ Amethyst classifies mp3 as video, not audio

## Relationship to Other NIPs

- [NIP-92](92.md): Media Attachments - Provides `imeta` tags, which this NIP recommends as the primary metadata source
- [NIP-94](94.md): File Metadata - Defines file metadata fields used in `imeta` tags
- [NIP-27](27.md): Text Note References - Defines `nostr:` URI handling
- [NIP-21](21.md): `nostr:` URI scheme - Protocol handler specification
- [NIP-B7](B7.md): Blossom media - SHA-256 addressable media

## Changelog

- Initial draft: Standardizes media detection patterns and test vectors
