type KeyCode = KeyboardEvent['code'] | KeyboardEvent['key']

interface KeyboardInputData extends EventListenerObject {
    symbol: symbol
    target: EventTarget
    buttons: Set<KeyCode>
    handleEvent: (this: KeyboardInputData) => void
}

export class KeyboardInput {
    static #symbol = Symbol()

    #data: KeyboardInputData

    static #listener (this: KeyboardInputData, event: KeyboardEvent) {
        if (event.type === 'keyup') {
            this.buttons.delete(event.code)
            if (event.code !== event.key) this.buttons.delete(event.key)
        } else {
            this.buttons.add(event.code)
            if (event.code !== event.key) this.buttons.add(event.key)
        }
    }

    constructor (target: EventTarget) {
        if (!(target instanceof EventTarget)) throw new TypeError

        this.#data = {
            symbol: KeyboardInput.#symbol,
            target,
            buttons: new Set,
            handleEvent: KeyboardInput.#listener
        }

        target.addEventListener('keydown', this.#data, true)
        target.addEventListener('keypress', this.#data, true)
        target.addEventListener('keyup', this.#data, true)
    }

    areButtonsPressed <T extends KeyCode[]>(...keyCodes: T): T['length'] extends 1 ? boolean : boolean[] {
        if (this.#data?.symbol !== KeyboardInput.#symbol)
            throw TypeError(`this (${Object.prototype.toString.call(this)}) is not a KeyboardInput instance`)

        if (keyCodes.length === 1) return this.#data.buttons.has(String(keyCodes[0])) as any

        const buttons: boolean[] = []

        for (let i = 0; i < keyCodes.length; i++) {
            buttons.push(this.#data.buttons.has(String(keyCodes[i])))
        }

        return buttons as any
    }

    getPressedButtonSet () {
        if (this.#data?.symbol !== KeyboardInput.#symbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a KeyboardInput instance`)

        return new Set(this.#data.buttons)
    }
}

export default KeyboardInput