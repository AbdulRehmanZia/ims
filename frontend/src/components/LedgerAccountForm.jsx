import React, { useState } from "react";
import { api } from "../Instance/api";
import { Loader, X } from "lucide-react";
import toast from "react-hot-toast";

export default function LedgerAccountForm({ type, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/ledger/accounts", {
        name: formData.name,
        type,
        contactName: formData.contactName || null,
        contactEmail: formData.contactEmail || null,
        contactPhone: formData.contactPhone || null,
      });
      
      toast.success(`${type} account created successfully`);
      onSuccess();
      onClose();
      setFormData({
        name: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      });
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error(error.response?.data?.message || `Failed to create ${type.toLowerCase()} account`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#2F4F4F]/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#2F4F4F]">
          Add New {type}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#2F4F4F]/70 hover:text-[#2F4F4F] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#2F4F4F] mb-2">
            {type} Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F4F4F] focus:border-transparent"
            placeholder={`Enter ${type.toLowerCase()} name`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2F4F4F] mb-2">
            Contact Name
          </label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F4F4F] focus:border-transparent"
            placeholder="Contact person name (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2F4F4F] mb-2">
            Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F4F4F] focus:border-transparent"
            placeholder="Email address (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2F4F4F] mb-2">
            Phone
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F4F4F] focus:border-transparent"
            placeholder="Phone number (optional)"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#2F4F4F] text-white rounded-md hover:bg-[#2F4F4F]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-4 w-4" />
                Creating...
              </>
            ) : (
              `Create ${type}`
            )}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

