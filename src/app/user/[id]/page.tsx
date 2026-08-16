"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Bell, WalletCards, Activity, 
  Search, ShieldCheck, Scale, Landmark, ChevronRight, TrendingUp, PieChart as PieChartIcon
} from "lucide-react";
import clsx from "clsx";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function KrungsriUserApp() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "account" | "product">("home");

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
        <div className="w-12 h-12 border-4 border-[#FBBF24] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium animate-pulse mt-4">กำลังโหลดข้อมูลบัญชี...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-500 font-semibold bg-red-50 px-6 py-4 rounded-xl border border-red-100 shadow-sm">
          ไม่พบข้อมูลบัญชี
        </p>
      </div>
    );
  }

  const { financial_summary, transaction_score } = data;
  const availableBalance = Math.max(0, financial_summary.total_income + financial_summary.total_expense); // total_expense is negative
  const formatter = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' });
  
  // Mock Category Data for Chart
  const pieData = [
    { name: 'เงินเข้า', value: financial_summary.inflow_pct, color: '#10b981' },
    { name: 'เงินออก', value: financial_summary.outflow_pct, color: '#f43f5e' }
  ];

  const renderHomeTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-800 font-bold mb-4 text-center">เงินเข้า/ออกไป Category ไหนบ้าง</h3>
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `${val}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-2xl font-bold text-slate-800">{financial_summary.inflow_pct}%</span>
            <span className="text-xs font-semibold text-slate-500 uppercase">เงินเข้า</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 shadow-lg border border-slate-700 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="text-sm text-slate-300 font-bold uppercase tracking-widest mb-1">Transaction Score</p>
          <h2 className="text-4xl font-extrabold text-[#FBBF24] mb-2">{transaction_score.score}</h2>
          <p className="text-sm font-medium text-slate-300">
            สถานะ: <span className="text-white">{transaction_score.tier}</span>
          </p>
          <div className="mt-4 bg-white/10 rounded-xl p-3 w-full backdrop-blur-sm border border-white/10">
            <p className="text-xs text-slate-200">Spending Insight: คุณมีวินัยการเงินที่ดี มีสัดส่วนรายรับรายจ่ายที่เหมาะสม</p>
          </div>
        </div>
        <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-5" />
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="text-center mb-6 mt-2">
          <p className="text-slate-500 text-sm font-medium mb-1">ยอดเงินหมุนเวียนรวม</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatter.format(availableBalance).replace('฿', '')} <span className="text-xl font-bold text-slate-500">฿</span>
          </h1>
        </div>
        <div className="flex justify-between items-center pt-5 border-t border-slate-100">
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">เงินเข้ารวม</span>
            <p className="text-sm font-bold text-slate-800">{formatter.format(financial_summary.total_income)}</p>
          </div>
          <div className="w-px h-10 bg-slate-100"></div>
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-1">เงินออกรวม</span>
            <p className="text-sm font-bold text-slate-800">{formatter.format(Math.abs(financial_summary.total_expense))}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Dashboard วิเคราะห์ Cash Flow</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">ช่องทางเงินเข้า</span>
            </div>
            <span className="text-sm font-bold text-slate-900">3 ช่องทาง</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">สภาพคล่อง (Cash Flow)</span>
            </div>
            <span className="text-sm font-bold text-emerald-600">เป็นบวกต่อเนื่อง</span>
          </div>
          
          <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
             <span className="text-xs font-semibold text-slate-500 mb-1">จำนวนเงินเข้าแยกบัญชีของคุณ</span>
             <div className="flex justify-between text-sm">
                <span className="text-slate-700">บช. หลัก (Krungsri)</span>
                <span className="font-bold text-slate-900">{formatter.format(financial_summary.total_income * 0.7)}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-700">บช. อื่นๆ</span>
                <span className="font-bold text-slate-900">{formatter.format(financial_summary.total_income * 0.3)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="คุณกำลังมองหา?"
          className="block w-full pl-11 pr-3 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FBBF24] focus:border-transparent transition-all"
        />
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div className="text-white">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Transaction Score ของคุณ</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-[#FBBF24]">{transaction_score.score}</span>
          </div>
        </div>
        <ShieldCheck className="w-10 h-10 text-emerald-400" />
      </div>

      <div className="space-y-5 pt-2 pb-4">
        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-slate-800 text-sm">หมวดการออมและการลงทุน (Saving)</h3>
            <p className="text-[10px] text-slate-500">ตามระดับความเสี่ยงและดอกเบี้ย</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#FBBF24] transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-bold text-slate-800 block mb-1.5">เงินฝากดอกเบี้ยสูง</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">ความเสี่ยงต่ำ</span>
                <p className="text-[10px] text-slate-500 mt-1.5">ดอกเบี้ย 1.5 - 2.5% ต่อปี</p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                <span className="text-[9px] text-slate-400 font-medium">รวมทุกธนาคาร</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#FBBF24] transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-bold text-slate-800 block mb-1.5">กองทุนรวม (SSF/RMF)</span>
                <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-semibold border border-amber-100">ความเสี่ยงปานกลาง</span>
                <p className="text-[10px] text-slate-500 mt-1.5">คาดหวังผลตอบแทน 4-8%</p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                <span className="text-[9px] text-slate-400 font-medium">รวมทุก บลจ.</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#FBBF24] transition-colors cursor-pointer col-span-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-bold text-slate-800 block mb-1.5">ประกันสะสมทรัพย์</span>
                  <div className="flex gap-1.5">
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">ความเสี่ยงต่ำมาก</span>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold border border-blue-100">ลดหย่อนภาษี</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">ผลตอบแทน IRR 2-3%</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                <span className="text-[9px] text-slate-400 font-medium">เปรียบเทียบจากทุกบริษัทประกัน</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-slate-800 text-sm">หมวดสินเชื่อ (Loans)</h3>
            <p className="text-[10px] text-slate-500">ตามอัตราดอกเบี้ย</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#FBBF24] transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-bold text-slate-800 block mb-1.5">สินเชื่อส่วนบุคคล</span>
                <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-semibold border border-rose-100">ดอกเบี้ย 15-25%</span>
                <p className="text-[10px] text-slate-500 mt-1.5">อนุมัติไว ไม่ต้องค้ำ</p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                <span className="text-[9px] text-slate-400 font-medium">รวมทุกธนาคาร</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#FBBF24] transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-bold text-slate-800 block mb-1.5">บัตรเครดิต</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-semibold border border-indigo-100">ดอกเบี้ย 16%</span>
                <p className="text-[10px] text-slate-500 mt-1.5">ระยะเวลาปลอดดอก 45 วัน</p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                <span className="text-[9px] text-slate-400 font-medium">รวมทุกธนาคาร</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#FBBF24] transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-bold text-slate-800 block mb-1.5">สินเชื่อบ้าน</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">ดอกเบี้ย 3-5%</span>
                <p className="text-[10px] text-slate-500 mt-1.5">คงที่ 3 ปีแรก</p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                <span className="text-[9px] text-slate-400 font-medium">รวมทุกธนาคาร</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-[#FBBF24] transition-colors cursor-pointer">
              <div>
                <span className="text-sm font-bold text-slate-800 block mb-1.5">สินเชื่อรถยนต์</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold border border-blue-100">ดอกเบี้ย 2-4%</span>
                <p className="text-[10px] text-slate-500 mt-1.5">ดอกเบี้ยคงที่ตลอดอายุ</p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                <span className="text-[9px] text-slate-400 font-medium">รวมทุกธนาคาร</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full bg-white border border-slate-200 hover:border-[#FBBF24] shadow-sm p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors text-slate-800 font-bold group">
        <Scale className="w-5 h-5 text-slate-400 group-hover:text-[#FBBF24] transition-colors" />
        เทียบผลิตภัณฑ์ (เหมือน Spec คอม)
      </button>

    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex justify-center font-sans selection:bg-[#FBBF24]/30">
      <div className="w-full max-w-[400px] bg-[#f8f9fa] shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* App Header */}
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
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner border border-white/40">
              <span className="text-lg font-bold text-slate-800">
                {id?.toString().slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-slate-800 font-medium text-sm">ข้อมูลการเงินของ,</p>
              <h2 className="text-slate-900 font-bold text-xl">คุณ {data.account_id}</h2>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-8 -mt-14 px-5 z-10 relative">
          {activeTab === "home" && renderHomeTab()}
          {activeTab === "account" && renderAccountTab()}
          {activeTab === "product" && renderProductTab()}
        </div>
        
        {/* Bottom Navigation */}
        <div className="bg-white border-t border-slate-100 flex justify-around py-3 px-2 pb-8 shadow-[0_-10px_30px_rgb(0,0,0,0.04)] z-20">
          <button 
            onClick={() => setActiveTab("home")}
            className={clsx("flex flex-col items-center gap-1 transition-all pt-2 flex-1", activeTab === "home" ? "text-slate-900 scale-105" : "text-slate-400 hover:text-slate-600")}
          >
            <div className={clsx("p-2 rounded-xl transition-colors", activeTab === "home" && "bg-[#FBBF24]/20")}>
              <PieChartIcon className="w-5 h-5" />
            </div>
            <span className={clsx("text-[10px]", activeTab === "home" ? "font-bold" : "font-semibold")}>หน้าหลัก</span>
          </button>
          <button 
            onClick={() => setActiveTab("account")}
            className={clsx("flex flex-col items-center gap-1 transition-all pt-2 flex-1", activeTab === "account" ? "text-slate-900 scale-105" : "text-slate-400 hover:text-slate-600")}
          >
             <div className={clsx("p-2 rounded-xl transition-colors", activeTab === "account" && "bg-[#FBBF24]/20")}>
              <WalletCards className="w-5 h-5" />
            </div>
            <span className={clsx("text-[10px]", activeTab === "account" ? "font-bold" : "font-semibold")}>บัญชีของคุณ</span>
          </button>
          <button 
            onClick={() => setActiveTab("product")}
            className={clsx("flex flex-col items-center gap-1 transition-all pt-2 flex-1", activeTab === "product" ? "text-slate-900 scale-105" : "text-slate-400 hover:text-slate-600")}
          >
             <div className={clsx("p-2 rounded-xl transition-colors", activeTab === "product" && "bg-[#FBBF24]/20")}>
              <Activity className="w-5 h-5" />
            </div>
            <span className={clsx("text-[10px]", activeTab === "product" ? "font-bold" : "font-semibold")}>ผลิตภัณฑ์</span>
          </button>
        </div>

      </div>
    </div>
  );
}
