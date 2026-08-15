from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import sys
import os

# Add parent dir to path to import poc_pipeline
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from poc_pipeline import load_data, extract_features, create_dataset
from autogluon.tabular import TabularPredictor

app = FastAPI(title="Fintech PoC API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold data and model
df_final = None
df_trans = None
predictor = None
cached_dashboard_data = {
    "total_accounts": 0,
    "high_risk_count": 0,
    "avg_score": 0,
    "accounts": []
}

@app.on_event("startup")
def load_resources():
    global df_final, df_trans, predictor
    print("Loading data and model...")
    # Load data
    _trans, df_loan, df_disp, df_client, df_district = load_data("extracted_augmented")
    df_trans = _trans.copy()
    df_trans['date_dt'] = pd.to_datetime(df_trans['date'], errors='coerce')
    df_trans['amount'] = pd.to_numeric(df_trans['amount'], errors='coerce')
    
    # Load pre-extracted dataset for ML inference
    df_features = extract_features(_trans, df_disp, df_client, df_district, df_loan)
    df_final = create_dataset(df_features, df_loan)
    
    # Load model
    predictor = TabularPredictor.load(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ag_models'))
    print("Pre-calculating scores for all accounts...")
    
    # Predict all at once for efficiency
    features_only = df_final.drop(columns=['account_id', 'target'])
    probs = predictor.predict_proba(features_only)
    
    total_score = 0
    high_risk = 0
    accounts_list = []
    
    for i in range(len(df_final)):
        acc_id = int(df_final.iloc[i]['account_id'])
        prob_default = float(probs.iloc[i][1])
        score = int(850 - (prob_default * 550))
        
        if score >= 750: tier = "Premium"
        elif score >= 600: tier = "Standard"
        else: tier = "Restricted"
        
        status = "High Risk" if prob_default > 0.5 else "Cleared"
        if status == "High Risk": high_risk += 1
        
        total_score += score
        
        accounts_list.append({
            "account_id": acc_id,
            "score": score,
            "probability_of_default": round(prob_default * 100, 2),
            "tier": tier,
            "status": status,
            "zero_balance_freq": int(df_final.iloc[i]['zero_balance_freq']),
            "end_of_month_spending_prop": float(df_final.iloc[i]['end_of_month_spending_prop'])
        })
        
    # Sort accounts by risk (highest probability first)
    accounts_list.sort(key=lambda x: x["probability_of_default"], reverse=True)
    
    cached_dashboard_data["total_accounts"] = len(df_final)
    cached_dashboard_data["high_risk_count"] = high_risk
    cached_dashboard_data["avg_score"] = int(total_score / len(df_final))
    cached_dashboard_data["accounts"] = accounts_list
    
    print("Resources and cache loaded successfully!")

@app.get("/api/user/{account_id}")
def get_user_dashboard(account_id: int):
    global df_final, df_trans, predictor
    
    # Check if account exists in our labeled dataset
    user_data = df_final[df_final['account_id'] == account_id]
    if user_data.empty:
        raise HTTPException(status_code=404, detail="Account not found in loan dataset")
        
    user_record = user_data.iloc[0:1]
    
    # 1. Financial Summary from transactions (Income/Expense over last 12 months for simplicity, or just total)
    user_trans = df_trans[df_trans['account_id'] == account_id]
    inflows = user_trans[user_trans['type'].isin(['PRIJEM', 'C'])]['amount'].sum()
    outflows = user_trans[user_trans['type'].isin(['VYDAJ', 'D', 'P'])]['amount'].sum()
    
    # 2. Get Model Prediction
    features_only = user_record.drop(columns=['account_id', 'target'])
    prob_default = float(predictor.predict_proba(features_only).iloc[0][1])
    
    # 3. Calculate "Transaction Score" (300 to 850 scale)
    # High probability of default = Low Score
    # prob_default 0.0 -> 850
    # prob_default 1.0 -> 300
    transaction_score = int(850 - (prob_default * 550))
    
    # 4. Determine Access Privileges
    if transaction_score >= 750:
        tier = "Premium"
        benefits = ["Pre-approved for 100,000 THB Loan", "Reduced interest rate (1.5% / month)", "VIP Support Line"]
    elif transaction_score >= 600:
        tier = "Standard"
        benefits = ["Eligible for 30,000 THB Loan", "Standard interest rate (2.5% / month)"]
    else:
        tier = "Restricted"
        benefits = ["Secured Credit Card Only", "Requires collateral for personal loans"]
        
    # Return JSON response
    return {
        "account_id": account_id,
        "financial_summary": {
            "total_income": float(inflows),
            "total_expense": float(outflows),
            "liquidity_buffer": float(user_record['liquidity_buffer_ratio'].iloc[0])
        },
        "transaction_score": {
            "score": transaction_score,
            "max_score": 850,
            "tier": tier
        },
        "benefits": benefits,
        "risk_details": {
            "probability_of_default": round(prob_default * 100, 2),
            "zero_balance_freq": int(user_record['zero_balance_freq'].iloc[0]),
            "end_of_month_spending_prop": float(user_record['end_of_month_spending_prop'].iloc[0]),
            "credit_debit_ratio": float(user_record['credit_debit_ratio'].iloc[0])
        }
    }

@app.get("/api/officer/dashboard")
def get_officer_dashboard():
    # Return the cached data and simulated AI insights
    insights = (
        f"AI System tracked {cached_dashboard_data['high_risk_count']} high-risk accounts. "
        "Pattern analysis indicates strong correlation between zero-balance frequency and default probability. "
        "Recommend proactive monitoring of these accounts for potential mule activity."
    )
    
    return {
        "summary": {
            "total_accounts": cached_dashboard_data["total_accounts"],
            "high_risk_count": cached_dashboard_data["high_risk_count"],
            "avg_score": cached_dashboard_data["avg_score"]
        },
        "ai_insights": insights,
        "accounts": cached_dashboard_data["accounts"] # Return all accounts for UI filtering
    }

@app.get("/api/officer/network")
def get_global_network():
    # Simulate a network of all accounts
    import random
    random.seed(42) # Deterministic for presentation
    
    all_accounts = cached_dashboard_data.get("accounts", [])
    if not all_accounts:
        return {"nodes": [], "links": []}
        
    nodes = []
    links = []
    
    high_risk = [a for a in all_accounts if a["status"] == "High Risk"]
    cleared = [a for a in all_accounts if a["status"] == "Cleared"]
    
    # Create nodes for ALL accounts
    for acc in all_accounts:
        nodes.append({
            "id": str(acc["account_id"]),
            "group": 1 if acc["status"] == "High Risk" else 2,
            "val": 10 if acc["status"] == "High Risk" else 2,
            "status": acc["status"],
            "score": acc["score"]
        })
        
    # Simulate mule rings among high risk accounts
    if high_risk:
        ring_centers = [str(high_risk[0]["account_id"])]
        if len(high_risk) > 10: ring_centers.append(str(high_risk[10]["account_id"]))
        if len(high_risk) > 20: ring_centers.append(str(high_risk[20]["account_id"]))
        
        for i, acc in enumerate(high_risk):
            acc_str = str(acc["account_id"])
            if acc_str not in ring_centers:
                # Connect to a ring center
                center = ring_centers[i % len(ring_centers)]
                links.append({"source": acc_str, "target": center, "value": random.randint(10000, 500000)})
                # Occasionally connect to each other
                if random.random() > 0.6:
                    target = str(high_risk[random.randint(0, len(high_risk)-1)]["account_id"])
                    if target != acc_str:
                        links.append({"source": acc_str, "target": target, "value": random.randint(5000, 50000)})
                        
    # Simulate random background network for cleared accounts (less dense)
    # We only connect a subset to avoid crashing the browser (e.g. 1 link per cleared account)
    for acc in cleared:
        acc_str = str(acc["account_id"])
        # Most people transfer to another cleared account
        if random.random() > 0.2:
            target = str(cleared[random.randint(0, len(cleared)-1)]["account_id"])
            if target != acc_str:
                links.append({"source": acc_str, "target": target, "value": random.randint(500, 10000)})
        else:
            # Sometimes cleared accounts transfer to a high risk account (victims)
            if high_risk:
                target = str(high_risk[random.randint(0, len(high_risk)-1)]["account_id"])
                links.append({"source": acc_str, "target": target, "value": random.randint(1000, 50000)})
        
    return {"nodes": nodes, "links": links}

@app.get("/api/officer/network/{account_id}")
def get_ego_network(account_id: int):
    # Simulate an ego-network for a specific account using real accounts
    import random
    random.seed(account_id)
    
    nodes = [{"id": str(account_id), "group": 1, "val": 15, "status": "Selected", "name": f"Account {account_id}"}]
    links = []
    
    # Generate 5-15 random counterparties from existing accounts
    all_accounts = cached_dashboard_data.get("accounts", [])
    if not all_accounts:
        return {"nodes": nodes, "links": links}
        
    num_partners = min(random.randint(5, 15), len(all_accounts))
    # Pick random accounts, ensuring we don't pick the account_id itself
    candidates = [acc for acc in all_accounts if acc["account_id"] != account_id]
    
    if candidates:
        partners = random.sample(candidates, min(num_partners, len(candidates)))
        
        for partner in partners:
            partner_id = str(partner["account_id"])
            is_risky = partner["status"] == "High Risk"
            nodes.append({
                "id": partner_id,
                "group": 1 if is_risky else 2,
                "val": 5 if is_risky else 3,
                "status": partner["status"]
            })
            # 50/50 chance of sending vs receiving
            if random.random() > 0.5:
                links.append({"source": str(account_id), "target": partner_id, "value": random.randint(1000, 50000)})
            else:
                links.append({"source": partner_id, "target": str(account_id), "value": random.randint(1000, 50000)})
                
    return {"nodes": nodes, "links": links}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
