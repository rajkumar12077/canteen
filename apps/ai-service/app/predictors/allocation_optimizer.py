from app.models.schemas import AllocationRequest, AllocationResponse
from app.fallback.deterministic_rules import fallback_allocation

def optimize_allocation(req: AllocationRequest) -> AllocationResponse:
    res = fallback_allocation(req)
    return AllocationResponse(**res)
