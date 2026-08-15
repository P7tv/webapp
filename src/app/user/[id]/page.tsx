"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Bell, ScanLine, Send, Smartphone, 
  Receipt, WalletCards, ShieldCheck, Activity,
  ChevronRight, CircleDollarSign
} from "lucide-react";
import clsx from "clsx";

export default function KrungsriUserApp() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/user/${id}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium animate-pulse mt-4">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-red-500 font-semibold bg-red-50 px-6 py-4 rounded-xl border border-red-100 shadow-sm">
          ไม่พบบัญชีผู้ใช้
        </p>
      </div>
    );
  }

  const { financial_summary, transaction_score, benefits } = data;
  const availableBalance = Math.max(0, financial_summary.total_income - financial_summary.total_expense);

  // Determine score color based on Krungsri-ish theme or general traffic lights
  let scoreColor = "text-green-500";
  let scoreBg = "bg-green-50";
  let scoreBorder = "border-green-200";
  let statusText = "บัญชีปกติ";

  if (transaction_score.score < 500) {
    scoreColor = "text-red-500";
    scoreBg = "bg-red-50";
    scoreBorder = "border-red-200";
    statusText = "บัญชีมีความเสี่ยงสูง";
  } else if (transaction_score.score < 700) {
    scoreColor = "text-amber-500";
    scoreBg = "bg-amber-50";
    scoreBorder = "border-amber-200";
    statusText = "ควรเฝ้าระวัง";
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans selection:bg-amber-200">
      {/* Mobile Device Container */}
      <div className="w-full max-w-[400px] bg-white shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* App Header (Yellow) */}
        <div className="bg-[#FBBF24] pt-12 pb-6 px-6 rounded-b-3xl relative z-10 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => router.push("/")}
              className="text-slate-900 hover:bg-black/10 p-2 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="font-bold text-slate-900 text-lg tracking-tight">AppDemo</div>
            <button className="text-slate-900 hover:bg-black/10 p-2 rounded-full transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-[#FBBF24] rounded-full"></span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 shadow-inner">
              <span className="text-xl font-bold text-slate-900">
                {id?.toString().slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-slate-800 font-medium text-sm">สวัสดี,</p>
              <h2 className="text-slate-900 font-bold text-xl">บัญชี #{data.account_id}</h2>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-8 -mt-4 pt-8 px-5 space-y-6 z-0">
          
          {/* Main Account Balance / Financial Health Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-500 font-medium text-sm">ดัชนีวินัยการเงิน (Financial Flow)</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">ประเมินจากพฤติกรรม</span>
            </div>
            
            {/* Visual Flow Balance Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  กระแสเงินเข้า {financial_summary.inflow_pct}%
                </span>
                <span className="text-rose-500 flex items-center gap-1">
                  กระแสเงินออก {financial_summary.outflow_pct}%
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full transition-all" style={{ width: `${financial_summary.inflow_pct}%` }}></div>
                <div className="bg-gradient-to-r from-rose-400 to-rose-500 h-full transition-all" style={{ width: `${financial_summary.outflow_pct}%` }}></div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
              <div className="text-left">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">อัตราสภาพคล่องคงเหลือสุทธิ</p>
                <p className="text-sm font-bold text-slate-800">{financial_summary.retention_pct}% <span className="text-[10px] font-normal text-slate-500">(Net Retention)</span></p>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">ดัชนีสภาพคล่องสำรอง</p>
                <p className="text-sm font-bold text-emerald-600">{financial_summary.liquidity_buffer?.toFixed(2)}x <span className="text-[10px] font-normal text-slate-500">(Buffer Ratio)</span></p>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-4 gap-3">
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-100 group-hover:scale-105 transition-all shadow-sm">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-700">โอนเงิน</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-100 group-hover:scale-105 transition-all shadow-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-700">เติมเงิน</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-100 group-hover:scale-105 transition-all shadow-sm">
                <Receipt className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-700">จ่ายบิล</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-100 group-hover:scale-105 transition-all shadow-sm">
                <ScanLine className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-700">สแกนจ่าย</span>
            </button>
          </div>

          {/* AI Transaction Score Widget */}
          <div>
            <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              AI ตรวจสอบความปลอดภัย & ประเมินธุรกรรม
            </h3>
            
            <div className={clsx("rounded-2xl p-5 border shadow-sm relative overflow-hidden", scoreBg, scoreBorder)}>
              <div className="absolute -right-6 -top-6 text-black/5">
                <Activity className="w-24 h-24" />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Transaction Score</p>
                  <div className="flex items-baseline gap-1">
                    <span className={clsx("text-3xl font-extrabold tracking-tight", scoreColor)}>
                      {transaction_score.score}
                    </span>
                    <span className="text-slate-400 font-medium text-sm">/ {transaction_score.max_score}</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-100">
                    <span className={clsx("w-2 h-2 rounded-full animate-pulse", scoreBg.replace('50', '500'))}></span>
                    <span className="text-[11px] font-bold text-slate-700">{statusText}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">ระดับการเข้าถึงบริการ</p>
                  <p className="text-xs font-bold text-slate-900 mt-1 bg-white/80 px-2 py-1 rounded-md border border-slate-100">{transaction_score.tier}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accessible Financial Services List */}
          <div>
            <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
              <WalletCards className="w-5 h-5 text-amber-500" />
              บริการทางการเงินที่เข้าถึงได้
            </h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {(data.accessible_services || data.benefits || []).map((service: string, idx: number) => (
                <div key={idx} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors shrink-0">
                    <CircleDollarSign className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 flex-1">{service}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </div>
        
        {/* Bottom Navigation Bar (Mock) */}
        <div className="bg-white border-t border-slate-100 flex justify-around py-3 px-2 pb-8 shadow-[0_-4px_20px_rgb(0,0,0,0.03)] z-10">
          <button className="flex flex-col items-center gap-1 text-amber-500">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">หน้าหลัก</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors pt-2">
            <WalletCards className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">บัญชี</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors pt-2">
            <ScanLine className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">สแกน</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors pt-2">
            <Bell className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">แจ้งเตือน</span>
          </button>
        </div>

      </div>
    </div>
  );
}
