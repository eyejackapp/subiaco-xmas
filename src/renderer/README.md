# Renderer

All of the THREE.js and 8thwall related code will exist within here.
The ./index.ts file will export a handle to control the THREE.js and 8thwall
related code.  It is important that we don't share any global state between
the UI and three.js and instead just tell three.js what we want it to do via
this interface.  Similarly we do not want to implement state changes inside the
renderer.  Instead we emit events and let the UI tell the renderer to update state.

Here's an example snippet of three.js code where a state change is handled internally.  This is bad
because the UI part of the app will also make its own state changes and now there's no single place of control.
```typescript
// my-three-code.ts
if (qrCodeFound) {
    const nextArtwork = loadArtwork(qrCodeFound.id);
    this.oldArtwork.dispose();
    this.scene.add(nextArtwork);
}
```

Here's an example snippet where we pass control back up a level so that we can control all the state in a single place.
Ideally we will be able to look at how the UI and the renderer interact by looking at a single file.
```typescript
// my-three-code.ts
if (qrCodeFound) {
    eventEmitter.emit('qr-scan-result', qrCodeFound.id);
}

export function playArtwork(artworkId: string) {
    const nextArtwork = loadArtwork(artworkId.id);
    this.oldArtwork.dispose();
    this.scene.add(nextArtwork);
}

// my-app.ts
function playArtwork(artworkId: string) {
    renderer.playArtwork(artworkId);
    // Can also do stuff here to sync up the state.
}

renderer.eventEmitter.add('qr-scan-result', (artworkId) => {

})
```

