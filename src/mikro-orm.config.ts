import { defineConfig } from '@mikro-orm/mysql';
import * as process from 'process';

export default defineConfig({
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  migrations: {
    path: 'dist/database/migrations',
    pathTs: 'database/migrations',
  },
  seeder: {
    path: 'dist/database/seeders',
    pathTs: 'database/seeders',
  },
});
