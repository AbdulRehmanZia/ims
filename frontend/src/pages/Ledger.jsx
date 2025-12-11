import React, { useState } from "react";
import { BookOpen, DollarSign, Users, Truck } from "lucide-react";
import CashLedger from "../components/CashLedger";
import CustomerLedger from "../components/CustomerLedger";
// import SupplierLedger from "../components/SupplierLedger";

export default function Ledger() {
  const [activeTab, setActiveTab] = useState("cash");

  const tabs = [
    { id: "cash", name: "Cash Ledger", icon: <DollarSign className="h-5 w-5" /> },
    { id: "customers", name: "Customers", icon: <Users className="h-5 w-5" /> },
    // { id: "suppliers", name: "Suppliers", icon: <Truck className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F9F9] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-[#2F4F4F] text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2F4F4F]">Ledger</h1>
            <p className="text-[#2F4F4F]/80">Manage your financial accounts</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-[#2F4F4F]/20 mb-6">
          <div className="flex border-b border-[#2F4F4F]/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "text-[#2F4F4F] border-b-2 border-[#2F4F4F] bg-[#F4F9F9]"
                    : "text-[#2F4F4F]/70 hover:text-[#2F4F4F] hover:bg-[#F4F9F9]/50"
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-[#2F4F4F]/20 p-6">
          {activeTab === "cash" && <CashLedger />}
          {activeTab === "customers" && <CustomerLedger />}
          {/* {activeTab === "suppliers" && <SupplierLedger />} */}
        </div>
      </div>
    </div>
  );
}

