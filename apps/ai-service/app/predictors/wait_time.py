import os
import joblib
import pandas as pd
from app.models.schemas import WaitTimeRequest, WaitTimeResponse
from app.fallback.deterministic_rules import fallback_wait_time, calculate_peak_rush_level

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "wait_time_model.joblib")
_model = None

def get_wait_model():
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"[AI Service] Error loading wait model: {e}")
            _model = None
    return _model

def predict_wait_time(req: WaitTimeRequest) -> WaitTimeResponse:
    model = get_wait_model()
    rush_level = calculate_peak_rush_level(req.hourOfDay, req.currentQueueLength)
    is_peak = 1 if rush_level in ["HIGH", "CRITICAL"] else 0

    if model is not None:
        try:
            features = pd.DataFrame([{
                "hour": req.hourOfDay,
                "weekday": req.dayOfWeek,
                "queue_length": req.currentQueueLength,
                "active_orders": req.activeOrders,
                "workload_percent": req.stationWorkloadPercent,
                "staffing_level": max(1, req.activeWorkers),
                "is_peak": is_peak,
                "complexity": req.averageOrderComplexity,
                "quantity": req.totalItems
            }])
            raw_pred = float(model.predict(features)[0])
            pred_wait = max(2.5, round(raw_pred, 1))

            explanation = (
                f"ML model estimated {pred_wait} min wait based on {req.currentQueueLength} orders in queue, "
                f"{req.activeWorkers} active staff, {rush_level} rush state, and station workload at {req.stationWorkloadPercent:.0f}%."
            )
            return WaitTimeResponse(
                predictedWaitMinutes=pred_wait,
                confidenceScore=0.94,
                peakRushLevel=rush_level,
                explanation=explanation
            )
        except Exception as e:
            print(f"[AI Service] Inference exception: {e}, falling back to heuristics")

    fb = fallback_wait_time(req)
    return WaitTimeResponse(
        predictedWaitMinutes=fb["predictedWaitMinutes"],
        confidenceScore=fb["confidenceScore"],
        peakRushLevel=fb["peakRushLevel"],
        explanation=fb["explanation"]
    )
