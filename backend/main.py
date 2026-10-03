from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib


# --------------------------------------------------
# Load trained pipeline
# --------------------------------------------------

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "churn_pipeline.pkl"

pipeline = joblib.load(MODEL_PATH)

CHURN_THRESHOLD = 0.33


# --------------------------------------------------
# FastAPI app
# --------------------------------------------------

app = FastAPI(
    title="Customer Churn Prediction API",
    description="API for predicting customer churn using Logistic Regression",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request Schema
# --------------------------------------------------

class CustomerData(BaseModel):

    gender: str
    SeniorCitizen: int
    Partner: str
    Dependents: str
    tenure: int
    PhoneService: str
    MultipleLines: str
    InternetService: str
    OnlineSecurity: str
    OnlineBackup: str
    DeviceProtection: str
    TechSupport: str
    StreamingTV: str
    StreamingMovies: str
    Contract: str
    PaperlessBilling: str
    PaymentMethod: str
    MonthlyCharges: float
    TotalCharges: float


# --------------------------------------------------
# Home route
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "Customer Churn Prediction API is running",
        "model": "Logistic Regression",
        "threshold": CHURN_THRESHOLD
    }


# --------------------------------------------------
# Prediction endpoint
# --------------------------------------------------

@app.post("/predict")
def predict_churn(customer: CustomerData):

    data = pd.DataFrame([customer.model_dump()])

    probability = pipeline.predict_proba(data)[0][1]

    prediction = int(probability >= CHURN_THRESHOLD)

    result = "Yes" if prediction == 1 else "No"

    return {
        "churn_prediction": result,
        "churn_probability": round(float(probability), 4),
        "threshold": CHURN_THRESHOLD
    }
