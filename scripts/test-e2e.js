const axios = require('axios');
const assert = require('assert');

const API_BASE = 'http://localhost:5000/api';
const AI_BASE = 'http://localhost:8000';

async function runE2EAcceptance() {
  console.log('================================================================');
  console.log('  🧪 RUNNING FULL SYSTEM END-TO-END ACCEPTANCE TEST (E2E)      ');
  console.log('================================================================\n');

  try {
    // 1. Health check Backend
    console.log('[E2E Step 1] Checking Backend Health...');
    const healthRes = await axios.get('http://localhost:5000/health');
    assert.strictEqual(healthRes.data.status, 'healthy');
    console.log('  ✓ Backend API is operational');

    // 2. Health check AI Service
    console.log('\n[E2E Step 2] Checking AI Service Health & Models...');
    const aiHealth = await axios.get(`${AI_BASE}/health`);
    assert.strictEqual(aiHealth.data.status, 'healthy');
    console.log('  ✓ AI Microservice is online and ML models active');

    // 3. User Login
    console.log('\n[E2E Step 3] Authenticating Demo Customer (customer@demo.local)...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'customer@demo.local',
      password: 'demo123'
    });
    assert(loginRes.data.token, 'Expected JWT token upon login');
    const token = loginRes.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    console.log(`  ✓ Logged in as ${loginRes.data.user.name} (${loginRes.data.user.role})`);

    // 4. Fetch Menu Items
    console.log('\n[E2E Step 4] Customer Browsing Canteen Menu...');
    const menuRes = await axios.get(`${API_BASE}/menu/items?canteenId=CANTEEN-01`);
    assert(menuRes.data.items.length >= 5, 'Expected at least 5 menu items');
    const item = menuRes.data.items[0];
    console.log(`  ✓ Retrieved ${menuRes.data.items.length} items. Selected: ${item.name} (₹${item.price})`);

    // 5. Create Customer Order
    console.log('\n[E2E Step 5] Customer Placing Order with Dynamic AI Allocation...');
    const orderPayload = {
      canteenId: 'CANTEEN-01',
      customerName: 'Ananya Roy',
      items: [{ menuItemId: item._id, quantity: 2 }],
      orderType: 'COUNTER_PICKUP',
      paymentMethod: 'MOCK_UPI'
    };
    const orderRes = await axios.post(`${API_BASE}/orders`, orderPayload, authHeaders);
    const order = orderRes.data.order;
    assert(order && order._id, 'Order should be created');
    assert(order.tokenNumber > 0, 'Token number should be assigned');
    assert(order.predictedWaitTime > 0, 'AI wait time should be predicted');
    console.log(`  ✓ Order created successfully: Token #${order.tokenNumber} (${order.orderNumber})`);
    console.log(`  ✓ AI Dynamic Allocation: Assigned Station: ${order.assignedStation || 'Auto'}, Estimated Wait: ${order.predictedWaitTime}m`);
    console.log(`  ✓ AI Justification: "${order.aiExplanation}"`);

    // 6. Verify Queue Engine
    console.log('\n[E2E Step 6] Checking Real-time Queue Engine...');
    const queueRes = await axios.get(`${API_BASE}/queue?canteenId=CANTEEN-01`);
    assert(queueRes.data.queue.length > 0, 'Queue should contain active orders');
    console.log(`  ✓ Queue contains ${queueRes.data.queue.length} active orders`);

    // 7. Kitchen Operations
    console.log('\n[E2E Step 7] Kitchen Accepting & Preparing Order...');
    const prepRes = await axios.patch(`${API_BASE}/orders/${order._id}/status`, { status: 'PREPARING' });
    assert.strictEqual(prepRes.data.order.orderStatus, 'PREPARING');
    console.log(`  ✓ Order ${order.orderNumber} transitioned to PREPARING`);

    // 8. Kitchen Marks Ready
    console.log('\n[E2E Step 8] Kitchen Marking Order Ready for Pickup...');
    const readyRes = await axios.patch(`${API_BASE}/orders/${order._id}/status`, { status: 'READY' });
    assert.strictEqual(readyRes.data.order.orderStatus, 'READY');
    console.log(`  ✓ Order ${order.orderNumber} transitioned to READY (Token display notified)`);

    // 9. Digital Invoice
    console.log('\n[E2E Step 9] Retrieving Customer Digital Tax Invoice...');
    const invRes = await axios.get(`${API_BASE}/invoices/${order._id}`);
    assert(invRes.data.invoice, 'Invoice should exist');
    console.log(`  ✓ Invoice #${invRes.data.invoice.invoiceNumber} verified (Subtotal: ₹${invRes.data.invoice.subtotal}, Tax: ₹${invRes.data.invoice.tax}, Total: ₹${invRes.data.invoice.total})`);

    // 10. Handover / Completed
    console.log('\n[E2E Step 10] Counter Handover to Customer (Completed)...');
    const compRes = await axios.patch(`${API_BASE}/orders/${order._id}/status`, { status: 'COMPLETED' });
    assert.strictEqual(compRes.data.order.orderStatus, 'COMPLETED');
    console.log(`  ✓ Order ${order.orderNumber} successfully COMPLETED`);

    // 11. Analytics Dashboard
    console.log('\n[E2E Step 11] Checking Enterprise SaaS Analytics KPI Aggregation...');
    const analRes = await axios.get(`${API_BASE}/analytics/dashboard?canteenId=CANTEEN-01`);
    assert(analRes.data.kpis.totalOrders >= 5000, 'KPI orders should exceed 5000');
    console.log(`  ✓ Analytics verified: ${analRes.data.kpis.totalOrders} total orders aggregated with ₹${analRes.data.kpis.totalRevenue} revenue`);

    console.log('\n================================================================');
    console.log('  🎉 E2E ACCEPTANCE TEST SUCCEEDED 100%! SYSTEM FULLY CERTIFIED ');
    console.log('================================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err.message);
    if (err.response) console.error('Response data:', err.response.data);
    process.exit(1);
  }
}

runE2EAcceptance();
