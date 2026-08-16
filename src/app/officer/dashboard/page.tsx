"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Users, Activity, BrainCircuit, ArrowRight, ShieldAlert, Search, FilterX, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Toaster, toast } from "sonner";
import NetworkGraph from "@/components/NetworkGraph";

export default function OfficerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("list");
  
  const [networkData, setNetworkData] = useState<any>(null);
  
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, netRes] = await Promise.all([
          axios.get("/api/officer/dashboard"),
          axios.get("/api/officer/network")
        ]);
        setData(dashRes.data);
        setNetworkData(netRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleActionClick = (e: any, accId: string) => {
    e.stopPropagation();
    toast.warning(`Account #${accId} flagged`, {
      description: 'The account has been flagged for manual credit review.',
      duration: 4000,
      icon: <AlertCircle className="w-4 h-4 text-amber-500" />
    });
  };

  const handleChartClick = (entry: any) => {
    if (entry.name === "Low Score") {
      setStatusFilter("Low Score");
      toast.info("Filtered to show Low Score accounts");
    } else {
      setStatusFilter("Good Score");
      toast.info("Filtered to show Good Score accounts");
    }
  };

  const filteredAccounts = useMemo(() => {
    if (!data?.accounts) return [];
    let filtered = data.accounts;
    
    // Map High Risk -> Low Score, Cleared -> Good Score for UI consistency
    const mappedFiltered = filtered.map((acc: any) => ({
        ...acc,
        displayStatus: acc.status === "High Risk" ? "Low Score" : "Good Score"
    }));

    // Search Filter
    let result = mappedFiltered;
    if (searchQuery.trim() !== "") {
      result = result.filter((acc: any) => 
        acc.account_id.toString().includes(searchQuery.trim())
      );
    }
    
    // Status Filter
    if (statusFilter !== "All") {
      result = result.filter((acc: any) => acc.displayStatus === statusFilter);
    }
    
    return result;
  }, [data?.accounts, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-6 animate-pulse font-medium">Loading Scoring Engine...</p>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen bg-slate-50 text-red-500 flex items-center justify-center">Error connecting to AI backend.</div>;

  const { summary, ai_insights } = data;
  
  // Chart Data
  const chartData = [
    { name: 'Low Score', value: summary.high_risk_count, color: '#f43f5e' }, // Rose 500
    { name: 'Good Score', value: summary.total_accounts - summary.high_risk_count, color: '#10b981' } // Emerald 500
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans p-6 md:p-10 selection:bg-blue-100">
      <Toaster theme="light" position="bottom-right" />
      
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
              <BrainCircuit className="w-8 h-8 text-blue-600" />
              Alternative Credit Scoring Analytics
            </h1>
            <p className="text-slate-500 mt-1">Real-time assessment of creditworthiness using alternative data.</p>
          </div>
          <button 
            onClick={() => router.push("/")}
            className="text-sm bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
          >
            Exit Dashboard
          </button>
        </header>

        {/* Top Metrics & Chart Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Metrics Stack */}
          <div className="col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-5 h-5" /></div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Assessed Accounts</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{summary.total_accounts.toLocaleString()}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-16 bg-rose-50 blur-3xl -mr-8 -mt-8"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-rose-50 text-rose-500 rounded-xl relative z-10"><ShieldAlert className="w-5 h-5" /></div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold relative z-10">Low Credit Score</p>
              <p className="text-3xl font-extrabold text-rose-500 mt-1 relative z-10">{summary.high_risk_count.toLocaleString()}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Activity className="w-5 h-5" /></div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Avg Transaction Score</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{summary.avg_score}</p>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="text-slate-900 font-bold mb-4">Credit Score Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                    itemStyle={{ color: '#0f172a' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={handleChartClick}
                    className="cursor-pointer focus:outline-none"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity outline-none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">Click on a chart segment to filter the data table below.</p>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex gap-4">
            <div className="mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            <div>
              <h3 className="text-blue-800 font-bold mb-2">AI Summary & Insights</h3>
              <p className="text-blue-900/80 leading-relaxed text-sm">{ai_insights}</p>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1 w-fit mx-auto shadow-inner">
          <button 
            onClick={() => setActiveTab("list")}
            className={clsx("px-6 py-2 rounded-md text-sm font-bold transition-all", activeTab === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Credit Assessment List
          </button>
          <button 
            onClick={() => setActiveTab("network")}
            className={clsx("px-6 py-2 rounded-md text-sm font-bold transition-all", activeTab === "network" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Transaction Network Analysis
          </button>
        </div>

        {activeTab === "network" ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-[700px] flex flex-col">
            <div className="mb-4">
              <h3 className="text-slate-900 font-bold">Transaction Network Visualization</h3>
              <p className="text-slate-500 text-sm">Interactive visualization of funds transferred. Red nodes indicate accounts with lower credit scores. Drag nodes to explore.</p>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden relative border border-slate-100 bg-slate-50">
              {networkData && <NetworkGraph data={networkData} />}
            </div>
          </div>
        ) : (
          <>
            {/* Data Table with Search and Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-slate-900 font-bold whitespace-nowrap">Accounts Overview</h3>
            
            <div className="flex w-full md:w-auto items-center gap-3">
              {/* Search */}
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search Account ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex bg-slate-100 rounded-lg border border-slate-200 p-1 shadow-inner">
                {["All", "Low Score", "Good Score"].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={clsx(
                      "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                      statusFilter === status ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
              
              {/* Clear Filters Button */}
              {(searchQuery || statusFilter !== "All") && (
                <button 
                  onClick={() => { setSearchQuery(""); setStatusFilter("All"); }}
                  className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
                  title="Clear Filters"
                >
                  <FilterX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm border-b border-slate-200">
                <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Account ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Est. Default Prob.</th>
                  <th className="px-6 py-4">Transaction Score</th>
                  <th className="px-6 py-4">Liquidity Stress</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.slice(0, 100).map((acc: any) => (
                  <tr 
                    key={acc.account_id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/officer/${acc.account_id}`)}
                  >
                    <td className="px-6 py-4 text-slate-900 font-medium">#{acc.account_id}</td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 text-xs font-bold rounded-md",
                        acc.displayStatus === "Low Score" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      )}>
                        {acc.displayStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      <span className={acc.probability_of_default > 50 ? "text-rose-600 font-semibold" : "text-emerald-600"}>
                        {acc.probability_of_default}%
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{acc.score}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{acc.zero_balance_freq} occurrences</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      <button 
                        onClick={(e) => handleActionClick(e, acc.account_id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-amber-50 text-amber-600 text-xs px-3 py-1.5 rounded border border-slate-200 hover:border-amber-200 flex items-center gap-1 font-medium shadow-sm"
                      >
                        <AlertCircle className="w-3 h-3" /> Flag Review
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        Profile <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAccounts.length === 0 && (
              <div className="py-12 text-center text-slate-500 bg-white">
                No accounts match your filters.
              </div>
            )}
            
            {filteredAccounts.length > 100 && (
              <div className="py-3 text-center text-xs text-slate-500 border-t border-slate-100 bg-slate-50">
                Showing top 100 of {filteredAccounts.length} matching accounts
              </div>
            )}
          </div>
        </div>
        </>
        )}

      </div>
    </div>
  );
}
