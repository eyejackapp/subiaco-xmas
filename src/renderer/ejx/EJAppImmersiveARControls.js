import mitt from 'mitt';
import { EJAppBase } from './EJAppBase.ts';
import { clamp, map } from './EJUtils.js';

/**
 * @class
 * @classdesc
 * @property {boolean} enableDragRotX Enables drag around the Y axis
 * @property {boolean} enableDragRotY Enables drag around the X axis
 */

class EJAppImmersiveARControls extends EJAppBase {
    constructor(id, shared) {
        super(id);
        this.emitter = mitt();

        this.shared = shared;
        this.player = this.shared.player;
        this.cubeProxy = this.shared.cubeProxy;
        this.cubeFloorPos = new THREE.Vector3().copy(this.shared.cubeFloorPos);
        this.contentContainer = this.player.contentContainer;
        if (!this.contentContainer) {
            this.contentContainer = this.player.cubeContainer;
        }
        //
        this.cubePosition = new THREE.Vector3().copy(this.contentContainer.position);
        console.log('Initial cube position: ', this.cubePosition);
        this.cubeRotation = new THREE.Quaternion().copy(this.contentContainer.quaternion);
        this.cubeScale = new THREE.Vector3().copy(this.contentContainer.scale);
        //
        this.events = [];
        this.pointers = [];
        //
        this.enableDragRotX = true;
        this.enableDragRotY = true;
        // this.enableDragRot = true;
        this.enablePinchScale = true;
        this.enablePinchPan = true;
        //
        this.cameraQuat = new THREE.Quaternion();
        //
        this.dragOnHit = false; // test to first check if content is hit before doing dragging.
        this.dragging = false;
        this.dragPos = new THREE.Vector2(0, 0);
        this.dragVel = new THREE.Vector2(0, 0);
        this.dragVelEased = new THREE.Vector2(0, 0);
        this.dragVelEase = 0.2;
        this.dragVelDecay = 0.045;
        this.dragRot = new THREE.Vector2(0, 0);
        this.dragRotFreedom = new THREE.Vector2(1, 1); // rotation around X and Y (1 or 0)-(On or Off)
        this.dragRotEuler = new THREE.Euler(0, 0, 0, 'XYZ');
        this.dragRotAxisX = new THREE.Vector3(0, 0, 0);
        this.dragRotQuatInit = new THREE.Quaternion();
        this.dragRotQuatX = new THREE.Quaternion();
        this.dragRotQuatY = new THREE.Quaternion();
        this.dragRotQuatXY = new THREE.Quaternion();
        this.dragRotQuat = new THREE.Quaternion();
        this.dragRotSensitivity = 4.0;
        //
        this.pinchScaleOnHit = false;
        this.pinchScaling = false;
        this.pinchPos0 = new THREE.Vector3(0, 0, 0);
        this.pinchPos1 = new THREE.Vector3(0, 0, 0);
        this.pinchScale = this.cubeScale.x;
        this.pinchScaleEased = 1.0;
        this.pinchScaleDiff = 0;
        this.pinchScaleMin = 0.2;
        this.pinchScaleMax = 5;
        this.pinchScaleSensitivity = 1.0;
        //
        this.pinchPanOnHit = false;
        this.pinchPanning = false;
        this.pinchMid0 = new THREE.Vector3(0, 0, 0);
        this.pinchMid1 = new THREE.Vector3(0, 0, 0);
        this.pinchPan = new THREE.Vector3(0, 0, 0);
        this.pinchPanNew = new THREE.Vector3(0, 0, 0);
        this.pinchPanEased = new THREE.Vector3(0, 0, 0);
        this.pinchPanDiff = new THREE.Vector3(0, 0, 0);
        this.pinchPanFreedom = new THREE.Vector3(0, 1, 0); // only pan in Y
        this.pinchPanAxisDir = new THREE.Vector3(1, 1, 1);
        this.pinchPanClampMinY = 0.0;
        this.pinchPanClampMaxY = 0.0;
        this.pinchPanSensitivity = 1.0;
    }

