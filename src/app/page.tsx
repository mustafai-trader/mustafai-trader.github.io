"use client";

import React, { useState } from "react";
import OrderBooker from "@/components/OrderBooker";
import ProductList from "@/components/ProductList";
import CustomerKhata from "@/components/CustomerKhata";
import InvoiceList from "@/components/InvoiceList";
import GodownSummary from "@/components/GodownSummary";
import CompanySettings from "@/components/CompanySettings";
import BottomNav, { TabType } from "@/components/BottomNav";
import InvoicePrintModal from "@/components/InvoicePrintModal";
import { Store, ShoppingBag, FileText, Package, Users, Tag, Settings } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("booker");
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<any>(null);

  const handleOrderSuccess = (invoice: any) => {
    setSelectedInvoiceForPrint(invoice);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Desktop Top Navigation Bar (Hidden on mobile) */}
      <header className="print:hidden hidden md:block bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Store className="w-5 h-5 font-bold" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 block">Distribution Order Booker & ERP</span>
              <span className="text-xs text-slate-500">آرڈر بکنگ، انوینٹری اسٹاک و بل سسٹم</span>
            </div>
          </div>

          <nav className="flex items-center gap-1.5">
            {[
              { id: "booker" as TabType, label: "Order Booker / آرڈر", icon: ShoppingBag },
              { id: "products" as TabType, label: "Stock / پراڈکٹس", icon: Tag },
              { id: "customers" as TabType, label: "Khata / کسٹمر", icon: Users },
              { id: "bills" as TabType, label: "Bills / بلز", icon: FileText },
              { id: "summary" as TabType, label: "Sheet / لوڈ شیٹ", icon: Package },
              { id: "settings" as TabType, label: "Settings / سیٹنگز", icon: Settings },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {activeTab === "booker" && <OrderBooker onOrderSuccess={handleOrderSuccess} />}
        {activeTab === "products" && <ProductList />}
        {activeTab === "customers" && <CustomerKhata />}
        {activeTab === "bills" && <InvoiceList onSelectInvoice={setSelectedInvoiceForPrint} />}
        {activeTab === "summary" && <GodownSummary />}
        {activeTab === "settings" && <CompanySettings />}
      </main>

      {/* Mobile Bottom Navigation (Hidden on desktop & print) */}
      <div className="md:hidden">
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* Invoice Modal for Screen & Thermal/Slip Print */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}
    </div>
  );
}
