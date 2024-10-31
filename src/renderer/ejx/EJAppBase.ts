/* eslint-disable @typescript-eslint/no-unused-vars */

export abstract class EJAppBase {
    constructor(public id: number) {}

    update(_timeElapsed: number, _timeDelta: number) {}
    pointerMoveHandler(_event: PointerEvent) {}
    pointerDownHandler(_event: PointerEvent) {}
    pointerUpHandler(_event: PointerEvent) {}
    isComplete() {
        return false;
    }
    dispose() {}
}