    update(timeElapsed, timeDelta) {
        const timeDeltaTarget = 1.0 / 60.0;
        const timeDeltaScale = timeDelta / timeDeltaTarget; // this will standardise easing animations (below) across varyig frame rates.
        this.pointersResolve();

        let pointer0 = null;
        if (this.pointers.length > 0) {
            pointer0 = this.pointers[0];
        }
        let pointer1 = null;
        if (this.pointers.length > 1) {
            pointer1 = this.pointers[1];
        }

        //------------------------------------------------------------ Rotation.
        if (this.dragging) {
            const velScaleX = this.enableDragRotX ? this.dragRotSensitivity : 0.0; // disable drag X if zero.
            const velScaleY = this.enableDragRotY ? this.dragRotSensitivity : 0.0; // disable drag Y if zero.
            this.dragVel.x = (pointer0.dragPos.x - this.dragPos.x) * this.dragRotFreedom.x * velScaleX;
            this.dragVel.y = (pointer0.dragPos.y - this.dragPos.y) * this.dragRotFreedom.y * velScaleY;
            // if (!this.enableDragRot) {
            //     this.dragVel.set(0, 0);
            // }
            this.dragVelEased.lerp(this.dragVel, clamp(this.dragVelEase * timeDeltaScale, 0.0, 1.0));
            this.dragPos.set(pointer0.dragPos.x, pointer0.dragPos.y);
            let dragStop = false;
            dragStop = dragStop || pointer0.up;
            dragStop = dragStop || this.pointers.length > 1;
            if (dragStop) {
                this.emitter.emit('drag-stop');
                this.dragging = false;
            }
        } else {
            let dragStart = false;
            dragStart = dragStart || (pointer0 && pointer0.down); // drag when pointer is down anywhere on the screen.
            if (dragStart && this.dragOnHit) {
                dragStart = pointer0.hit; // drag only when the content is hit with a raycast.
            }
            if (dragStart) {
                this.emitter.emit('drag-start');
                this.dragging = true;
                this.dragPos.set(pointer0.dragPos.x, pointer0.dragPos.y);
                this.dragVelEased.set(0, 0);
            }
        }
        if (this.dragVelEased.length() > 0) {
            if (!this.dragging) {
                // inertia / decay.
                this.dragVel.set(0, 0);
                this.dragVelEased.lerp(this.dragVel, clamp(this.dragVelDecay * timeDeltaScale, 0.0, 1.0));
                if (this.dragVelEased.length() < 0.0005) {
                    this.dragVelEased.set(0, 0);
                }
            }
        }

        const rotationXLimit = Math.PI * 0.5;
        this.dragRot.x += this.dragVelEased.y; // change in Y pointer movement, rotates the content around the X axis.
        this.dragRot.y += this.dragVelEased.x; // change in X pointer movement, rotates the content around the Y axis.
        this.dragRot.x = clamp(this.dragRot.x, -rotationXLimit, rotationXLimit);
        this.dragRotEuler.set(this.dragRot.x, this.dragRot.y, 0, 'XYZ');
        this.cubeRotation.setFromEuler(this.dragRotEuler);

        this.dragRotQuat.setFromEuler(this.dragRotEuler);
        this.dragRotQuat.premultiply(this.dragRotQuatInit);

        // this.dragRotAxisX.set(1, 0, 0);
        // this.dragRotAxisX.applyQuaternion( this.cameraQuat );
        // this.dragRotQuatY.setFromAxisAngle( this.dragRotAxisX, this.dragRot.x ); // rotation around X.
        // this.dragRotQuatX.setFromAxisAngle( new THREE.Vector3(0, 1, 0), this.dragRot.y ); // rotation around Y.
        // this.dragRotQuatXY.copy( this.dragRotQuatX ).multiply( this.dragRotQuatY );
        // this.dragRotQuat.copy( this.dragRotQuatInit );
        // this.dragRotQuat.premultiply( this.dragRotQuatXY );

        // this.dragRotAxisX.set(1, 0, 0);
        // this.dragRotAxisX.applyQuaternion( this.cameraQuat );
        // this.dragRotQuatX.setFromAxisAngle( new THREE.Vector3(0, 1, 0), this.dragVelEased.x ); // rotation around Y.
        // this.dragRotQuatY.setFromAxisAngle( this.dragRotAxisX, this.dragVelEased.y ); // rotation around X.
        // this.dragRotQuatXY.copy( this.dragRotQuatX ).multiply( this.dragRotQuatY );
        // this.dragRotQuat.premultiply( this.dragRotQuatXY );

        //------------------------------------------------------------ Scaling.
        if (this.pinchScaling) {
            const dist0 = this.pinchPos0.distanceTo(this.pinchPos1);
            const dist1 = pointer0.pinchPos.distanceTo(pointer1.pinchPos);
            this.pinchScaleDiff = (dist1 - dist0) * this.pinchScaleSensitivity;
            if (!this.enablePinchScale) {
                this.pinchScaleDiff = 0; // disable scale.
            }
            let pinchStop = false;
            pinchStop = pinchStop || pointer0.up;
            pinchStop = pinchStop || pointer1.up;
            if (pinchStop) {
                this.emitter.emit('pinch-stop');
                this.pinchScaling = false;
                this.pinchScale = clamp(this.pinchScale + this.pinchScaleDiff, this.pinchScaleMin, this.pinchScaleMax);
                this.pinchScaleDiff = 0;
            }
        } else {
            let pinchStart = false;
            if (pointer1) {
                pinchStart = true;
                pinchStart = pinchStart && pointer1.down; // second poiter is down.
                pinchStart = pinchStart && !pointer0.up; // also, check first pointer was not released at the same time.
                if (pinchStart && this.pinchScaleOnHit) {
                    // test to first check if object is hit before doing pinch scaling.
                    pinchStart = pointer0.hit && pointer1.hit;
                }
            }
            if (pinchStart) {
                this.emitter.emit('pinch-start');
                this.pinchScaling = true;
                this.pinchPos0.copy(pointer0.pinchPos);
                this.pinchPos1.copy(pointer1.pinchPos);
            }
        }

        const pinchScaleNew = clamp(this.pinchScale + this.pinchScaleDiff, this.pinchScaleMin, this.pinchScaleMax);
        this.pinchScaleEased += (pinchScaleNew - this.pinchScaleEased) * clamp(0.1 * timeDeltaScale, 0.0, 1.0);
        this.cubeScale.set(this.pinchScaleEased, this.pinchScaleEased, this.pinchScaleEased);

        //------------------------------------------------------------ Panning.
        this.updatePinchPanClamp();

        if (this.pinchPanning) {
            this.pinchMid1.copy(pointer1.pinchPos).sub(pointer0.pinchPos).multiplyScalar(0.5).add(pointer0.pinchPos); // mid point.
            this.pinchPanDiff.copy(this.pinchMid1).sub(this.pinchMid0); // displacement of mid-poit from original.
            this.pinchPanDiff
                .multiply(this.pinchPanAxisDir)
                .multiply(this.pinchPanFreedom)
                .multiplyScalar(this.pinchPanSensitivity);
            if (!this.enablePinchPan) {
                this.pinchPanDiff.set(0, 0, 0); // disable pan.
            }
            let pinchStop = false;
            pinchStop = pinchStop || pointer0.up;
            pinchStop = pinchStop || pointer1.up;
            if (pinchStop) {
                this.pinchPanning = false;
                this.pinchPan.add(this.pinchPanDiff);
                this.pinchPan.y = clamp(this.pinchPan.y, this.pinchPanClampMinY, this.pinchPanClampMaxY);
                this.pinchPanDiff.set(0, 0, 0);
            }
        } else {
            let pinchStart = false;
            if (pointer1) {
                pinchStart = true;
                pinchStart = pinchStart && pointer1.down; // second poiter is down.
                pinchStart = pinchStart && !pointer0.up; // also, check first pointer was not released at the same time.
                if (pinchStart && this.pinchPanOnHit) {
                    // test to first check if object is hit before doing pinch panning.
                    pinchStart = pointer0.hit && pointer1.hit;
                }
            }
            if (pinchStart) {
                this.pinchPanning = true;
                this.pinchMid0
                    .copy(pointer1.pinchPos)
                    .sub(pointer0.pinchPos)
                    .multiplyScalar(0.5)
                    .add(pointer0.pinchPos); // mid point.
            }
        }

        this.pinchPanNew.copy(this.pinchPan).add(this.pinchPanDiff);
        this.pinchPanNew.y = clamp(this.pinchPanNew.y, this.pinchPanClampMinY, this.pinchPanClampMaxY);
        this.pinchPanEased.lerp(this.pinchPanNew, clamp(0.1 * timeDeltaScale, 0.0, 1.0));

        this.contentContainer.position.copy(this.cubePosition);
        this.contentContainer.quaternion.copy(this.cubeRotation);
        this.contentContainer.scale.copy(this.cubeScale);
        this.contentContainer.updateMatrixWorld(true);

        this.cubeProxy.container.position.copy(this.cubePosition);
        this.cubeProxy.container.quaternion.copy(this.cubeRotation);
        this.cubeProxy.container.scale.copy(this.cubeScale);
        this.cubeProxy.container.updateMatrixWorld(true);

        this.updateEnd();
    }

