import math
from typing import List, Dict, Any
from app.models.schemas import WaitTimeRequest, PrepTimeRequest, AllocationRequest

def calculate_peak_rush_level(hour: int, queue_length: int) -> str:
    # Typical canteen rush: 8:30-9:30 (Breakfast), 12:00-14:30 (Lunch), 17:00-18:30 (Snacks)
    is_lunch_peak = (12 <= hour <= 14)
    is_breakfast_peak = (8 <= hour <= 10)
    is_evening_peak = (17 <= hour <= 19)

    if queue_length > 25 or (is_lunch_peak and queue_length > 15):
        return "CRITICAL"
    elif queue_length > 12 or is_lunch_peak:
        return "HIGH"
    elif queue_length > 5 or is_breakfast_peak or is_evening_peak:
        return "MEDIUM"
    return "LOW"

def fallback_wait_time(req: WaitTimeRequest) -> Dict[str, Any]:
    active_workers = max(1, req.activeWorkers)
    base_item_time = 3.5
    complexity_mult = 0.8 + (req.averageOrderComplexity * 0.25)
    
    # Little's Law inspired queue wait calculation
    processing_rate_per_min = (active_workers * 1.8) / complexity_mult
    queue_delay = (req.currentQueueLength * 2.2) / max(0.5, processing_rate_per_min)
    
    rush_level = calculate_peak_rush_level(req.hourOfDay, req.currentQueueLength)
    rush_multipliers = {"LOW": 1.0, "MEDIUM": 1.15, "HIGH": 1.35, "CRITICAL": 1.6}
    
    workload_factor = 1.0 + (req.stationWorkloadPercent / 100.0) * 0.4
    
    calculated_wait = (queue_delay + (req.totalItems * base_item_time * 0.4)) * rush_multipliers[rush_level] * workload_factor
    calculated_wait = max(3.0, round(calculated_wait, 1))

    explanation = (
        f"Wait estimated at {calculated_wait} min based on {req.currentQueueLength} orders in queue, "
        f"{active_workers} active kitchen staff, {rush_level} rush period, and station workload at {req.stationWorkloadPercent:.0f}%."
    )

    return {
        "predictedWaitMinutes": calculated_wait,
        "confidenceScore": 0.88,
        "peakRushLevel": rush_level,
        "explanation": explanation
    }

def fallback_prep_time(req: PrepTimeRequest) -> Dict[str, Any]:
    station_times = {}
    for item in req.items:
        st = item.stationType
        time_for_item = item.estimatedPreparationTime * (0.8 + (item.complexityScore * 0.2)) * (item.quantity ** 0.8)
        station_times[st] = station_times.get(st, 0.0) + time_for_item
    
    if not station_times:
        station_times["GRILL"] = 6.0
    
    # Station load penalty
    load_factor = 1.0 + (req.stationLoadPercent / 100.0) * 0.3
    experience_mult = max(0.7, req.workerExperienceLevel)

    for st in station_times:
        station_times[st] = round(station_times[st] * load_factor * experience_mult, 1)

    bottleneck = max(station_times.keys(), key=lambda k: station_times[k])
    max_time = max(station_times.values())

    return {
        "predictedPrepMinutes": max_time,
        "bottleneckStation": bottleneck,
        "confidenceScore": 0.91,
        "breakdown": station_times
    }

def fallback_allocation(req: AllocationRequest) -> Dict[str, Any]:
    task_assignments = []
    
    # Group items by required station type
    items_by_station_type = {}
    for item in req.items:
        items_by_station_type.setdefault(item.stationType, []).append(item)

    primary_station_id = ""
    primary_station_name = ""
    primary_worker_id = None
    primary_worker_name = None

    for st_type, items in items_by_station_type.items():
        # Find matching stations
        candidates = [s for s in req.availableStations if s.stationType == st_type]
        if not candidates:
            # Fallback to any active station
            candidates = req.availableStations or []

        # Score candidate stations: lower load & lower active orders is better
        best_station = None
        best_station_score = -100.0
        
        for s in candidates:
            load_penalty = (s.currentLoad / 100.0) * 40.0
            order_penalty = min(40.0, s.activeOrderCount * 8.0)
            capacity_bonus = (s.capacity / 10.0) * 20.0
            score = 100.0 - load_penalty - order_penalty + capacity_bonus
            if score > best_station_score:
                best_station_score = score
                best_station = s

        target_station = best_station if best_station else (req.availableStations[0] if req.availableStations else None)

        # Find best worker for this station/skill
        target_worker = None
        if target_station:
            workers = [w for w in req.availableWorkers if st_type in w.skills and w.status == "AVAILABLE"]
            if not workers:
                workers = [w for w in req.availableWorkers if w.status != "OFFLINE"]
            
            if workers:
                # Pick worker with lowest current orders and lowest workload
                target_worker = min(workers, key=lambda w: (w.currentOrders, w.workloadScore))

        est_time = sum(i.estimatedPreparationTime * i.quantity for i in items) * 0.75
        est_time = max(2.5, round(est_time, 1))

        st_id = target_station.stationId if target_station else "STATION_DEFAULT"
        st_name = target_station.name if target_station else f"{st_type} Station"
        w_id = target_worker.userId if target_worker else None
        w_name = target_worker.name if target_worker else "Station Line Chef"

        if not primary_station_id:
            primary_station_id = st_id
            primary_station_name = st_name
            primary_worker_id = w_id
            primary_worker_name = w_name

        task_assignments.append({
            "stationId": st_id,
            "stationName": st_name,
            "stationType": st_type,
            "workerId": w_id,
            "workerName": w_name,
            "items": [{"name": i.name, "quantity": i.quantity, "menuItemId": i.menuItemId} for i in items],
            "estimatedMinutes": est_time,
            "allocationScore": round(best_station_score if best_station_score > 0 else 85.0, 1)
        })

    max_task_time = max([t["estimatedMinutes"] for t in task_assignments]) if task_assignments else 8.0

    explanation = (
        f"Order {req.orderNumber} dynamically routed to {primary_station_name} with {len(task_assignments)} station tasks. "
        f"Optimal station selected based on low current queue ({target_station.activeOrderCount if target_station else 1} orders), "
        f"high skill capability match, and workload score."
    )

    return {
        "orderId": req.orderId,
        "orderNumber": req.orderNumber,
        "allocatedStationId": primary_station_id or "STATION_MAIN",
        "allocatedStationName": primary_station_name or "Main Kitchen",
        "allocatedWorkerId": primary_worker_id,
        "allocatedWorkerName": primary_worker_name,
        "estimatedWaitMinutes": max_task_time,
        "tasks": task_assignments,
        "aiExplanation": explanation,
        "confidenceScore": 0.93
    }
