"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Users, Activity, BrainCircuit, ArrowRight, ShieldAlert, Search, FilterX, Ban } from "lucide-react";
import clsx from "clsx";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Toaster, toast } from "sonner";
import NetworkGraph from "@/components/NetworkGraph";

export default function SaaS_Dashboard() {
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
    toast.success(`Account #${accId} suspended`, {
      description: 'The account has been frozen pending officer review.',
      duration: 4000,
      icon: <Ban className="w-4 h-4 text-red-500" />
    });
  };

  const handleChartClick = (entry: any) => {
    if (entry.name === "High Risk") {
      setStatusFilter("High Risk");
      toast.info("Filtered to show High Risk accounts");
    } else {
      setStatusFilter("Cleared");
      toast.info("Filtered to show Cleared accounts");
    }
  };

  const filteredAccounts = useMemo(() => {
    if (!data?.accounts) return [];
    let filtered = data.accounts;
    
    // Search Filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((acc: any) => 
        acc.account_id.toString().includes(searchQuery.trim())
      );
    }
    
    // Status Filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((acc: any) => acc.status === statusFilter);
    }
    
    return filtered;
  }, [data?.accounts, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 mt-6 animate-pulse">Loading Risk Analytics Engine...</p>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen bg-slate-950 text-red-500 flex items-center justify-center">Error connecting to AI backend.</div>;

  const { summary, ai_insights } = data;
  
  // Chart Data
  const chartData = [
    { name: 'High Risk', value: summary.high_risk_count, color: '#ef4444' }, // Red
    { name: 'Cleared', value: summary.total_accounts - summary.high_risk_count, color: '#10b981' } // Green
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-6 md:p-10 selection:bg-blue-500/30">
      <Toaster theme="dark" position="bottom-right" />
      
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-blue-500" />
              SaaS Risk Intelligence
            </h1>
            <p className="text-slate-500 mt-1">Real-time monitoring of potential defaults and mule accounts.</p>
          </div>
          <button 
            onClick={() => router.push("/")}
            className="text-sm bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Exit Dashboard
          </button>
        </header>

        {/* Top Metrics & Chart Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Metrics Stack */}
          <div className="col-span-1 space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Users className="w-5 h-5" /></div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Accounts</p>
              <p className="text-3xl font-bold text-white mt-1">{summary.total_accounts.toLocaleString()}</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-red-900/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-16 bg-red-500/5 blur-3xl -mr-8 -mt-8"></div>
              <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl relative z-10"><ShieldAlert className="w-5 h-5" /></div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold relative z-10">High-Risk (Mules)</p>
              <p className="text-3xl font-bold text-red-500 mt-1 relative z-10">{summary.high_risk_count.toLocaleString()}</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><Activity className="w-5 h-5" /></div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Avg Transaction Score</p>
              <p className="text-3xl font-bold text-green-500 mt-1">{summary.avg_score}</p>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="col-span-1 md:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <h3 className="text-white font-bold mb-4">Risk Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
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
                    className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
        <div className="bg-blue-950/20 border border-blue-900/50 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex gap-4">
            <div className="mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            <div>
              <h3 className="text-blue-400 font-bold mb-2">AI Summary & Insights</h3>
              <p className="text-blue-100/70 leading-relaxed">{ai_insights}</p>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit mx-auto">
          <button 
            onClick={() => setActiveTab("list")}
            className={clsx("px-6 py-2 rounded-md text-sm font-bold transition-all", activeTab === "list" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
          >
            List View
          </button>
          <button 
            onClick={() => setActiveTab("network")}
            className={clsx("px-6 py-2 rounded-md text-sm font-bold transition-all", activeTab === "network" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
          >
            Network Topology (Mules)
          </button>
        </div>

        {activeTab === "network" ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl h-[700px] flex flex-col">
            <div className="mb-4">
              <h3 className="text-white font-bold">Mule Ring Detection</h3>
              <p className="text-slate-500 text-sm">Interactive visualization of funds transferred between accounts. Red nodes represent High-Risk accounts. Drag nodes to explore. Click a node to open its profile.</p>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden relative">
              {networkData && <NetworkGraph data={networkData} />}
            </div>
          </div>
        ) : (
          <>
            {/* Data Table with Search and Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              
              <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-white font-bold whitespace-nowrap">Account List</h3>
            
            <div className="flex w-full md:w-auto items-center gap-3">
              {/* Search */}
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search Account ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex bg-slate-950 rounded-lg border border-slate-700 p-1">
                {["All", "High Risk", "Cleared"].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={clsx(
                      "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                      statusFilter === status ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
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
                  className="p-2 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Clear Filters"
                >
                  <FilterX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-950 z-10 shadow-sm">
                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Account ID</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Default Prob.</th>
                  <th className="px-6 py-4 font-semibold">Score</th>
                  <th className="px-6 py-4 font-semibold">Zero Bal. Freq.</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredAccounts.slice(0, 100).map((acc: any) => (
                  <tr 
                    key={acc.account_id} 
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/officer/${acc.account_id}`)}
                  >
                    <td className="px-6 py-4 text-white font-mono">#{acc.account_id}</td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 text-xs font-bold rounded-md",
                        acc.status === "High Risk" ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"
                      )}>
                        {acc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <span className={acc.probability_of_default > 50 ? "text-red-400" : "text-green-400"}>
                        {acc.probability_of_default}%
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-300">{acc.score}</td>
                    <td className="px-6 py-4 text-slate-400">{acc.zero_balance_freq}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      <button 
                        onClick={(e) => handleActionClick(e, acc.account_id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded border border-slate-700 hover:border-red-500/50 flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" /> Suspend
                      </button>
                      <button className="text-blue-500 hover:text-blue-400 font-semibold text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        View <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAccounts.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No accounts match your filters.
              </div>
            )}
            
            {filteredAccounts.length > 100 && (
              <div className="py-3 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-900/30">
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
