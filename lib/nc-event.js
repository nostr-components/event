import { html, render } from '../js/standalone.module.js'
import Event from './index.js'

/**
 * <nc-event> Web Component
 *
 * Usage:
 *   <script type="module" src="https://unpkg.com/nc-event/lib/nc-event.js"></script>
 *   <nc-event content="Hello! https://example.com/photo.png"></nc-event>
 */
class NcEvent extends HTMLElement {
  static get observedAttributes() {
    return ['content', 'pubkey', 'kind', 'id', 'created-at']
  }

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render()
    }
  }

  render() {
    const event = {
      id: this.getAttribute('id') || 'event-' + Date.now(),
      pubkey: this.getAttribute('pubkey') || '',
      content: this.getAttribute('content') || '',
      kind: parseInt(this.getAttribute('kind'), 10) || 1,
      created_at: parseInt(this.getAttribute('created-at'), 10) || Math.floor(Date.now() / 1000),
      tags: []
    }

    render(html`<${Event} event=${event} />`, this)
  }
}

customElements.define('nc-event', NcEvent)

export default NcEvent
