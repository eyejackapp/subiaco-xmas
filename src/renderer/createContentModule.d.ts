import { ContentModule } from "./libs/ejx.es";

/**
 * This generates a content module (same as app.js) from a given app.json path.
 * This is necessary because vite doesn't play well with dynamic imports of static js files.
 *
 * @param {string} ejxJsonPath Path to the EJX Content
 * @returns {ContentModule}
 */
export function createContentModule(): Promise<ContentModule>;
