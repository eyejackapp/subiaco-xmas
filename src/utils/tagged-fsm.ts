type SourceState = { s: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SourceEvent = { e: string; args: any[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventOfTag<U extends SourceEvent, T extends string> = U extends { e: T } ? U : never;
type StateOfTag<U extends SourceState, T extends string> = U extends { s: T } ? U : never;

type TransitionEffect<
    TStates extends SourceState,
    TEvent extends SourceEvent,
    TStateTag extends TStates['s'] = TStates['s'],
    TEventTag extends TEvent['e'] = TEvent['e'],
> = (source: StateOfTag<TStates, TStateTag>, ...args: EventOfTag<TEvent, TEventTag>['args']) => TStates;

type TransitionDefinition<
    TStates extends SourceState,
    TEvent extends SourceEvent,
    TStateTag extends TStates['s'] = TStates['s'],
    TEventTag extends TEvent['e'] = TEvent['e'],
> = {
    from: TStates['s'];
    event: TEvent['e'];
    transform: TransitionEffect<TStates, TEvent, TStateTag, TEventTag>;
};

export class TaggedFsm<TStates extends SourceState, TEvents extends SourceEvent> {
    protected transitions: TransitionDefinition<TStates, TEvents>[] = [];
    protected _value: TStates;
    public logTranstions: boolean = false;

    constructor(initialState: TStates) {
        this._value = initialState;
    }

    /**
     * @returns Returns the current state of the FSM
     */
    get value(): TStates {
        return this._value;
    }
    /**
     * @returns Returns the tag of the current state.
     */
    get tag(): TStates['s'] {
        return this._value.s;
    }

    defineTransition<TStateTag extends TStates['s'] = TStates['s'], TEventTag extends TEvents['e'] = TEvents['e']>(
        from: TStateTag | TStateTag[],
        event: TEventTag,
        transform: TransitionEffect<TStates, TEvents, TStateTag, TEventTag>,
    ) {
        if (Array.isArray(from)) {
            for (const fromSingle of from) {
                const definition: TransitionDefinition<TStates, TEvents, TStateTag, TEventTag> = {
                    from: fromSingle,
                    event,
                    transform,
                };
                // @ts-expect-error Cant be bothered
                this.transitions.push(definition);
            }
        } else {
            const definition: TransitionDefinition<TStates, TEvents, TStateTag, TEventTag> = {
                from,
                event,
                transform,
            };
            // @ts-expect-error Cant be bothered
            this.transitions.push(definition);
        }
        return this;
    }

    private getTransitionForEvent(event: TEvents['e']) {
        for (let i = 0; i < this.transitions.length; i++) {
            const trans = this.transitions[i];
            if (trans.from === this._value.s && trans.event === event) return trans;
        }
    }

    /**
     * Check whether the FSM is able to transition into a given event.
     * @param event - The event you want to call
     * @returns True if can transition using this event.
     */
    can(event: TEvents['e']) {
        return !!this.getTransitionForEvent(event);
    }

    /**
     * Transitions the state machine with a given event
     * WARN: Throws if there is no avaliable transition given the current state.
     * @param event - Event key
     * @returns The next event
     */
    dispatch<TEvent extends TEvents = TEvents, TEventTag extends TEvent['e'] = TEvent['e']>(
        event: TEventTag,
        ...args: EventOfTag<TEvent, TEventTag>['args']
    ): TStates {
        // console.log(`FSM: Event ${event} with args: `, ...args);
        const transition = this.getTransitionForEvent(event);
        if (!transition) throw new Error('a');
        // @ts-expect-error Cant be bothered
        const next = transition.transform(this._value, ...args);
        this._value = next;

        if (this.logTranstions) {
            // console.log(`FSM Transition (${transition.from} -> ${event} -> ${next.s}). Current state:`, next);
        }
        return next;
    }
}
