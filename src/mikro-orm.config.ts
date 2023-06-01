import { defineConfig } from '@mikro-orm/mysql';

export default defineConfig({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '12345',
  dbName: 'collab_space',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
});
