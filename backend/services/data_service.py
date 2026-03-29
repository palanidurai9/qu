import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from fastapi import HTTPException

def preprocess_data(df: pd.DataFrame, features: list[str], target: str):
    if target not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{target}' not found.")
    
    missing_features = [f for f in features if f not in df.columns]
    if missing_features:
        raise HTTPException(status_code=400, detail=f"Features missing from dataset: {missing_features}")
            
    # Ensure target is not in features to prevent duplicate column selection
    if target in features:
        features.remove(target)
        
    df_filtered = df[features + [target]].dropna()
    if len(df_filtered) == 0:
        raise HTTPException(status_code=400, detail="Dataset is empty after dropping missing values.")
        
    X_df = df_filtered[features].copy()
    
    # Auto-encode text/categorical features gracefully to numeric for QML math
    for col in X_df.columns:
        if X_df[col].dtype == 'object' or X_df[col].dtype == 'string':
            X_df[col] = LabelEncoder().fit_transform(X_df[col].astype(str))
            
    X = X_df.values
    y = df_filtered[target].values
    
    # Flatten y just in case it's 2D due to pandas column referencing anomalies
    y = y.ravel()
    
    # Auto-binarize if more than 2 classes are found (for robust testing)
    unique_classes = set(y)
    if len(unique_classes) == 1:
        raise HTTPException(status_code=400, detail="Target column has only 1 class. Classification requires at least 2.")
    elif len(unique_classes) > 2:
        # Binarize: most frequent class vs the rest
        most_frequent = pd.Series(y).mode()[0]
        y = (y == most_frequent).astype(int)
    else:
        le = LabelEncoder()
        y = le.fit_transform(y)
        
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    return X_train, X_test, y_train, y_test
