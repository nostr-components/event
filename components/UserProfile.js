import { Component, html } from '../js/standalone.module.js'
import '../js/nostr-ui.js'

export default class UserProfile extends Component {
  render() {
    const { userPublicKey, name, picture, about, banner, github } = this.props
    const key = qs.pubkey || userPublicKey
    const irisLink = `https://iris.to/${key}`
    const canonical = `/.well-known/nostr/pubkey/${key}/index.json`
    const githubLink = github
    const shortenedPubKey = key ? key.slice(0, 16) : ''

    return html`
      <div class="user-profile card">
        ${banner ? html`<div class="banner"><img src="${banner}" alt="Banner" /></div>` : ''}
        <div class="profile-details">
          <img src="${picture}" alt="Profile Picture" class="user-picture" />
          <h2><span title="In the Nostr Strong Set">Profile Picture
          🛡️</span> ${name}</h2>
          
          ${key ? html`<p class="pubkey">Pubkey: <a href="${irisLink}" target="_blank">${shortenedPubKey}</a></p>` : ''}
          ${about ? html`<p class="about">${about}</p>` : ''}
          <div class="icons" style="display: flex; align-items: center;">
            ${github ? html`<a href="${githubLink}" target="_blank"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" width="18" height="18" /></a>` : ''}
          <a style="text-decoration:none" href="${canonical}" target="_blank">📥</a>
          </div>
        </div>
      </div>
    `
  }
}
