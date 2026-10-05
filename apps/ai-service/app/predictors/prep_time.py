import os
import joblib
import pandas as pd
from app.models.schemas import PrepTimeRequest, PrepTimeResponse
from app.fallback.deterministic_rules import fallback_prep_time

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "prep_time_model.joblib")
_model = None

def get_prep_model():
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"[AI Service] Error loading prep model: {e}")
            _model = None
    return _model

def predict_prep_time(req: PrepTimeRequest) -> PrepTimeResponse:
    model = get_prep_model()
    is_peak = 1 if req.stationLoadPercent > 65.0 else 0

    station_times = {}
    for item in req.items:
        st = item.stationType
        if model is not None:
            try:
                features = pd.DataFrame([{
                    "complexity": item.complexityScore,
                    "quantity": item.quantity,
                    "workload_percent": req.stationLoadPercent,
                    "worker_experience": req.workerExperienceLevel,
                    "is_peak": is_peak
                }])
                pred = float(model.predict(features)[0])
            except Exception:
                pred = item.estimatedPreparationTime * (item.quantity ** 0.7)
        else:
            pred = item.estimatedPreparationTime * (item.quantity ** 0.7) * (0.8 + item.complexityScore * 0.2)

        station_times[st] = station_times.get(st, 0.0) + round(pred, 1)

    if not station_times:
        station_times["GRILL"] = 5.0

    bottleneck = max(station_times.keys(), key=lambda k: station_times[k])
    max_time = max(station_times.values())

    return PrepTimeResponse(
        predictedPrepMinutes=round(max_time, 1),
        bottleneckStation=bottleneck,
        confidenceScore=0.92,
        breakdown=station_times
    )