    updatePinchPanClamp() {
        this.pinchPanClampMinY = 0;
        this.pinchPanClampMaxY = 0;
    }

    updateEnd() {
        for (let i = 0; i < this.pointers.length; i++) {
            const pointer = this.pointers[i];
            pointer.down = false; // reset down state.
            if (pointer.up) {
                this.pointers.splice(i, 1);
                --i;
            }
        }
    }

    pointersResolve() {
        const eventsDebug = false;
        if (eventsDebug) {
            const eventsDownUp = this.events.filter((event) => event.type === 'down' || event.type === 'up');
            if (eventsDownUp.length > 0) {
                console.log('----------------');
                for (let i = 0; i < eventsDownUp.length; i++) {
                    console.log(eventsDownUp[i].type + ' (' + eventsDownUp[i].pointerId + ')');
                }
            }
        }

        // ASSUMPTION: pointer events always come in the order: Down -> Move -> Up
        while (this.events.length > 0) {
            const event = this.events.shift();
            if (event.type === 'down') {
                let pointer = this.pointers.find((pointer) => pointer.pointerId === event.pointerId);
                if (pointer) {
                    // WEIRD EDGE CASE!
                    // Common issue in JavaScript event handling, particularly with touch events on mobile devices.
                    // When a breakpoint is triggered during debugging, especially in the middle of a touch event sequence, it can disrupt the normal flow of event firing.
                    // This can cause the pointerup event not to fire as expected if you release your finger from the screen while paused at a breakpoint.
                    // ----
                    // SOLUTION:
                    // check if pointer already exists, if it does, update it without setting the down flag.
                    // this is effectively the same as a move update event.
                    this.pointerUpdate(pointer, event);
                } else {
                    pointer = {
                        pointerId: event.pointerId,
                        dragPos: new THREE.Vector3(0, 0, 0),
                        pinchPos: new THREE.Vector3(0, 0, 0),
                        down: true,
                        up: false,
                        hit: false, // if hitting the object.
                    };
                    this.pointers.push(pointer);
                    this.pointerUpdate(pointer, event);
                }
            } else if (event.type === 'move') {
                const pointer = this.pointers.find((pointer) => pointer.pointerId === event.pointerId);
                if (pointer) {
                    this.pointerUpdate(pointer, event);
                }
            } else if (event.type === 'up') {
                const pointer = this.pointers.find((pointer) => pointer.pointerId === event.pointerId);
                if (pointer) {
                    if (pointer.down) {
                        // its possible that a down and up pointer events happen on the same frame.
                        // if they do, this is a non event and the pointer is removed.
                        const pointerIndex = this.pointers.findIndex(
                            (pointer2) => pointer.pointerId === pointer2.pointerId,
                        );
                        this.pointers.splice(pointerIndex, 1);
                        continue;
                    }
                    pointer.up = true;
                    this.pointerUpdate(pointer, event);
                }
            }
        }
    }

