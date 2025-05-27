/// <reference types="node" />
// front/src/config/vrp.config.ts

import type { VrpConfig } from "./vrp.types";

/**
 * Lit les variables d’env injectées par Vite (doivent commencer par VITE_).
 */
export const vrpConfig: VrpConfig = {
  url:    import.meta.env.VITE_VRP_API_URL  || "",
  apiKey: import.meta.env.VITE_VRP_API_KEY  || "",
};
