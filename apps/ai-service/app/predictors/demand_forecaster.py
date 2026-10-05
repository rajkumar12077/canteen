from datetime import datetime, timedelta
from typing import List
from app.models.schemas import DemandForecastRequest, DemandForecastResponse, DemandForecastItem
from app.fallback.deterministic_rules import calculate_peak_rush_level

def forecast_demand(req: DemandForecastRequest) -> DemandForecastResponse:
    now = datetime.now()
    items: List[DemandForecastItem] = []
    
    slots_count = 6
    if req.timeHorizon == "30_MIN":
        slots_count = 3
        slot_delta = timedelta(minutes=10)
    elif req.timeHorizon == "1_HOUR":
        slots_count = 4
        slot_delta = timedelta(minutes=15)
    elif req.timeHorizon == "3_HOURS":
        slots_count = 6
        slot_delta = timedelta(minutes=30)
    else: # NEXT_DAY
        slots_count = 12
        slot_delta = timedelta(hours=1)

    peak_alert = None
    max_rush = "LOW"

    for i in range(1, slots_count + 1):
        slot_time = now + (slot_delta * i)
        slot_hour = slot_time.hour
        time_str = slot_time.strftime("%I:%M %p")

        # Demand profile curve (Lunch peak around 12-14, evening snacks around 17-18)
        base_demand = req.historicalHourlyAverage or 24.0
        if 12 <= slot_hour <= 14:
            multiplier = 2.4
            rush = "HIGH" if slot_hour != 13 else "CRITICAL"
            staff = 6
        elif 8 <= slot_hour <= 10:
            multiplier = 1.6
            rush = "MEDIUM"
            staff = 4
        elif 16 <= slot_hour <= 18:
            multiplier = 1.8
            rush = "HIGH"
            staff = 5
        elif 19 <= slot_hour <= 21:
            multiplier = 1.2
            rush = "MEDIUM"
            staff = 3
        else:
            multiplier = 0.5
            rush = "LOW"
            staff = 2

        pred_orders = int(round((base_demand / (60 / (slot_delta.seconds / 60))) * multiplier))
        pred_orders = max(2, pred_orders)
        pred_rev = round(pred_orders * 14.5, 2)

        if rush in ["HIGH", "CRITICAL"]:
            max_rush = rush

        items.append(DemandForecastItem(
            timeSlot=time_str,
            predictedOrderCount=pred_orders,
            predictedRevenue=pred_rev,
            rushLevel=rush,
            recommendedStaffing=staff
        ))

    if max_rush in ["HIGH", "CRITICAL"]:
        peak_alert = f"Predicted {max_rush} rush surge incoming within the next {req.timeHorizon.replace('_', ' ').lower()}. Recommend station pre-prep and +2 staff allocation."

    return DemandForecastResponse(
        timeHorizon=req.timeHorizon,
        forecast=items,
        peakAlert=peak_alert,
        confidenceScore=0.91
    )
