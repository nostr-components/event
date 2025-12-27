import { html, Component } from '../js/standalone.module.js'
import { detectMediaType, detectPlatform } from './media.js'
import '../js/nostr-ui.js'

/**
 * Event Component - Renders Nostr events with rich media support
 *
 * @example
 * import Event from 'nc-event'
 * render(html`<${Event} event=${nostrEvent} />`, document.body)
 */
export default class Event extends Component {
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
