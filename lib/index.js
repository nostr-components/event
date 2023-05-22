import { html, Component, render } from '../js/standalone.module.js'
import { getQueryStringValue } from '../util.js'
import '../js/nostr-ui.js'
import UserProfile from '../components/UserProfile.js'
import Contacts from '../components/Contacts.js'

function doc () {
  if (di.data.length) {
    return di.data[0]
  } else {
    return di.data
  }
}

// APP
export default class Profile extends Component {
  constructor (props) {
    super(props)

    this.state = {
      event: props.event,
      data: {},
      error: null
    }
  }

  getRelay () {
    const relay = getQueryStringValue('relay') || doc().relay || 'wss://nostr-pub.wellorder.net'
    return relay
  }

  async componentDidMount () {

  }

  render () {
    const { content } = this.state.event
    const imagePattern = /\.(jpeg|jpg|gif|png)$/
    const contentPieces = content?.split(/\s+/)

    return html`
      <div id="container">
        <div>User <a target="_blank" href="https://nostr.social/${this.state.event.pubkey}">${this.state.event.pubkey}</a></div>
        <hr />
        <div>
          ${contentPieces?.map(piece => {
      const isImage = imagePattern.test(piece)
      return isImage ? html`<div><img style="max-width: 60%; height: auto;" src=${piece} alt="User content" /></div>` : html`${piece} `
    })}
        </div>
        <hr />
        Raw event data:
        <pre>
          ${JSON.stringify(this.state.event, null, 2)}
        </pre>
      </div>
    `
  }
}
