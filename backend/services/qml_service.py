import time
import numpy as np
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes
from qiskit_algorithms.optimizers import COBYLA
from qiskit_machine_learning.algorithms.classifiers import VQC
from qiskit.primitives import StatevectorSampler as Sampler
from sklearn.metrics import confusion_matrix

def train_vqc(X_train, y_train, X_test, y_test):
    num_features = X_train.shape[1]
    
    # Building Parameterized Quantum Circuit (ansatz) and Feature Map (encoding)
    feature_map = ZZFeatureMap(feature_dimension=num_features, reps=1)
    ansatz = RealAmplitudes(num_qubits=num_features, reps=2)
    optimizer = COBYLA(maxiter=30) # Keep maxiter lower for speed on simulator
    sampler = Sampler()

    objective_func_vals = []
    def callback_graph(weights, obj_func_eval):
        objective_func_vals.append(obj_func_eval)

    # Qiskit VQC uses categorical one-hot encoding for targets in this version setup.
    y_train_cat = np.zeros((y_train.size, 2))
    y_train_cat[np.arange(y_train.size), y_train] = 1
    
    y_test_cat = np.zeros((y_test.size, 2))
    y_test_cat[np.arange(y_test.size), y_test] = 1
    
    vqc = VQC(
        feature_map=feature_map,
        ansatz=ansatz,
        optimizer=optimizer,
        sampler=sampler,
        callback=callback_graph
    )
    
    start_time = time.time()
    vqc.fit(X_train, y_train_cat)
    training_time = time.time() - start_time
    
    accuracy = vqc.score(X_test, y_test_cat)
    y_pred_cat = vqc.predict(X_test)
    y_pred = np.argmax(y_pred_cat, axis=1)
    
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    return {
        "model": "Quantum VQC (Aer Simulator)",
        "accuracy": float(accuracy),
        "training_time_seconds": float(training_time),
        "loss_history": [float(val) for val in objective_func_vals],
        "confusion_matrix": cm,
        "message": "Quantum training completed via Simulator."
    }
