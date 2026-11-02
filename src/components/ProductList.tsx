"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Boxes,
  AlertTriangle,
  X,
  Boxes as StockIcon
} from "lucide-react";
import { Storage, Product } from "@/lib/storage";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [nameUrdu, setNameUrdu] = useState("");
  const [category, setCategory] = useState("Snacks & Chips");
  const [retailPrice, setRetailPrice] = useState("");
  const [ctnSize, setCtnSize] = useState("12");
  const [rateCtn, setRateCtn] = useState("");
  const [ratePcs, setRatePcs] = useState("");
  const [stockCtn, setStockCtn] = useState("0");
  const [stockPcs, setStockPcs] = useState("0");
  const [defaultDisc, setDefaultDisc] = useState("0");

  // Stock Adjustment Form
  const [stockAddCtn, setStockAddCtn] = useState("");
  const [stockAddPcs, setStockAddPcs] = useState("");

  const refreshData = () => {
    setProducts(Storage.getProducts());
    setCategories(Storage.getCategories());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setCode("");
    setName("");
    setNameUrdu("");
    setCategory(categories[0] || "Snacks & Chips");
    setRetailPrice("");
    setCtnSize("12");
    setRateCtn("");
    setRatePcs("");
    setStockCtn("0");
    setStockPcs("0");
    setDefaultDisc("0");
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setCode(p.code || "");
    setName(p.name);
    setNameUrdu(p.name_urdu || "");
    setCategory(p.category);
    setRetailPrice(p.retail_price ? p.retail_price.toString() : "");
    setCtnSize(p.ctn_size ? p.ctn_size.toString() : "12");
    setRateCtn(p.rate_ctn ? p.rate_ctn.toString() : "");
    setRatePcs(p.rate_pcs ? p.rate_pcs.toString() : "");
    setStockCtn(p.stock_ctn ? p.stock_ctn.toString() : "0");
    setStockPcs(p.stock_pcs ? p.stock_pcs.toString() : "0");
    setDefaultDisc(p.default_disc ? p.default_disc.toString() : "0");
    setIsAddModalOpen(true);
  };

  const openStockModal = (p: Product) => {
    setStockProduct(p);
    setStockAddCtn("");
    setStockAddPcs("");
    setIsStockModalOpen(true);
  };

  const handleRateCtnChange = (val: string) => {
    setRateCtn(val);
    const numCtn = parseFloat(val);
    const size = parseFloat(ctnSize);
    if (!isNaN(numCtn) && !isNaN(size) && size > 0) {
      setRatePcs((numCtn / size).toFixed(2));
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    Storage.saveProduct({
      id: editingProduct?.id,
      code,
      name: name.toUpperCase().trim(),
      name_urdu: nameUrdu.trim(),
      category,
      retail_price: Number(retailPrice) || 0,
      ctn_size: Number(ctnSize) || 12,
      rate_ctn: Number(rateCtn) || 0,
      rate_pcs: Number(ratePcs) || 0,
      stock_ctn: Number(stockCtn) || 0,
      stock_pcs: Number(stockPcs) || 0,
      default_disc: Number(defaultDisc) || 0,
      min_stock_alert: 5,
    });

    setIsAddModalOpen(false);
    refreshData();
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;

    Storage.adjustStock(
      stockProduct.id,
      Number(stockAddCtn) || 0,
      Number(stockAddPcs) || 0
    );

    setIsStockModalOpen(false);
    refreshData();
  };

  const handleDeleteProduct = (id: number) => {
    if (!confirm("Are you sure you want to delete this product? / کیا آپ یہ پروڈکٹ ڈیلیٹ کرنا چاہتے ہیں؟")) return;
    Storage.deleteProduct(id);
    refreshData();
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      (p.name_urdu && p.name_urdu.includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q);
    const matchCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalCartonsInStock = products.reduce((sum, p) => sum + (Number(p.stock_ctn) || 0), 0);

  return (
    <div className="p-3 sm:p-5 max-w-4xl mx-auto pb-28 text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span>Product & Stock Management</span>
            <span className="text-sm font-normal text-slate-500">/ پروڈکٹ و اسٹاک لسٹ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage wholesale rates, packaging, retail prices and warehouse stock inventory
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl text-sm shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product / نئی پروڈکٹ</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Products / کل پروڈکٹس</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{products.length} Items</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Warehouse Stock / کل کاٹن اسٹاک</span>
          <span className="text-2xl font-bold text-blue-600 mt-1 block font-mono">{totalCartonsInStock} Ctn</span>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Low Stock Alert / کم اسٹاک الرٹ</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block font-mono">
              {products.filter((p) => p.stock_ctn <= (p.min_stock_alert || 5)).length} Items
            </span>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
      </div>

      {/* Search & Categories */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 mb-4 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, Urdu, SKU or category / تلاش کریں..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition ${
              selectedCategory === "All"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Categories / تمام
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Cards */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-6">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-700 text-base">No Products Found / کوئی پروڈکٹ نہیں ملی</h3>
          <p className="text-xs text-slate-400 mt-1">Add your snacks, nimko, or wholesale goods.</p>
          <button
            onClick={openAddModal}
            className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
          >
            + Add Product Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((p) => {
            const isLowStock = p.stock_ctn <= (p.min_stock_alert || 5);
            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {p.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{p.code}</span>
                    {isLowStock && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 tracking-tight">
                    {p.name}
                    {p.name_urdu && <span className="font-normal text-slate-500 text-sm ml-2">({p.name_urdu})</span>}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1.5 font-mono">
                    <span>
                      Ctn Rate: <strong className="text-slate-900 font-semibold">Rs {p.rate_ctn.toFixed(2)}</strong>
                    </span>
                    <span>•</span>
                    <span>Piece Rate: Rs {p.rate_pcs.toFixed(2)}</span>
                    <span>•</span>
                    <span>Pack: {p.ctn_size} Pcs/Ctn</span>
                    <span>•</span>
                    <span>MRP: Rs {p.retail_price}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-none border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 font-medium uppercase block">Stock:</span>
                    <span className={`font-mono font-bold text-sm ${p.stock_ctn > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                      {p.stock_ctn} Ctn {p.stock_pcs > 0 ? `+ ${p.stock_pcs} Pcs` : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openStockModal(p)}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                      title="Add Stock / مزید کاٹن لوڈ کریں"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>+ Stock</span>
                    </button>

                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 text-slate-900 shadow-2xl my-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {editingProduct ? "Edit Product / پروڈکٹ میں تبدیلی" : "Add New Product / نئی پروڈکٹ"}
                </h3>
                <p className="text-xs text-slate-500">Configure prices, pack sizes, and stock inventory</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nimko Special 50g"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Urdu Name / نام اردو میں</label>
                  <input
                    type="text"
                    placeholder="مثلاً: نمکو اسپیشل"
                    value={nameUrdu}
                    onChange={(e) => setNameUrdu(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category / کیٹیگری</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="General">General / عام</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barcode / SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. P-105"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pack Size (Pcs/Ctn)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="12"
                    value={ctnSize}
                    onChange={(e) => {
                      setCtnSize(e.target.value);
                      if (rateCtn && e.target.value) {
                        setRatePcs((parseFloat(rateCtn) / parseFloat(e.target.value)).toFixed(2));
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Retail Price (MRP)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Disc %</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1.55"
                    value={defaultDisc}
                    onChange={(e) => setDefaultDisc(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Wholesale Rate/Carton (Rs) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1080.00"
                    value={rateCtn}
                    onChange={(e) => handleRateCtnChange(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Rate per Piece (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="90.00"
                    value={ratePcs}
                    onChange={(e) => setRatePcs(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cartons in Stock / موجودہ کاٹن</label>
                  <input
                    type="number"
                    min="0"
                    value={stockCtn}
                    onChange={(e) => setStockCtn(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loose Pieces / کھلے پیس</label>
                  <input
                    type="number"
                    min="0"
                    value={stockPcs}
                    onChange={(e) => setStockPcs(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl"
                >
                  Cancel / منسوخ
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Product / محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isStockModalOpen && stockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 text-slate-900 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Add Stock / گودام اسٹاک اندراج</h3>
                <p className="text-xs text-blue-600 font-semibold uppercase">{stockProduct.name}</p>
              </div>
              <button onClick={() => setIsStockModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-3 text-xs flex justify-between font-mono">
              <span className="text-slate-500">Current In Stock:</span>
              <strong className="text-slate-900 font-bold">
                {stockProduct.stock_ctn} Ctn + {stockProduct.stock_pcs} Pcs
              </strong>
            </div>

            <form onSubmit={handleAddStock} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Add Cartons (+ Ctn) / مزید کاٹن
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stockAddCtn}
                  onChange={(e) => setStockAddCtn(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-mono text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Add Loose Pieces (+ Pcs) / مزید کھلے پیس
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stockAddPcs}
                  onChange={(e) => setStockAddPcs(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-mono text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl"
                >
                  Cancel / منسوخ
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Stock / محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
