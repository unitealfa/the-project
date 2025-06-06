// back/src/config/vrp.config.ts

import type { VrpConfig } from './vrp.types';

let secret: Partial<VrpConfig> = {};
try {
  // Charge back/src/config/secret/vrp.ts si présent
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  secret = require('./secret/vrp').vrpSecret;
} catch {
  // pas de fichier secret => on se rabat sur process.env
}

export const vrpConfig: VrpConfig = {
  url:    process.env.VRP_API_URL  ?? secret.url  ?? '',
  apiKey: process.env.VRP_API_KEY  ?? secret.apiKey,
};
