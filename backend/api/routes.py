import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import TrainRequest
from services.data_service import preprocess_data
from services.qml_service import train_vqc
from services.classical_service import train_logistic_regression

router = APIRouter()

# In-memory store for datasets to simulate database for uploaded files.
# In production, this would be a DB or S3 reference.
datasets_store = {}

@router.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV: {str(e)}")
    
    # Cap dataset size for performance constraints
    if len(df) > 1000:
        df = df.sample(n=1000, random_state=42)
        
    dataset_id = "ds_" + str(hash(file.filename + str(len(df))))
    datasets_store[dataset_id] = df.to_json()
    
    return {
        "dataset_id": dataset_id,
        "columns": df.columns.tolist(),
        "total_rows": len(df)
    }

@router.post("/train-quantum")
async def train_quantum(req: TrainRequest):
    if req.dataset_id not in datasets_store:
        raise HTTPException(status_code=404, detail="Dataset not found. Please upload again.")
    
    df = pd.read_json(io.StringIO(datasets_store[req.dataset_id]))
    X_train, X_test, y_train, y_test = preprocess_data(df, req.features, req.target)
    
    if X_train.shape[1] > 8:
        raise HTTPException(status_code=400, detail="Maximum 8 features allowed due to qubit simulation limits.")
        
    results = train_vqc(X_train, y_train, X_test, y_test)
    return results

@router.post("/train-classical")
async def train_classical(req: TrainRequest):
    if req.dataset_id not in datasets_store:
        raise HTTPException(status_code=404, detail="Dataset not found. Please upload again.")
    
    df = pd.read_json(io.StringIO(datasets_store[req.dataset_id]))
    X_train, X_test, y_train, y_test = preprocess_data(df, req.features, req.target)
    
    results = train_logistic_regression(X_train, y_train, X_test, y_test)
    return results

@router.get("/results")
async def get_results():
    return {"message": "Use the train endpoints to get immediate results or implement a persistence layer to fetch historical results."}
