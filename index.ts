import DereferenceRegistry from "@dandre3000/dereference-registry"

type KeyCode = KeyboardEvent['code'] | KeyboardEvent['key']
type KeyboardEventTypes =
    'keydown' |
    'keypress' |
    'keyup'

type PromiseExecutor = ConstructorParameters<typeof Promise<KeyboardEvent>>[0]
type Resolve = Parameters<PromiseExecutor>[0]
type Reject = Parameters<PromiseExecutor>[1]

interface KeyboardObserverData extends EventListenerObject {
    symbol: symbol
    eventTargetRef: WeakRef<EventTarget>
    buttons: Set<KeyCode>
    keydown: Set<Resolve>
    keypress: Set<Resolve>
    keyup: Set<Resolve>
    rejectSet: Set<Reject>
    resolveToRejectMap: Map<Resolve, Reject>
}

const KeyboardObserverSymbol = Symbol()

const keyboardEventListener = function (this: KeyboardObserverData, event: KeyboardEvent) {
    if (event.type === 'keyup') {
        this.buttons.delete(event.code)
        this.buttons.delete(event.key)
    } else {
        this.buttons.add(event.code)
        this.buttons.add(event.key)
    }

    for (const resolve of this[event.type]) {
        resolve(event)

        this.rejectSet.delete(this.resolveToRejectMap.get(resolve))
        this.resolveToRejectMap.delete(resolve)
    }

    this[event.type].clear()
}

const KeyboardObserverCleanup = (data: KeyboardObserverData) => {
    data.eventTargetRef.deref()?.removeEventListener('keydown', data, true)
    data.eventTargetRef.deref()?.removeEventListener('keypress', data, true)
    data.eventTargetRef.deref()?.removeEventListener('keyup', data, true)

    for (const reject of data.rejectSet) {
        reject('KeyboardObserver instance has been disconnected')
    }

    data.buttons.clear()
    data.keydown.clear()
    data.keypress.clear()
    data.keyup.clear()
    data.rejectSet.clear()
}

let currentEventType: KeyboardEventTypes
let currentKeyboardObserver: KeyboardObserver
let currentKeyboardObserverData: KeyboardObserverData

const eventPromiseExecutor: PromiseExecutor = (resolve, reject) => {
    if (currentKeyboardObserverData?.symbol !== KeyboardObserverSymbol)
        throw new TypeError(`this (${Object.prototype.toString.call(currentKeyboardObserver)}) is not a KeyboardObserver instance`)

    currentEventType = String(currentEventType) as KeyboardEventTypes
    if (currentEventType !== 'keydown' && currentEventType !== 'keypress' && currentEventType !== 'keyup')
        throw new TypeError(`type (${currentEventType}) argument is not a equal to "keydown", "keypress" or "keyup"`)

    currentKeyboardObserverData[currentEventType].add(resolve)
    currentKeyboardObserverData.rejectSet.add(reject)
    currentKeyboardObserverData.resolveToRejectMap.set(resolve, reject)
}

const KeyboardObserverRegistry = new DereferenceRegistry(KeyboardObserverCleanup, 1000)

export class KeyboardObserver {
    #data: KeyboardObserverData

    constructor (eventTarget: EventTarget) {
        this.#data = {
            symbol: KeyboardObserverSymbol,
            eventTargetRef: new WeakRef(eventTarget),
            buttons: new Set,
            keydown: new Set,
            keypress: new Set,
            keyup: new Set,
            rejectSet: new Set,
            resolveToRejectMap: new Map,
            handleEvent: keyboardEventListener
        }

        eventTarget.addEventListener('keydown', this.#data, true)
        eventTarget.addEventListener('keypress', this.#data, true)
        eventTarget.addEventListener('keyup', this.#data, true)

        KeyboardObserverRegistry.register(this, this.#data, this)
        KeyboardObserverRegistry.start()
    }

    getButtons <T extends KeyCode[]>(...keyCodes: T): T['length'] extends 1 ? boolean : boolean[] {
        if (this.#data?.symbol !== KeyboardObserverSymbol)
            throw TypeError(`this (${Object.prototype.toString.call(this)}) is not a KeyboardObserver instance`)

        if (keyCodes.length === 1) return this.#data.buttons.has(String(keyCodes[0])) as any

        const buttons: boolean[] = []

        for (let i = 0; i < keyCodes.length; i++) {
            buttons.push(this.#data.buttons.has(String(keyCodes[i])))
        }

        return buttons as any
    }

    getPressedKeyCodes () {
        if (this.#data?.symbol !== KeyboardObserverSymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a KeyboardObserver instance`)

        return new Set(this.#data.buttons)
    }

    getNextEvent (type: KeyboardEventTypes) {
        currentEventType = type
        currentKeyboardObserver = this
        currentKeyboardObserverData = this.#data
        const promise = new Promise(eventPromiseExecutor)
        currentEventType = undefined
        currentKeyboardObserver = undefined
        currentKeyboardObserverData = undefined

        return promise
    }
}

export default KeyboardObserver