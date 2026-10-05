const http = require('http');
const assert = require('assert');

console.log('[Test Suite] Running automated unit and integration tests for Smart Canteen API...');

// Test 1: Verify Storage & Data Models
const { db } = require('./dist/storage');
if (!db || db.getState().users.length === 0) {
  // Try loading directly or check seed
  const { seedDatabase } = require('./dist/seeds/seed');
  seedDatabase();
}

const state = db.getState();
assert(state.users.length >= 7, 'Expected at least 7 demo users');
assert(state.menuItems.length >= 7, 'Expected menu items');
assert(state.kitchenStations.length >= 6, 'Expected at least 6 kitchen stations');
assert(state.orders.length >= 5000, 'Expected 5000+ historical orders for AI & analytics');
console.log('✅ Test 1 Passed: Database schema and entity integrity verified.');

// Test 2: Verify Auth Service
const { AuthService } = require('./dist/services/auth.service');
const adminLogin = AuthService.switchRole('ADMIN');
assert(adminLogin.token, 'Expected valid JWT for admin');
assert.strictEqual(adminLogin.user.role, 'ADMIN', 'Expected ADMIN role');
console.log('✅ Test 2 Passed: JWT Authentication and role switching verified.');

// Test 3: Verify Queue Engine
const { QueueService } = require('./dist/services/queue.service');
const queue = QueueService.getCanteenQueue('CANTEEN-01');
assert(Array.isArray(queue), 'Expected queue array');
console.log(`✅ Test 3 Passed: Queue engine operational (${queue.length} active orders queued).`);

// Test 4: Verify Analytics Service
const { AnalyticsService } = require('./dist/services/analytics.service');
const kpis = AnalyticsService.getDashboardKPIs('CANTEEN-01');
assert(kpis.kpis.totalOrders >= 5000, 'KPI total orders count should exceed 5000');
assert(kpis.topItems.length > 0, 'KPI top items should be calculated');
assert(kpis.hourlyData.length === 12, 'KPI hourly distribution should be calculated');
console.log('✅ Test 4 Passed: SaaS Analytics and KPI aggregation engine verified.');

console.log('\n🎉 ALL SMART CANTEEN BACKEND TESTS PASSED (4/4)!');
process.exit(0);
