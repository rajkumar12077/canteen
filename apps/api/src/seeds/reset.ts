import { seedDatabase } from './seed';

console.log('[Reset] Resetting database to initial state...');
seedDatabase();
console.log('[Reset] Database reset complete.');
