import time
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, log_loss

def train_logistic_regression(X_train, y_train, X_test, y_test):
    model = LogisticRegression(max_iter=1000)
    
    start_time = time.time()
    
    # We do custom loop here if we want log loss history. For simplicity, we just measure after.
    model.fit(X_train, y_train)
    training_time = time.time() - start_time
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    loss_val = log_loss(y_test, model.predict_proba(X_test), labels=[0, 1])
    
    return {
        "model": "Classical Logistic Regression",
        "accuracy": float(accuracy),
        "training_time_seconds": float(training_time),
        "loss_history": [float(loss_val)], # Scikit-Learn logistic regression does not expose a history path by default usually without warm starts
        "confusion_matrix": cm,
        "message": "Classical training completed."
    }
