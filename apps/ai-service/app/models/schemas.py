from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class OrderItemFeature(BaseModel):
    menuItemId: str
    name: str
    quantity: int
    complexityScore: int = 2
    estimatedPreparationTime: float = 5.0
    stationType: str = "GRILL"

class WaitTimeRequest(BaseModel):
    currentQueueLength: int = 0
    activeOrders: int = 0
    totalItems: int = 1
    averageOrderComplexity: float = 2.0
    activeWorkers: int = 3
    stationWorkloadPercent: float = 30.0
    hourOfDay: int = 12
    dayOfWeek: int = 1
    items: Optional[List[OrderItemFeature]] = None

class WaitTimeResponse(BaseModel):
    predictedWaitMinutes: float
    confidenceScore: float
    peakRushLevel: str
    explanation: str

class PrepTimeRequest(BaseModel):
    items: List[OrderItemFeature]
    stationType: str = "GRILL"
    workerExperienceLevel: float = 1.0  # 0.8 = expert, 1.0 = average, 1.2 = novice
    stationLoadPercent: float = 40.0

class PrepTimeResponse(BaseModel):
    predictedPrepMinutes: float
    bottleneckStation: str
    confidenceScore: float
    breakdown: Dict[str, float]

class DemandForecastRequest(BaseModel):
    canteenId: str
    timeHorizon: str = "3_HOURS" # "30_MIN", "1_HOUR", "3_HOURS", "NEXT_DAY"
    historicalHourlyAverage: Optional[float] = 25.0

class DemandForecastItem(BaseModel):
    timeSlot: str
    predictedOrderCount: int
    predictedRevenue: float
    rushLevel: str
    recommendedStaffing: int

class DemandForecastResponse(BaseModel):
    timeHorizon: str
    forecast: List[DemandForecastItem]
    peakAlert: Optional[str] = None
    confidenceScore: float

class StationCandidate(BaseModel):
    stationId: str
    name: str
    stationType: str
    capacity: int
    currentLoad: int
    activeOrderCount: int
    assignedWorkers: List[str]

class WorkerCandidate(BaseModel):
    userId: str
    name: str
    skills: List[str]
    currentOrders: int
    workloadScore: float
    status: str

class AllocationRequest(BaseModel):
    orderId: str
    orderNumber: str
    priority: str = "NORMAL"
    items: List[OrderItemFeature]
    availableStations: List[StationCandidate]
    availableWorkers: List[WorkerCandidate]

class AllocationTaskAssignment(BaseModel):
    stationId: str
    stationName: str
    stationType: str
    workerId: Optional[str]
    workerName: Optional[str]
    items: List[Dict[str, Any]]
    estimatedMinutes: float
    allocationScore: float

class AllocationResponse(BaseModel):
    orderId: str
    orderNumber: str
    allocatedStationId: str
    allocatedStationName: str
    allocatedWorkerId: Optional[str]
    allocatedWorkerName: Optional[str]
    estimatedWaitMinutes: float
    tasks: List[AllocationTaskAssignment]
    aiExplanation: str
    confidenceScore: float
