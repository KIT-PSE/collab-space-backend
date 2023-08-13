import { defineConfig } from '@mikro-orm/mysql';
import * as process from 'process';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * MikroORM configuration object for MySQL.
 */
export default defineConfig({
  // Database connection parameters
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,

  // Entity paths for JavaScript and TypeScript files
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],

  // Metadata provider using TsMorph
  metadataProvider: TsMorphMetadataProvider,

  // Migration paths for JavaScript and TypeScript files
  migrations: {
    path: 'dist/database/migrations',
    pathTs: 'database/migrations',
  },

  // Seeder paths for JavaScript and TypeScript files
  seeder: {
    path: 'dist/database/seeders',
    pathTs: 'database/seeders',
  },
});
