import { html, Component } from '../js/standalone.module.js'
import { detectMediaType, detectPlatform } from './media.js'
import { fetchM3U } from './m3u-parser.js'
import '../js/nostr-ui.js'

/**
 * Event Component - Renders Nostr events with rich media support
 *
 * @example
 * import Event from 'nc-event'
 * render(html`<${Event} event=${nostrEvent} />`, document.body)
 */
export default class Event extends Component {
  constructor(props) {
    super(props)
    this.state = { playlists: {} }
  }

  /**
   * Load playlist content from URL
   */
  async loadPlaylist(url) {
    if (this.state.playlists[url]) return // Already loaded or loading

    this.setState({ playlists: { ...this.state.playlists, [url]: { loading: true } } })

    try {
      const tracks = await fetchM3U(url)
      this.setState({ playlists: { ...this.state.playlists, [url]: { tracks } } })
    } catch (err) {
      this.setState({ playlists: { ...this.state.playlists, [url]: { error: err.message } } })
    }
  }

  /**
   * Renders media content based on detected type
   */
  renderMedia(url) {
    const mediaType = detectMediaType(url)
    const platform = detectPlatform(url)

    if (platform?.platform === 'youtube') {
      return html`<div><iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/${platform.id}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe></div>`
    }

    if (mediaType === 'image') {
      return html`<div><img
        style="max-width: 60%; max-height: 600px; height: auto; width: auto;"
        src=${url}
        alt="User content"
        loading="lazy"
      /></div>`
    }

    if (mediaType === 'video') {
      return html`<div><video
        style="max-width: 60%; max-height: 600px; height: auto;"
        controls
        src=${url}
      ></video></div>`
    }

    if (mediaType === 'audio') {
      return html`<div><audio controls src=${url}></audio></div>`
    }

    if (mediaType === 'playlist') {
      const playlist = this.state.playlists[url]

      // Trigger loading if not started
      if (!playlist) {
        this.loadPlaylist(url)
        return html`<div style="padding: 10px; background: #f5f5f5; border-radius: 8px;">
          <em>Loading playlist...</em>
        </div>`
      }

      if (playlist.loading) {
        return html`<div style="padding: 10px; background: #f5f5f5; border-radius: 8px;">
          <em>Loading playlist...</em>
        </div>`
      }

      if (playlist.error) {
        return html`<div style="padding: 10px; background: #fee; border-radius: 8px; color: #c00;">
          Failed to load playlist: ${playlist.error}
        </div>`
      }

      if (playlist.tracks && playlist.tracks.length > 0) {
        return html`<div style="background: #f9f9f9; border-radius: 8px; padding: 10px; margin: 10px 0;">
          <strong>Playlist (${playlist.tracks.length} tracks)</strong>
          <div style="margin-top: 10px;">
            ${playlist.tracks.map((track, i) => html`
              <div key=${i} style="display: flex; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 8px; align-items: center;">
                ${track.thumbnail && html`<img src=${track.thumbnail} alt="" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;" />`}
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${track.title}</div>
                  ${track.artist && html`<div style="font-size: 0.85em; color: #666;">${track.artist}</div>`}
                  <div style="margin-top: 6px;">
                    ${track.type === 'video' && html`<video controls preload="metadata" src=${track.url} style="max-width: 100%; max-height: 150px; border-radius: 4px;"></video>`}
                    ${track.type === 'audio' && html`<audio controls preload="metadata" src=${track.url}></audio>`}
                    ${track.type === 'image' && html`<img src=${track.url} alt=${track.title} style="max-width: 150px; border-radius: 4px;" loading="lazy" />`}
                    ${!['video', 'audio', 'image'].includes(track.type) && html`<a href=${track.url} target="_blank" rel="noopener">${track.url}</a>`}
                  </div>
                </div>
              </div>
            `)}
          </div>
        </div>`
      }
    }

    return null
  }

  render() {
    const { event } = this.props
    if (!event) return html`<div>No event data</div>`

    const { content, pubkey } = event
    const pieces = content?.split(/\s+/) || []

    return html`
      <div id="container">
        <div>
          User <a target="_blank" rel="noopener noreferrer" href="https://nostr.social/${pubkey}">${pubkey}</a>
        </div>
        <hr />
        <div>
          ${pieces.map(piece => {
            const media = this.renderMedia(piece)
            if (media) return media
            return html`${piece} `
          })}
        </div>
        <hr />
        <details>
          <summary>Raw event data</summary>
          <pre>${JSON.stringify(event, null, 2)}</pre>
        </details>
      </div>
    `
  }
}
