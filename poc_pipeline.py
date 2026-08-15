import pandas as pd
import numpy as np
import os

def load_data(data_dir="extracted_augmented"):
    # Load transactions
    trans_cols = ['trans_id', 'account_id', 'date', 'amount', 'balance', 'type', 'operation', 'k_symbol', 'bank', 'account']
    df_trans = pd.read_csv(os.path.join(data_dir, "fin_trans.tsv"), sep="\t", header=None, names=trans_cols, low_memory=False)
    # Load loans
    loan_cols = ['loan_id', 'account_id', 'date', 'amount', 'duration', 'payments', 'status']
    df_loan = pd.read_csv(os.path.join(data_dir, "fin_loan.tsv"), sep="\t", header=None, names=loan_cols, low_memory=False)
    # Load disp
    disp_cols = ['disp_id', 'client_id', 'account_id', 'type']
    df_disp = pd.read_csv(os.path.join(data_dir, "fin_disp.tsv"), sep="\t", header=None, names=disp_cols, low_memory=False)
    # Load client
    client_cols = ['client_id', 'birth_date', 'gender', 'district_id']
    df_client = pd.read_csv(os.path.join(data_dir, "fin_client.tsv"), sep="\t", header=None, names=client_cols, low_memory=False)
    # Load district
    district_cols = ['district_id', 'name', 'region', 'no_inhabitants', 'mun_lt_499', 'mun_500_1999', 'mun_2000_9999', 'mun_gt_10000', 'cities', 'ratio_urban', 'average_salary', 'unemployment_rate_95', 'unemployment_rate_96', 'enterpreneurs_per_1000', 'crimes_95', 'crimes_96']
    df_district = pd.read_csv(os.path.join(data_dir, "fin_district.tsv"), sep="\t", header=None, names=district_cols, low_memory=False)
    df_district['unemployment_rate_96'] = pd.to_numeric(df_district['unemployment_rate_96'], errors='coerce')
    df_district['average_salary'] = pd.to_numeric(df_district['average_salary'], errors='coerce')
    return df_trans, df_loan, df_disp, df_client, df_district

def extract_features(df_trans, df_disp, df_client, df_district, df_loan):
    # Convert dates
    df_trans['date_dt'] = pd.to_datetime(df_trans['date'], errors='coerce')
    df_loan['loan_date_dt'] = pd.to_datetime(df_loan['date'], errors='coerce')
    
    # Merge to filter out future transactions (Temporal Leakage Fix)
    df_trans = pd.merge(df_trans, df_loan[['account_id', 'loan_date_dt']], on='account_id', how='inner')
    df_trans = df_trans[df_trans['date_dt'] < df_trans['loan_date_dt']].copy()
    
    df_trans['amount'] = pd.to_numeric(df_trans['amount'], errors='coerce')
    df_trans['balance'] = pd.to_numeric(df_trans['balance'], errors='coerce')
    
    # 1. Volatility inflow (std of incoming amounts)
    inflows = df_trans[df_trans['type'].isin(['PRIJEM', 'C'])].copy()
    volatility = inflows.groupby('account_id')['amount'].std().fillna(0).rename('volatility_inflow')
    
    # 2. Counter party diversity (unique destination/source accounts)
    diversity = df_trans.groupby('account_id')['account'].nunique().rename('counter_party_diversity')
    
    # 3. Liquidity buffer ratio (mean balance / mean outflow)
    outflows = df_trans[df_trans['type'].isin(['VYDAJ', 'D', 'P'])].copy()
    mean_balance = df_trans.groupby('account_id')['balance'].mean()
    mean_outflow = outflows.groupby('account_id')['amount'].mean()
    liquidity_buffer = (mean_balance / mean_outflow.replace(0, np.nan)).fillna(0).rename('liquidity_buffer_ratio')
    
    # 4. Zero balance frequency rate (count of days balance < 100)
    low_balance_freq = df_trans[df_trans['balance'] < 100].groupby('account_id').size().rename('zero_balance_freq')
    
    # 5. Credit/Debit Ratio
    sum_inflows = inflows.groupby('account_id')['amount'].sum()
    sum_outflows = outflows.groupby('account_id')['amount'].sum()
    credit_debit_ratio = (sum_inflows / sum_outflows.replace(0, np.nan)).fillna(0).rename('credit_debit_ratio')

    # 6. Cyclic Date Features (Inflow Timing Consistency)
    # Day of month angle
    inflows['dom_angle'] = inflows['date_dt'].dt.day / 31.0 * 2 * np.pi
    inflows['sin_dom'] = np.sin(inflows['dom_angle'])
    inflows['cos_dom'] = np.cos(inflows['dom_angle'])
    mean_sin = inflows.groupby('account_id')['sin_dom'].mean()
    mean_cos = inflows.groupby('account_id')['cos_dom'].mean()
    inflow_timing_consistency = np.sqrt(mean_sin**2 + mean_cos**2).fillna(0).rename('inflow_timing_consistency')

    # 6.5 Time of Month Spending Behavior
    outflows['is_end_of_month'] = (outflows['date_dt'].dt.day >= 21).astype(int)
    end_of_month_spending_prop = outflows.groupby('account_id')['is_end_of_month'].mean().fillna(0).rename('end_of_month_spending_prop')

    # 7. Demographics & External Data
    owners = df_disp[df_disp['type'] == 'O']
    demo = pd.merge(owners, df_client, on='client_id', how='left')
    demo = pd.merge(demo, df_district, on='district_id', how='left')
    demo['birth_year'] = pd.to_datetime(demo['birth_date'], errors='coerce').dt.year
    demo['age'] = 1999 - demo['birth_year']
    demo['gender_encoded'] = demo['gender'].map({'M': 0, 'F': 1})
    demo_features = demo.set_index('account_id')[['age', 'gender_encoded', 'average_salary', 'unemployment_rate_96']]
    
    # Combine features
    df_features = pd.concat([
        volatility, diversity, liquidity_buffer, low_balance_freq, 
        credit_debit_ratio, inflow_timing_consistency, end_of_month_spending_prop, demo_features
    ], axis=1).fillna(0).reset_index()
    # rename index to account_id if necessary, but reset_index handles it usually.
    if 'index' in df_features.columns:
        df_features = df_features.rename(columns={'index': 'account_id'})
    return df_features

