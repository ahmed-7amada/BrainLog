/**
 * WatermelonDB Database Instance
 * Configures SQLite adapter for offline-first storage
 */

import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {schema} from './schema';
// import models from './models'; // Will be created later

const adapter = new SQLiteAdapter({
  schema,
  // migrations, // Will be added when schema changes
  jsi: true, // Use JSI for better performance
  onSetUpError: (error: Error) => {
    console.error('[WatermelonDB] Setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [],  // Will be populated after models are created
});
