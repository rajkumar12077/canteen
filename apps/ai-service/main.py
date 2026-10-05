import os
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.models.schemas import (
    WaitTimeRequest, WaitTimeResponse,
    PrepTimeRequest, PrepTimeResponse,
    DemandForecastRequest, DemandForecastResponse,
    AllocationRequest, AllocationResponse
)
from app.predictors.wait_time import predict_wait_time
from app.predictors.prep_time import predict_prep_time
from app.predictors.demand_forecaster import forecast_demand
from app.predictors.allocation_optimizer import optimize_allocation

app = FastAPI(
    title="Smart Canteen AI Operations & Queue Intelligence Service",
    description="Microservice for Queue Wait Time Prediction, Preparation Duration, Demand Forecasting, and Dynamic Station Allocation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "Smart Canteen AI Intelligence Microservice",
        "status": "ONLINE",
        "version": "1.0.0",
        "endpoints": [
            "/predict/wait-time",
            "/predict/preparation-time",
            "/predict/demand",
            "/predict/allocation",
            "/api/recommendations",
            "/health"
        ]
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ai-service",
        "modelsLoaded": True
    }

@app.post("/predict/wait-time", response_model=WaitTimeResponse)
def handle_wait_time(req: WaitTimeRequest):
    return predict_wait_time(req)

@app.post("/predict/preparation-time", response_model=PrepTimeResponse)
def handle_prep_time(req: PrepTimeRequest):
    return predict_prep_time(req)

@app.post("/predict/demand", response_model=DemandForecastResponse)
def handle_demand(req: DemandForecastRequest):
    return forecast_demand(req)

@app.post("/predict/allocation", response_model=AllocationResponse)
def handle_allocation(req: AllocationRequest):
    return optimize_allocation(req)

@app.get("/api/recommendations")
def get_recommendations():
    return [
        {
            "id": "REC-01",
            "type": "DEMAND_PREPARATION",
            "title": "Lunch Rush Surge Approaching",
            "description": "Historical pattern indicates a 140% surge in South Indian & Grill items between 12:30 PM and 1:30 PM.",
            "impact": "Reduces queue wait time by 32%",
            "confidenceScore": 0.94,
            "suggestedAction": "Pre-heat Grill Station 2 and batch-prepare 25 Dosa batter portions.",
            "status": "PENDING",
            "timestamp": "Just now"
        },
        {
            "id": "REC-02",
            "type": "KITCHEN_REALLOCATION",
            "title": "Grill Station Bottleneck Alert",
            "description": "Grill station load is reaching 85% capacity with 6 active orders queued.",
            "impact": "Prevents 8-minute SLA breach for 4 orders",
            "confidenceScore": 0.89,
            "suggestedAction": "Reassign Line Cook Rahul Verma from Packing to Grill Station.",
            "status": "PENDING",
            "timestamp": "5 min ago"
        },
        {
            "id": "REC-03",
            "type": "INVENTORY_REORDER",
            "title": "Sambar Onion Stock Low Threshold",
            "description": "Current stock is at 3.5 kg. Projected daily consumption will exhaust stock before 4:00 PM.",
            "impact": "Avoids menu item stockout during peak service",
            "confidenceScore": 0.96,
            "suggestedAction": "Trigger emergency purchase order to Daily Fresh Produce supplier.",
            "status": "PENDING",
            "timestamp": "12 min ago"
        }
    ]

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
