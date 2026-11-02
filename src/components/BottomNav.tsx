"use client";

import React from "react";
import { ShoppingBag, FileText, Package, Users, Tag, Settings } from "lucide-react";

export type TabType = "booker" | "products" | "customers" | "bills" | "summary" | "settings";

interface Props {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onChangeTab }: Props) {
  const tabs = [
    { id: "booker" as TabType, label: "Booker / آرڈر", icon: ShoppingBag },
    { id: "products" as TabType, label: "Stock / اسٹاک", icon: Tag },
    { id: "customers" as TabType, label: "Khata / کھاتہ", icon: Users },
    { id: "bills" as TabType, label: "Bills / بلز", icon: FileText },
    { id: "summary" as TabType, label: "Sheet / شیٹ", icon: Package },
    { id: "settings" as TabType, label: "Setup / سیٹنگ", icon: Settings },
  ];

  return (
    <nav className="print:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg safe-bottom">
      <div className="max-w-lg mx-auto grid grid-cols-6 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition select-none ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? "bg-blue-50 text-blue-600" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] tracking-tight text-center leading-none font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
