"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { FileSearch, Fingerprint, Activity, AlertTriangle, CheckCircle, Network, ArrowLeft, ArrowRightLeft, FileText, BarChart3 } from "lucide-react";
import clsx from "clsx";
import NetworkGraph from "@/components/NetworkGraph";

export default function OfficerView() {
  const { id } = useParams();
  const router = useRouter();
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-500 mt-4 font-medium animate-pulse">Loading Customer Profile...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-500 font-semibold bg-red-50 px-6 py-4 rounded-xl border border-red-100">Data not found.</p>
      </div>
    );
  }

  const { risk_details, transaction_score, financial_summary } = data;
  const isHighRisk = risk_details.probability_of_default > 50;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-8 selection:bg-blue-100">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => router.push("/officer/dashboard")}
               className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
             >
               <ArrowLeft className="w-6 h-6" />
             </button>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl text-slate-900 font-bold tracking-tight">Customer Credit Profile</h1>
              <p className="text-slate-500 text-sm font-medium mt-0.5">Account ID: #{data.account_id}</p>
            </div>
          </div>
          {isHighRisk ? (
            <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg border border-rose-100 shadow-sm">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">Low Credit Score</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg border border-emerald-100 shadow-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">Good Credit Score</span>
            </div>
          )}
        </div>

        {/* Data Substitution Comparison Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h2 className="text-slate-900 font-bold mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
             <ArrowRightLeft className="w-5 h-5 text-purple-600" />
             Alternative Data Substitution Analysis
           </h2>
           <p className="text-sm text-slate-500 mb-6">
             Comparing traditional underwriting data with alternative behavioral data to assess creditworthiness.
           </p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traditional Data */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                 <div className="flex items-center gap-2 mb-4 text-slate-700">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold">Traditional Data</h3>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">National Credit Bureau (NCB)</p>
                       <p className="text-slate-400 font-medium italic">No recent credit history found (Thin-file)</p>
                    </div>
                    <div>
                       <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Income Statement (Payslip)</p>
                       <p className="text-slate-400 font-medium italic">Not verifiable / Freelance</p>
                    </div>
                 </div>
              </div>

              {/* Alternative Data */}
              <div className="border border-blue-100 rounded-xl p-5 bg-blue-50/50 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 bg-blue-100 blur-2xl -mr-8 -mt-8"></div>
                 <div className="flex items-center gap-2 mb-4 text-blue-800 relative z-10">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold">Alternative Data (Our Engine)</h3>
                 </div>
                 <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end">
                       <div>
                         <p className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider mb-1">Calculated Transaction Score</p>
                         <p className="text-2xl font-bold text-blue-700">{transaction_score.score} <span className="text-sm font-medium text-blue-500">/ {transaction_score.max_score}</span></p>
                       </div>
                       <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md mb-1">{transaction_score.tier}</span>
                    </div>
                    <div>
                       <p className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider mb-1">Estimated Monthly Income</p>
                       <p className="text-lg font-bold text-slate-800">
                          {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(financial_summary.total_income * 0.85)}
                       </p>
                       <p className="text-[10px] text-blue-600/70 mt-0.5">Derived from recurring cash flow analysis</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Predictive Drivers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-slate-900 font-bold mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileSearch className="w-5 h-5 text-blue-600" />
            Key Predictive Drivers
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-slate-700">Liquidity Stress (Zero Balance Freq)</span>
                <span className="text-sm text-slate-900 font-bold">{risk_details.zero_balance_freq} occurrences</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">Number of days account balance dropped below minimum threshold.</p>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-rose-400 h-2 rounded-full" style={{ width: `${Math.min((risk_details.zero_balance_freq / 5) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-slate-700">Late Month Spending Proportion</span>
                <span className="text-sm text-slate-900 font-bold">{(risk_details.end_of_month_spending_prop * 100).toFixed(1)}%</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">Proportion of total monthly outflow that occurs in the last 7 days.</p>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${risk_details.end_of_month_spending_prop * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-slate-700">Liquidity Buffer Ratio</span>
                <span className="text-sm text-slate-900 font-bold">{financial_summary.liquidity_buffer.toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">Mean balance divided by mean outflow. Higher is better.</p>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
               <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-sm font-semibold text-slate-700 block">Est. Probability of Default</span>
                    <span className="text-xs text-slate-500">Calculated by Risk Engine</span>
                  </div>
                  <span className={clsx("text-3xl font-extrabold", isHighRisk ? "text-rose-600" : "text-emerald-600")}>
                    {risk_details.probability_of_default}%
                  </span>
               </div>
            </div>
          </div>
        </div>

        {/* Network Graph */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-slate-900 font-bold mb-2 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Network className="w-5 h-5 text-indigo-500" />
            Transaction Network
          </h2>
          <p className="text-xs text-slate-500 mb-4">Simulated tracking of funds transferring between {data.account_id} and other nodes. Red nodes indicate other accounts with low credit scores.</p>
          <div className="h-[400px] w-full rounded-xl overflow-hidden relative border border-slate-200 bg-slate-50">
            {networkData && <NetworkGraph data={networkData} />}
          </div>
        </div>
      </div>
    </div>
  );
}
