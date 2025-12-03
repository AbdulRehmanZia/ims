import React, { useState, useEffect } from "react";
import { api } from "../Instance/api";
import { Loader, Calendar, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import toast from "react-hot-toast";

export default function CashLedger() {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchCashLedger = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await api.get(`/ledger/cash?${params.toString()}`);
      setLedger(response.data.data);
    } catch (error) {
      console.error("Error fetching cash ledger:", error);
      toast.error("Failed to load cash ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashLedger();
  }, [startDate, endDate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
  };

  const currentBalance = ledger?.entries?.length > 0 
    ? ledger.entries[ledger.entries.length - 1].balance 
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin h-8 w-8 text-[#2F4F4F]" />
      </div>
    );
  }

  return (
    <div>
      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#F4F9F9] rounded-lg p-4 border border-[#2F4F4F]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#2F4F4F]/70">Current Balance</p>
              <p className="text-2xl font-bold text-[#2F4F4F] mt-1">
                {formatCurrency(currentBalance)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-[#2F4F4F]/50" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Total Debits</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {formatCurrency(
                  ledger?.entries?.reduce((sum, e) => sum + e.debit, 0) || 0
                )}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Total Credits</p>
              <p className="text-2xl font-bold text-red-700 mt-1">
                {formatCurrency(
                  ledger?.entries?.reduce((sum, e) => sum + e.credit, 0) || 0
                )}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Date Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#2F4F4F] mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F4F4F] focus:border-transparent cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#2F4F4F] mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F4F4F] focus:border-transparent cursor-pointer"
          />
        </div>
        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Ledger Entries Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#2F4F4F]/20">
          <thead className="bg-[#F4F9F9]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2F4F4F] uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2F4F4F] uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#2F4F4F] uppercase tracking-wider">
                Debit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#2F4F4F] uppercase tracking-wider">
                Credit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#2F4F4F] uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#2F4F4F]/20">
            {ledger?.entries && ledger.entries.length > 0 ? (
              ledger.entries.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-[#F4F9F9]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2F4F4F]">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#2F4F4F]">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-700">
                    {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-700">
                    {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-[#2F4F4F]">
                    {formatCurrency(entry.balance)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-[#2F4F4F]/70">
                  No ledger entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

