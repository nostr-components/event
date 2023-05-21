import { Component, html } from '../js/standalone.module.js'
import '../js/nostr-ui.js'

export default class Contacts extends Component {
  render () {
    const { contacts } = this.props

    return html`
      <div class="social-links card">
        <h3>Contacts</h3>
        ${contacts?.map(app => {
      const contact = app.split(':')[2]
      const nick = contact.substring(0, 32)

      // if pubkey is set href is new pubkey
      // if in canonical directory href is ../pubkey/
      // if in non canonical directory href is /pubkey
      function getHref () {
        const currentPath = new URL(window.location.href).pathname
        const pubkey = qs.pubkey

        if (pubkey) {
          return `?pubkey=${contact}`
        } else if (currentPath.includes('/.well-known/nostr/pubkey')) {
          return `../${contact}/`
        } else {
          return `/${contact}`
        }
      }
      const href = getHref()

      return html`
          <div class="contact">
            <a href="${href}" class="contact-link">${nick}</a>
          </div>
        `
    })}

      </div>
    `
  }
}
