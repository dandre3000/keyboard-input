type Executor<T> = ConstructorParameters<typeof Promise<T>>[0]
type Resolve<T> = Parameters<Executor<T>>[0]
type Reject<T> = Parameters<Executor<T>>[0]

type ResolveRef = WeakRef<Resolve<unknown>>
type ResolveRefSet = Set<ResolveRef>
type EventTypeResolveSetMap = Map<Event['type'], ResolveRefSet>

const EventTargetToEventTypeMap: Map<EventTarget, EventTypeResolveSetMap> = new Map
const ResolveRefToResolveRefSetMap: Map<ResolveRef, ResolveRefSet> = new Map
const ResolveRefToEventTarget: Map<ResolveRef, EventTarget> = new Map

const eventListener: EventListener = event => {

}

const executorState = {
    eventTarget: undefined as EventTarget,
    type: undefined as Event['type']
}

const executor: Executor<unknown> = (resolve, reject) => {
    const { eventTarget, type } = executorState
    let eventTypeMap = EventTargetToEventTypeMap.get(eventTarget)

    if (!eventTypeMap) {
        EventTargetToEventTypeMap.set(eventTarget, eventTypeMap = new Map)
    }

    let resolveRefSet = eventTypeMap.get(type)

    if (!resolveRefSet) {
        eventTypeMap.set(type, resolveRefSet = new Set)
    }

    eventTarget.addEventListener(type, (...args: any[]) => {
        for (const resolveRef of resolveRefSet) {
            const resolve = resolveRef.deref()

            if (resolve) resolve(args)
        }

        resolveRefSet.clear()
    })
}

const asyncEvent = <T extends Event>(target: EventTarget, type: string): Promise<T> => {}