const axios = require('axios');

console.log('================================================================');
console.log('  ⚡ SMART CANTEEN REAL-TIME TRAFFIC & QUEUE SIMULATOR ENGINE   ');
console.log('================================================================\n');

const API_BASE = 'http://localhost:5000/api';

const customers = [
  'Aditi Sen (DevOps)',
  'Rohan Mehta (Frontend Lead)',
  'Sneha Kulkarni (Product Mgr)',
  'Farhan Akhtar (Security Eng)',
  'Divya Raman (Data Science)',
  'Naveen Paul (Cloud Arch)'
];

const itemsPool = [
  'ITEM-DOSA',
  'ITEM-BURGER',
  'ITEM-COFFEE',
  'ITEM-FRIES',
  'ITEM-IDLI',
  'ITEM-PANEER-ROLL'
];

async function runSimulation() {
  console.log('[Simulator] Connecting to Canteen API at ' + API_BASE);
  let orderCount = 0;

  const interval = setInterval(async () => {
    orderCount++;
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const selectedItem = itemsPool[Math.floor(Math.random() * itemsPool.length)];
    const qty = Math.random() > 0.6 ? 2 : 1;

    try {
      const payload = {
        canteenId: 'CANTEEN-01',
        customerName: customer,
        items: [{ menuItemId: selectedItem, quantity: qty }],
        orderType: Math.random() > 0.4 ? 'COUNTER_PICKUP' : 'OFFICE_DELIVERY',
        deliveryAddress: 'Campus Tower A, Floor 3',
        paymentMethod: 'MOCK_UPI'
      };

      const res = await axios.post(`${API_BASE}/orders`, payload, {
        headers: { 'x-demo-role': 'CUSTOMER' }
      });
      const order = res.data.order;
      console.log(`[Simulator] (${orderCount}) Generated Order #${order.tokenNumber} for ${customer} -> Station: ${order.assignedStation}, Predicted Wait: ${order.predictedWaitTime} min`);
    } catch (err) {
      console.error(`[Simulator] Error generating order:`, err.message);
    }

    if (orderCount >= 10) {
      console.log('\n[Simulator] Completed batch simulation of 10 dynamic orders. Stopping simulator.');
      clearInterval(interval);
      process.exit(0);
    }
  }, 2000);
}

runSimulation();
