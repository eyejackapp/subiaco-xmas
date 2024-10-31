/**
 * Wrapper around indexed db to provide a promise based api for saving and loading stuff from 
 * indexeddb.
 */
export default class LocalKV {
    private db?: IDBDatabase;

    constructor(
        private name: string,
        private storeName: string,
        private version: number,
    ) {}

    async get(key: string) {
        const db = await this.getDb();
        const trans = db.transaction(this.storeName, 'readonly');
        const getRequest = trans.objectStore(this.storeName).get(key);
        const result = await LocalKV.wrapIDBRequest(getRequest);
        return result;
    }

    async set(key: string, data: unknown) {
        const db = await this.getDb();
        const trans = db.transaction(this.storeName, 'readwrite');
        const getRequest = trans.objectStore(this.storeName).put(data, key);
        const result = await LocalKV.wrapIDBRequest(getRequest);
        return result;
    }
    async delete(key: string) {
        const db = await this.getDb();
        const trans = db.transaction(this.storeName, 'readwrite');
        const getRequest = trans.objectStore(this.storeName).delete(key);
        const result = await LocalKV.wrapIDBRequest(getRequest);
        return result;
    }

    async getAllKeys() {
        const db = await this.getDb();
        const trans = db.transaction(this.storeName, 'readwrite');
        const getRequest = trans.objectStore(this.storeName).getAllKeys();
        const result = await LocalKV.wrapIDBRequest(getRequest);
        return result;
    }

    openPromise?: Promise<IDBDatabase>;
    private async getDb() {
        if (this.db) return this.db;

        if (this.openPromise) return await this.openPromise;

        const openPromise = this.openDb();
        this.openPromise = openPromise;

        return await this.openPromise;
    }

    private openDb() {
        return new Promise<IDBDatabase>((res, rej) => {
            const request = window.indexedDB.open(this.name, this.version);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (db.objectStoreNames.contains(this.storeName) === false) {
                    db.createObjectStore(this.storeName);
                }
            };

            request.onsuccess = () => {
                res(request.result);
            };

            request.onerror = () => {
                rej(request.error);
            };
        });
    }

    private static wrapIDBRequest(request: IDBRequest): Promise<unknown> {
        return new Promise((res, rej) => {
            request.onsuccess = () => {
                res(request.result);
            };
            request.onerror = () => {
                rej(request.error!);
            };
        });
    }
}