def create_dataset(df_features, df_loan):
    # A, C -> 0 (Good), B, D -> 1 (Bad/Default)
    df_loan['target'] = df_loan['status'].map({'A': 0, 'C': 0, 'B': 1, 'D': 1})
    
    # Merge on account_id
    df_final = pd.merge(df_loan[['account_id', 'target']], df_features, on='account_id', how='inner')
    return df_final

from sklearn.model_selection import train_test_split
from autogluon.tabular import TabularPredictor
from sklearn.metrics import classification_report, roc_auc_score

def train_and_evaluate(df_final):
    features = [
        'volatility_inflow', 'counter_party_diversity', 'liquidity_buffer_ratio', 
        'zero_balance_freq', 'credit_debit_ratio', 'inflow_timing_consistency', 
        'end_of_month_spending_prop', 'age', 'gender_encoded', 'average_salary', 
        'unemployment_rate_96', 'target'
    ]
    features_and_target = df_final[features]
    
    train_data, test_data = train_test_split(features_and_target, test_size=0.2, random_state=42, stratify=features_and_target['target'])
    
    print("\n--- Training AutoGluon ---")
    # Using a short time_limit for PoC fast execution
    predictor = TabularPredictor(label='target', path='ag_models/', eval_metric='roc_auc').fit(train_data, time_limit=60, presets='medium_quality')
    
    y_pred = predictor.predict(test_data)
    y_prob = predictor.predict_proba(test_data)[1]
    
    print("\n--- Model Evaluation ---")
    print(classification_report(test_data['target'], y_pred))
    print(f"ROC-AUC Score: {roc_auc_score(test_data['target'], y_prob):.4f}")
    print(f"\nModel saved to {predictor.path}")

if __name__ == "__main__":
    df_trans, df_loan, df_disp, df_client, df_district = load_data()
    print(f"Loaded {len(df_trans)} transactions and {len(df_loan)} loans.")
    df_features = extract_features(df_trans, df_disp, df_client, df_district, df_loan)
    print(f"Extracted features for {len(df_features)} accounts.")
    df_final = create_dataset(df_features, df_loan)
    print(f"Created final dataset with {len(df_final)} labeled records.")
    train_and_evaluate(df_final)
