import { html, Component, render } from '../js/standalone.module.js'
import { getQueryStringValue } from '../util.js'
import '../js/nostr-ui.js'
import UserProfile from '../components/UserProfile.js'
import Contacts from '../components/Contacts.js'

function doc() {
  if (di.data.length) {
    return di.data[0]
  } else {
    return di.data
  }
}

// APP
export default class Profile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      event: props.event,
      data: {},
      error: null
    }
  }

  getRelay() {
    const relay = getQueryStringValue('relay') || doc().relay || 'wss://nostr-pub.wellorder.net'
    return relay
  }

  async componentDidMount() {
    return

  }

  render() {
    return html`

      <div id="container">
        <pre>
          ${JSON.stringify(this.state.event, null, 2)}
        </pre>

      </div>
    `
  }
}
