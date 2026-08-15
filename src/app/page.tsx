"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Shield, Smartphone, FileSearch } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleUserView = () => {
    router.push(`/user/2`); // Hardcode to Account ID 2 (Good Account) for User Demo
  };

  const handleOfficerView = () => {
    router.push(`/officer/dashboard`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-8">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Score Portal</h1>
          <p className="text-slate-500 text-sm">Enter an Account ID to view the dashboard.</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 pt-2">
            <button
              onClick={handleUserView}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Smartphone className="w-5 h-5" />
              Open User View
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            
            <button
              onClick={handleOfficerView}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
            >
              <FileSearch className="w-5 h-5" />
              Open Officer View
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
