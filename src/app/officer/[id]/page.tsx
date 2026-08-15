"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { AlertCircle, FileSearch, Fingerprint, Activity, AlertTriangle, CheckCircle, Network } from "lucide-react";
import clsx from "clsx";
import NetworkGraph from "@/components/NetworkGraph";

export default function OfficerView() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [networkData, setNetworkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, netRes] = await Promise.all([
          axios.get(`/api/user/${id}`),
          axios.get(`/api/officer/network/${id}`)
        ]);
        setData(userRes.data);
        setNetworkData(netRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans">
        <div className="text-slate-400 animate-pulse">Loading Risk Profile...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-red-400">Data not found.</p>
      </div>
    );
  }

  const { risk_details, transaction_score, financial_summary } = data;
  const isHighRisk = risk_details.probability_of_default > 50;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Fingerprint className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-xl text-white font-bold">Risk Assessment Officer View</h1>
              <p className="text-slate-500 text-sm">Target ID: {data.account_id}</p>
            </div>
          </div>
          {isHighRisk ? (
            <div className="flex items-center gap-2 bg-red-900/30 text-red-400 px-3 py-1 rounded-md border border-red-900/50">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase">High Risk</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-green-900/30 text-green-400 px-3 py-1 rounded-md border border-green-900/50">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase">Cleared</span>
            </div>
          )}
        </div>

        {/* Probability & Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <p className="text-slate-500 mb-2 uppercase text-xs font-bold tracking-wider">Raw Probability of Default</p>
            <div className="flex items-end gap-2">
              <span className={clsx("text-4xl font-bold", isHighRisk ? "text-red-500" : "text-green-500")}>
                {risk_details.probability_of_default}%
              </span>
            </div>
            <div className="mt-4 w-full bg-slate-800 rounded-full h-2">
              <div 
                className={clsx("h-2 rounded-full", isHighRisk ? "bg-red-500" : "bg-green-500")}
                style={{ width: `${risk_details.probability_of_default}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
             <p className="text-slate-500 mb-2 uppercase text-xs font-bold tracking-wider">Calculated Transaction Score</p>
             <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{transaction_score.score}</span>
              <span className="text-slate-500 mb-1">/ {transaction_score.max_score}</span>
            </div>
            <p className="mt-4 text-sm text-blue-400">Assigned Tier: {transaction_score.tier}</p>
          </div>
        </div>

        {/* Key Feature Drivers */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-slate-800 pb-2">
            <FileSearch className="w-5 h-5 text-blue-500" />
            Key Predictive Drivers
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Zero Balance Frequency (Pre-loan)</span>
                <span className="text-sm text-white font-bold">{risk_details.zero_balance_freq} times</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">Number of days account balance dropped below 100 THB.</p>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min((risk_details.zero_balance_freq / 5) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">End of Month Spending Prop.</span>
                <span className="text-sm text-white font-bold">{(risk_details.end_of_month_spending_prop * 100).toFixed(1)}%</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">Proportion of total monthly outflow that occurs in the last 7 days.</p>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${risk_details.end_of_month_spending_prop * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Liquidity Buffer Ratio</span>
                <span className="text-sm text-white font-bold">{financial_summary.liquidity_buffer.toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">Mean balance divided by mean outflow.</p>
            </div>
          </div>
        </div>

        {/* Network Graph */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-white font-bold mb-2 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Network className="w-5 h-5 text-purple-500" />
            Ego-Network Connections
          </h2>
          <p className="text-xs text-slate-500 mb-4">Simulated tracking of funds transferring between {data.account_id} and other nodes. Red nodes indicate other high-risk accounts.</p>
          <div className="h-[400px] w-full rounded-xl overflow-hidden relative border border-slate-800">
            {networkData && <NetworkGraph data={networkData} />}
          </div>
        </div>
      </div>
    </div>
  );
}
