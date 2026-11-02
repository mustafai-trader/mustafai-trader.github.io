"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, Download, Upload, RefreshCw } from "lucide-react";
import { Storage, CompanySettings as ICompanySettings } from "@/lib/storage";

export default function CompanySettings() {
  const [settings, setSettings] = useState<ICompanySettings>({
    company_name: "",
    company_name_urdu: "",
    address: "",
    phone: "",
    salesman_name: "",
    currency: "Rs",
    receipt_footer: "",
  });
  const [saved, setSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    setSettings(Storage.getSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    Storage.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportBackup = () => {
    const dataStr = Storage.exportBackup();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mustafai_traders_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = Storage.importBackup(content);
      if (ok) {
        setImportStatus("Backup restored successfully! / بیک اپ کامیابی سے بحال ہو گیا۔");
        setSettings(Storage.getSettings());
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        alert("Failed to restore backup file. Invalid format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-3 sm:p-5 max-w-2xl mx-auto pb-28 text-slate-900">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>Business & Receipt Settings</span>
          <span className="text-sm font-normal text-slate-500">/ کاروباری معلومات کی سیٹنگ</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business name, printed receipt header, contact numbers, and database backup
        </p>
      </div>

      <div className="space-y-4">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Settings saved successfully! / تمام معلومات محفوظ ہو گئیں۔</span>
          </div>
        )}

        {importStatus && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2 sm:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">
                Business / Company Name (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MUSTAFAI TRADERS"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-2.5 font-bold uppercase text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">
                Urdu Business Name / کاروبار کا نام اردو میں
              </label>
              <input
                type="text"
                placeholder="مثلاً: مصطفائی ٹریڈرز"
                value={settings.company_name_urdu}
                onChange={(e) => setSettings({ ...settings, company_name_urdu: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Address / Location (Printed on Bills)
            </label>
            <input
              type="text"
              placeholder="e.g. Chandani Chowk, Sankhtra Road Dhamthal"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2 sm:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Numbers / فون نمبرز (رابطہ نمبر)
              </label>
              <input
                type="text"
                placeholder="0303-4942537 / 0300-7101761"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">
                Default Salesman / سیلزمین کا نام
              </label>
              <input
                type="text"
                placeholder="e.g. Jabar Shoukat"
                value={settings.salesman_name}
                onChange={(e) => setSettings({ ...settings, salesman_name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Receipt Footer Note / رسید کے نیچے کا پیغام
            </label>
            <input
              type="text"
              placeholder="Thank you for your business / شکریہ، آپ کے تعاون کا بہت شکریہ"
              value={settings.receipt_footer}
              onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings / محفوظ کریں</span>
            </button>
          </div>
        </form>

        {/* Database Backup & Restore */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-xs space-y-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Database Backup & Transfer / ڈیٹا بیک اپ و منتقلی
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Download your complete data (all products, khata balances, and bills) to transfer to another phone or PC.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center gap-2 shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup (.json) / بیک اپ فائل ڈاؤنلوڈ</span>
            </button>

            <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-2 border border-slate-200 cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Restore Backup / فائل سے بحال کریں</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