    pointerUpdate(pointer, event) {
        // override.
        // rect fill window.
        const dimMax = Math.max(window.innerWidth, window.innerHeight);
        const p0x = (window.innerWidth - dimMax) * 0.5;
        const p0y = (window.innerHeight - dimMax) * 0.5;
        const p1x = p0x + dimMax;
        const p1y = p0y + dimMax;
        //
        pointer.dragPos.x = map(p0x, p1x, 0.0, 1.0, event.pointerX); // normalised.
        pointer.dragPos.y = map(p0y, p1y, 0.0, 1.0, event.pointerY); // normalised.

        pointer.pinchPos.x = map(p0x, p1x, 0.0, 1.0, event.pointerX); // normalised.
        pointer.pinchPos.y = map(p0y, p1y, 0.0, 1.0, event.pointerY); // normalised.
        //
        // pointer.posScreen.x = (event.clientX / window.innerWidth) * 2 - 1;
        // pointer.posScreen.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    pointerMoveHandler(event) {
        this.events.push({
            type: 'move',
            pointerId: event.pointerId,
            pointerX: event.clientX,
            pointerY: event.clientY,
            pointerZ: 0,
        });
    }

    pointerDownHandler(event) {
        this.events.push({
            type: 'down',
            pointerId: event.pointerId,
            pointerX: event.clientX,
            pointerY: event.clientY,
            pointerZ: 0,
        });
    }
    pointerUpHandler(event) {
        this.events.push({
            type: 'up',
            pointerId: event.pointerId,
            pointerX: event.clientX,
            pointerY: event.clientY,
            pointerZ: 0,
        });
    }

    isComplete() {
        return false;
    }
}
export { EJAppImmersiveARControls };
