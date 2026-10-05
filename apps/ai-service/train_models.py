import os
import random
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib

def generate_synthetic_dataset(num_records=12000):
    print(f"[AI Training] Generating {num_records} realistic historical records...")
    stations = ["GRILL", "FRY", "BEVERAGE", "SOUTH_INDIAN", "NORTH_INDIAN", "BAKERY", "PACKING"]
    items = [
        {"name": "Masala Dosa", "station": "SOUTH_INDIAN", "complexity": 3, "base_prep": 6.0},
        {"name": "Idli Sambar", "station": "SOUTH_INDIAN", "complexity": 1, "base_prep": 3.0},
        {"name": "Crispy Veg Burger", "station": "GRILL", "complexity": 3, "base_prep": 7.0},
        {"name": "Paneer Tikka Roll", "station": "NORTH_INDIAN", "complexity": 4, "base_prep": 9.0},
        {"name": "Cold Brew Coffee", "station": "BEVERAGE", "complexity": 1, "base_prep": 2.5},
        {"name": "Peri Peri French Fries", "station": "FRY", "complexity": 2, "base_prep": 4.5},
        {"name": "Butter Croissant", "station": "BAKERY", "complexity": 1, "base_prep": 2.0},
        {"name": "Chole Bhature", "station": "NORTH_INDIAN", "complexity": 4, "base_prep": 8.5},
        {"name": "Fresh Orange Juice", "station": "BEVERAGE", "complexity": 1, "base_prep": 3.0},
        {"name": "Club Sandwich", "station": "GRILL", "complexity": 2, "base_prep": 5.0}
    ]

    records = []
    for i in range(num_records):
        hour = random.choices(
            population=list(range(7, 22)),
            weights=[2, 8, 12, 5, 14, 25, 20, 6, 8, 15, 12, 8, 4, 2, 1] # Breakfast & Lunch & Evening peaks
        )[0]
        weekday = random.randint(0, 6) # 0=Monday, 6=Sunday
        month = random.randint(1, 12)
        
        selected_item = random.choice(items)
        quantity = random.choices([1, 2, 3, 4, 5], weights=[60, 25, 10, 3, 2])[0]
        
        # Peak indicator
        is_peak = 1 if (8 <= hour <= 10 or 12 <= hour <= 14 or 17 <= hour <= 19) else 0
        
        # Staffing level (higher during peak, but sometimes short-staffed)
        staffing_level = random.randint(2, 6) if is_peak else random.randint(1, 4)
        
        # Queue length correlated with hour and staffing
        base_queue = (15 if is_peak else 4) + random.randint(0, 15)
        queue_length = max(0, int(base_queue * (1.2 if weekday < 5 else 0.7) - (staffing_level * 1.5)))
        
        active_orders = queue_length + random.randint(1, 8)
        workload_percent = min(100.0, max(10.0, (active_orders / (staffing_level * 4.0)) * 100.0))
        
        # Worker experience factor (0.8 = fast/expert, 1.2 = novice)
        worker_experience = round(random.uniform(0.8, 1.25), 2)
        
        # Realistic Preparation Duration (minutes)
        # Correlate: item complexity, quantity, station workload, worker experience
        prep_duration = (
            selected_item["base_prep"] * (quantity ** 0.6) * 
            (0.85 + (selected_item["complexity"] * 0.15)) * 
            worker_experience * 
            (1.0 + (workload_percent / 200.0)) + 
            random.uniform(-0.5, 0.8)
        )
        prep_duration = max(1.5, round(prep_duration, 1))
        
        # Waiting Duration (minutes): Little's Law queue delay + prep time
        wait_duration = (
            (queue_length * 1.8) / max(1.0, staffing_level * 0.9) + 
            (prep_duration * 0.6) + 
            (3.0 if is_peak else 0.5) + 
            random.uniform(-1.0, 1.5)
        )
        wait_duration = max(2.5, round(wait_duration, 1))
        
        completion_duration = round(wait_duration + prep_duration + random.uniform(0.5, 1.5), 1)

        records.append({
            "order_id": f"ORD-SYNTH-{i+1:05d}",
            "hour": hour,
            "weekday": weekday,
            "month": month,
            "item_name": selected_item["name"],
            "station": selected_item["station"],
            "complexity": selected_item["complexity"],
            "quantity": quantity,
            "is_peak": is_peak,
            "staffing_level": staffing_level,
            "queue_length": queue_length,
            "active_orders": active_orders,
            "workload_percent": round(workload_percent, 1),
            "worker_experience": worker_experience,
            "prep_duration": prep_duration,
            "wait_duration": wait_duration,
            "completion_duration": completion_duration
        })

    df = pd.DataFrame(records)
    return df

def train_and_save_models():
    os.makedirs("datasets", exist_ok=True)
    os.makedirs("models", exist_ok=True)

    df = generate_synthetic_dataset(12000)
    dataset_path = os.path.join("datasets", "historical_orders.csv")
    df.to_csv(dataset_path, index=False)
    print(f"[AI Training] Saved synthetic dataset to {dataset_path} ({len(df)} rows)")

    # 1. Train Wait Time Regressor
    features_wait = ["hour", "weekday", "queue_length", "active_orders", "workload_percent", "staffing_level", "is_peak", "complexity", "quantity"]
    X_wait = df[features_wait]
    y_wait = df["wait_duration"]

    X_train_w, X_test_w, y_train_w, y_test_w = train_test_split(X_wait, y_wait, test_size=0.2, random_state=42)

    rf_wait = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
    rf_wait.fit(X_train_w, y_train_w)

    preds_w = rf_wait.predict(X_test_w)
    rmse_w = np.sqrt(mean_squared_error(y_test_w, preds_w))
    r2_w = r2_score(y_test_w, preds_w)
    print(f"[AI Training] Wait Time Model -> RMSE: {rmse_w:.2f} min, R2 Score: {r2_w:.3f}")

    joblib.dump(rf_wait, os.path.join("models", "wait_time_model.joblib"))
    print("[AI Training] Saved models/wait_time_model.joblib")

    # 2. Train Preparation Time Regressor
    features_prep = ["complexity", "quantity", "workload_percent", "worker_experience", "is_peak"]
    X_prep = df[features_prep]
    y_prep = df["prep_duration"]

    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_prep, y_prep, test_size=0.2, random_state=42)

    rf_prep = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    rf_prep.fit(X_train_p, y_train_p)

    preds_p = rf_prep.predict(X_test_p)
    rmse_p = np.sqrt(mean_squared_error(y_test_p, preds_p))
    r2_p = r2_score(y_test_p, preds_p)
    print(f"[AI Training] Prep Time Model -> RMSE: {rmse_p:.2f} min, R2 Score: {r2_p:.3f}")

    joblib.dump(rf_prep, os.path.join("models", "prep_time_model.joblib"))
    print("[AI Training] Saved models/prep_time_model.joblib")

    print("[AI Training] Completed model training and artifact export successfully.")

if __name__ == "__main__":
    train_and_save_models()
