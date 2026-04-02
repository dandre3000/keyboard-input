import { KeyboardObserver } from '@dandre3000/keyboard-observer'

let k = new KeyboardObserver(document.documentElement)

k.nextEvent('keydown').then(e => console.log(e))

setInterval(() => {
    console.log(k.getButtons('q', 'w'))
    console.log(k.getAllPressedKeyCodes())
}, 1000 / 60)