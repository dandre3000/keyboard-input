# keyboard-observer

Query keyboard state and use keyboard events asynchronously.

## Installation

npm i @dandre3000/keyboard-observer

## Usage

```js
import KeyboardObserver from '@dandre3000/keyboard-observer'

let k = new KeyboardObserver(document.documentElement)

await k.getNextEvent('keydown').then(e => console.log(e))

setInterval(() => {
    console.log(k.getButtons('KeyQ', 'KeyW'))
}, 1000 / 60)
```

## Exports

### Class KeyboardObserver

#### constructor (eventTarget: EventTarget)

### Instance methods

#### getButtons (keyCode: string): boolean
#### getButtons (...keyCodes: string[]): boolean[]

#### getPressedKeyCodes (): Set<string>

#### getNextEvent (type: KeyboardEventTypes): Promise<KeyboardEvent>

## License

[MIT](https://github.com/dandre3000/keyboard-observer/blob/main/LICENSE)
