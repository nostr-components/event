import { html, render } from '../js/standalone.module.js'
import '../js/nostr-ui.js'
import Event from '../lib/index.js'

function doc () {
  if (di.data.length) {
    return di.data[0]
  } else {
    return di.data
  }
}

const docEvent = doc().mainEntity

const event = qs.event || docEvent

console.log(event)

render(html` <${Event} event=${event} /> `, document.body)
