"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Bell, ScanLine, Send, Smartphone, 
  Receipt, WalletCards, ChevronRight, Gift,
  Sparkles, PiggyBank, CreditCard, Activity
} from "lucide-react";
import clsx from "clsx";

export default function KrungsriUserApp() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBenefits, setShowBenefits] = useState(false);

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium animate-pulse mt-4">กำลังโหลดข้อมูลบัญชี...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-500 font-semibold bg-red-50 px-6 py-4 rounded-xl border border-red-100 shadow-sm">
          ไม่พบบัญชีผู้ใช้
        </p>
      </div>
    );
  }

  const { financial_summary } = data;
  const availableBalance = Math.max(0, financial_summary.total_income + financial_summary.total_expense);
  const formatter = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' });
  const formatNum = (num: number) => new Intl.NumberFormat('th-TH').format(Math.abs(num));

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex justify-center font-sans selection:bg-amber-200">
      {/* Mobile Device Container */}
      <div className="w-full max-w-[400px] bg-[#f8f9fa] shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* App Header (Yellow) */}
        <div className="bg-[#FBBF24] pt-12 pb-24 px-6 rounded-b-[40px] relative z-0 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => router.push("/")}
              className="text-slate-900 hover:bg-black/10 p-2 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="font-bold text-slate-900 text-lg tracking-tight">KMA Demo</div>
            <button className="text-slate-900 hover:bg-black/10 p-2 rounded-full transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-[#FBBF24] rounded-full"></span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-inner border border-white/30">
              <span className="text-lg font-bold text-slate-800">
                {id?.toString().slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-slate-800 font-medium text-sm">สวัสดี,</p>
              <h2 className="text-slate-900 font-bold text-xl">บัญชี {data.account_id}</h2>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-8 -mt-16 px-5 space-y-6 z-10 relative">
          
          {/* Main Account Balance Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="text-center mb-6 mt-2">
              <p className="text-slate-500 text-sm font-medium mb-1">ยอดเงินคงเหลือใช้ได้</p>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatter.format(availableBalance).replace('฿', '')} <span className="text-xl font-bold text-slate-500">฿</span>
              </h1>
            </div>
            
            {/* Income / Expense Summary (User Friendly) */}
            <div className="flex justify-between items-center pt-5 border-t border-slate-100">
              <div className="flex-1 flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1 text-emerald-600">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                    <ArrowLeft className="w-3.5 h-3.5 rotate-45" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">สัดส่วนเงินเข้า</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{financial_summary.inflow_pct}%</p>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div className="flex-1 flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-1 text-rose-500">
                  <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center">
                    <ArrowLeft className="w-3.5 h-3.5 -rotate-[135deg]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">สัดส่วนเงินออก</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{financial_summary.outflow_pct}%</p>
              </div>
            </div>
          </div>

          {/* Member Tier Banner (Gamified Score) */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-4 shadow-lg border border-slate-700 flex items-center justify-between text-white gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-amber-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-0.5 truncate">สถานะบัญชีของคุณ</p>
                <p className="text-sm font-bold text-amber-400 truncate">{data.transaction_score?.tier || 'สมาชิกทั่วไป'}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowBenefits(true)}
              className="text-[10px] shrink-0 font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
              ดูสิทธิประโยชน์
            </button>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-4 gap-3 bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100">
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:scale-105 transition-all">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600">โอนเงิน</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:scale-105 transition-all">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600">เติมเงิน</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:scale-105 transition-all">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600">จ่ายบิล</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:scale-105 transition-all">
                <ScanLine className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600">สแกนจ่าย</span>
            </button>
          </div>

          {/* Smart Offers / Services (Hidden AI Output) */}
          <div id="benefits-section" className="space-y-3 pt-2">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-slate-800 font-bold text-sm">บริการแนะนำสำหรับคุณ</h3>
              <button className="text-amber-600 text-xs font-bold hover:underline">ดูทั้งหมด</button>
            </div>
            
            <div className="flex flex-col gap-3 w-full">
              {(data.accessible_services || []).map((service: string, idx: number) => {
                // Pick different icons and colors for variety
                const icons = [Sparkles, PiggyBank, CreditCard];
                const colors = ["bg-blue-50 text-blue-600", "bg-emerald-50 text-emerald-600", "bg-purple-50 text-purple-600"];
                const Icon = icons[idx % icons.length];
                const colorClass = colors[idx % colors.length];

                return (
                  <div key={idx} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", colorClass)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate group-hover:text-amber-600 transition-colors">{service}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">สิทธิพิเศษเฉพาะบัญชีคุณเท่านั้น</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 shrink-0" />
                  </div>
                )
              })}
            </div>
          </div>

        </div>
        
        {/* Bottom Navigation Bar */}
        <div className="bg-white border-t border-slate-100 flex justify-around py-3 px-2 pb-8 shadow-[0_-10px_30px_rgb(0,0,0,0.04)] z-20">
          <button className="flex flex-col items-center gap-1.5 text-amber-500 relative">
            <div className="absolute -top-6 w-12 h-12 bg-[#FBBF24] rounded-full flex items-center justify-center shadow-lg border-4 border-white text-slate-900">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-5">หน้าหลัก</span>
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

        {/* Benefits Detail Modal (BottomSheet) */}
        {showBenefits && (
          <div className="absolute inset-0 z-[100] bg-black/60 flex items-end justify-center animate-in fade-in duration-200">
            <div className="bg-slate-50 w-full h-[85%] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-300">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-white rounded-t-3xl">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-500" /> รายละเอียดสิทธิประโยชน์
                </h3>
                <button 
                  onClick={() => setShowBenefits(false)} 
                  className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <span className="font-bold text-sm">✕</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 overflow-y-auto flex-1 space-y-5">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10">
                    <Sparkles className="w-24 h-24" />
                  </div>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-2">สถานะบัญชีปัจจุบัน</p>
                  <h4 className="text-2xl font-extrabold text-amber-400 mb-2 drop-shadow-md">
                    {data.transaction_score?.tier || 'สมาชิกทั่วไป'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    ระบบ AI ได้ประเมินวินัยทางการเงินและสัดส่วนรายรับรายจ่ายของคุณให้อยู่ในเกณฑ์ <span className="font-bold text-white">ดีเยี่ยม</span> คุณจึงได้รับสิทธิ์ในการเข้าถึงบริการเหล่านี้
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-3 px-1">บริการที่คุณได้รับสิทธิ์อนุมัติล่วงหน้า</h4>
                  <div className="space-y-3">
                    {(data.accessible_services || []).map((service: string, idx: number) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-3 group hover:border-amber-200 transition-colors">
                        <div className="mt-1 shrink-0">
                          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">{service}</p>
                          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                            สิทธิพิเศษนี้คัดสรรมาเพื่อบัญชีของคุณโดยเฉพาะ สามารถกดใช้งานได้ทันทีโดยไม่ต้องยื่นเอกสารรายได้เพิ่มเติม
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-5 bg-white border-t border-slate-100">
                <button 
                  onClick={() => setShowBenefits(false)}
                  className="w-full bg-[#FBBF24] hover:bg-amber-500 text-slate-900 font-bold py-3.5 rounded-xl shadow-sm transition-colors"
                >
                  รับทราบ
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
