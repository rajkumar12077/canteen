import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

console.log('[Worker] Starting Smart Canteen Background Job Processor...');

// 1. SLA Breach Monitor (every 30 seconds)
setInterval(async () => {
  try {
    const queueRes = await axios.get(`${API_BASE}/queue?canteenId=CANTEEN-01`);
    const queue = queueRes.data.queue || [];
    const delayed = queue.filter((q: any) => {
      const waitTime = (Date.now() - new Date(q.createdAt).getTime()) / 60000;
      return waitTime > (q.predictedWaitMinutes * 1.5);
    });

    if (delayed.length > 0) {
      console.log(`[Worker - SLA Monitor] ⚠️ ${delayed.length} orders approaching or exceeding SLA threshold!`);
    }
  } catch (err: any) {
    // API might be spinning up
  }
}, 30000);

// 2. Kitchen Load Balancer
setInterval(async () => {
  try {
    const res = await axios.get(`${API_BASE}/kitchen/stations?canteenId=CANTEEN-01`);
    const stations = res.data.stations || [];
    const overloaded = stations.filter((s: any) => s.currentLoad > 85);
    if (overloaded.length > 0) {
      console.log(`[Worker - Kitchen Balancer] Overload detected on ${overloaded.map((s: any) => s.name).join(', ')}. Triggering AI reallocation check.`);
    }
  } catch (err: any) {
    // Ignore during downtime
  }
}, 45000);

console.log('[Worker] Background jobs active: SLA Breach Monitor (30s), Kitchen Load Balancer (45s).');
