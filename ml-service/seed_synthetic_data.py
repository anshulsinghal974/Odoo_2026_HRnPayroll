import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import joblib
import os

# Dummy models dictionary
MODELS = {}

def generate_synthetic_data():
    print("Generating synthetic training data...")
    # Generate larger dummy salary data for forecast model
    dates = pd.date_range(start="2020-01-01", periods=60, freq="M")
    headcount = np.random.randint(50, 200, size=60)
    salary_cost = headcount * 5500 + np.random.normal(0, 10000, size=60)
    
    df = pd.DataFrame({"headcount": headcount, "salary_cost": salary_cost})
    return df

def fit_models(df):
    print("Fitting statistical models...")
    # Salary Cost Forecasting: Linear Regression
    X = df[["headcount"]]
    y = df["salary_cost"]
    
    model = LinearRegression()
    model.fit(X, y)
    
    MODELS['salary_forecast_model'] = model
    print("Models fitted and stored in memory successfully.")
    return MODELS

def get_models():
    return MODELS

if __name__ == "__main__":
    df = generate_synthetic_data()
    fit_models(df)
    print("Seed process completed.")
