from pydantic import BaseModel
from typing import List

class TrainRequest(BaseModel):
    dataset_id: str
    target: str
    features: List[str]
