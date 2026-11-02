"use client";

export interface CompanySettings {
  company_name: string;
  company_name_urdu: string;
  address: string;
  phone: string;
  salesman_name: string;
  currency: string;
  receipt_footer: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  name_urdu?: string;
  category: string;
  retail_price: number;
  ctn_size: number;
  rate_ctn: number;
  rate_pcs: number;
  stock_ctn: number;
  stock_pcs: number;
  min_stock_alert: number;
  default_disc: number;
}

export interface Customer {
  id: number;
  code: string;
  name: string;
  name_urdu?: string;
  phone: string;
  route_name?: string;
  address?: string;
  balance: number;
  credit_limit: number;
}

export interface InvoiceItem {
  id?: number;
  product_id?: number;
  product_name: string;
  ctn_size: number;
  rate_pcs: number;
  rate_ctn: number;
  ctn: number;
  pcs: number;
  bns: number;
  tr_offer: number;
  disc_pct: number;
  gst_pct: number;
  line_total: number;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  invoice_date: string;
  customer_id: number;
  customer_name: string;
  customer_code: string;
  customer_area?: string;
  salesman?: string;
  previous_balance: number;
  gross_total: number;
  invoice_disc_pct: number;
  invoice_disc_val: number;
  freight: number;
  cash_received: number;
  current_balance: number;
  total_balance: number;
  notes?: string;
  items: InvoiceItem[];
  created_at: string;
}

export interface Payment {
  id: number;
  customer_id: number;
  amount: number;
  payment_date: string;
  payment_type: string;
  notes?: string;
  created_at: string;
}

const STORAGE_KEYS = {
  SETTINGS: "mustafai_settings",
  PRODUCTS: "mustafai_products",
  CUSTOMERS: "mustafai_customers",
  INVOICES: "mustafai_invoices",
  PAYMENTS: "mustafai_payments",
  CATEGORIES: "mustafai_categories",
};

// Initial Seed Data
const DEFAULT_SETTINGS: CompanySettings = {
  company_name: "MUSTAFAI TRADERS",
  company_name_urdu: "مصطفائی ٹریڈرز",
  address: "CHANDANI CHOWK SANKHTRA ROAD DHAMTHAL",
  phone: "0303-4942537 / 0300-7101761 / 0308-6137732",
  salesman_name: "Jabar Shoukat",
  currency: "Rs",
  receipt_footer: "Thank you for your business / شکریہ، آپ کے تعاون کا بہت شکریہ",
};

const DEFAULT_CATEGORIES = [
  "Snacks & Chips",
  "Nimko & Daal",
  "Biscuits & Bakery",
  "Confectionery",
  "Papad & Snacks",
  "General Items",
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, code: "P-101", name: "ALLO GOBIRS RS 10", name_urdu: "آلو گوبھی چپس", category: "Snacks & Chips", retail_price: 10, ctn_size: 6, rate_ctn: 579.96, rate_pcs: 96.66, stock_ctn: 25, stock_pcs: 0, min_stock_alert: 5, default_disc: 1.55 },
  { id: 2, code: "P-102", name: "SHAIDU CHASKA RS 10", name_urdu: "شیدو چسکا", category: "Snacks & Chips", retail_price: 10, ctn_size: 6, rate_ctn: 579.96, rate_pcs: 96.66, stock_ctn: 30, stock_pcs: 0, min_stock_alert: 5, default_disc: 1.55 },
  { id: 3, code: "P-103", name: "MASTER BIRYANI RS 10", name_urdu: "ماسٹر بریانی چپس", category: "Snacks & Chips", retail_price: 10, ctn_size: 6, rate_ctn: 579.96, rate_pcs: 96.66, stock_ctn: 20, stock_pcs: 0, min_stock_alert: 5, default_disc: 1.55 },
  { id: 4, code: "P-104", name: "GUPSHAP RS 10", name_urdu: "گپ شپ", category: "Snacks & Chips", retail_price: 10, ctn_size: 6, rate_ctn: 579.96, rate_pcs: 96.66, stock_ctn: 40, stock_pcs: 0, min_stock_alert: 5, default_disc: 1.72 },
  { id: 5, code: "P-105", name: "MASTI CHASKA RS 10", name_urdu: "مستی چسکا", category: "Snacks & Chips", retail_price: 10, ctn_size: 6, rate_ctn: 579.96, rate_pcs: 96.66, stock_ctn: 15, stock_pcs: 0, min_stock_alert: 5, default_disc: 1.55 },
  { id: 6, code: "P-106", name: "CHASKA MASKA PAPR RS 10", name_urdu: "چسکا مسکا پاپڑ", category: "Papad & Snacks", retail_price: 10, ctn_size: 6, rate_ctn: 580.02, rate_pcs: 96.67, stock_ctn: 35, stock_pcs: 0, min_stock_alert: 5, default_disc: 5.00 },
  { id: 7, code: "P-107", name: "PATATO STICKS RS 30", name_urdu: "پوٹیٹو اسٹکس 30 والی", category: "Snacks & Chips", retail_price: 30, ctn_size: 36, rate_ctn: 969.84, rate_pcs: 26.94, stock_ctn: 18, stock_pcs: 0, min_stock_alert: 5, default_disc: 0.00 },
  { id: 8, code: "P-108", name: "NIMKO RS 50", name_urdu: "نمکو 50 روپے والی", category: "Nimko & Daal", retail_price: 50, ctn_size: 24, rate_ctn: 1080.00, rate_pcs: 45.00, stock_ctn: 50, stock_pcs: 0, min_stock_alert: 10, default_disc: 2.00 },
  { id: 9, code: "P-109", name: "NIMKO RS 100", name_urdu: "نمکو 100 روپے والی", category: "Nimko & Daal", retail_price: 100, ctn_size: 12, rate_ctn: 1080.00, rate_pcs: 90.00, stock_ctn: 30, stock_pcs: 0, min_stock_alert: 5, default_disc: 2.00 },
  { id: 10, code: "P-110", name: "PEANUT RS 50", name_urdu: "مونگ پھلی پینٹ 50 والی", category: "Nimko & Daal", retail_price: 50, ctn_size: 24, rate_ctn: 1100.00, rate_pcs: 45.83, stock_ctn: 22, stock_pcs: 0, min_stock_alert: 5, default_disc: 2.00 },
  { id: 11, code: "P-111", name: "PEANUT RS 100", name_urdu: "مونگ پھلی پینٹ 100 والی", category: "Nimko & Daal", retail_price: 100, ctn_size: 12, rate_ctn: 1100.00, rate_pcs: 91.66, stock_ctn: 15, stock_pcs: 0, min_stock_alert: 5, default_disc: 2.00 },
  { id: 12, code: "P-112", name: "DAAL MOONG RS 20", name_urdu: "دال مونگ 20 والی", category: "Nimko & Daal", retail_price: 20, ctn_size: 48, rate_ctn: 864.00, rate_pcs: 18.00, stock_ctn: 40, stock_pcs: 0, min_stock_alert: 8, default_disc: 1.50 },
  { id: 13, code: "P-113", name: "DAAL MOONG RS 50", name_urdu: "دال مونگ 50 والی", category: "Nimko & Daal", retail_price: 50, ctn_size: 24, rate_ctn: 1080.00, rate_pcs: 45.00, stock_ctn: 25, stock_pcs: 0, min_stock_alert: 5, default_disc: 2.00 },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 1, code: "2614", name: "TAHRI SCHOOL CANTEEN", name_urdu: "طاہری اسکول کینٹین", phone: "03001234567", route_name: "Pindi Bohri Tabish", address: "PINDI BOHRI TABISH - SUPANWAL STOP", balance: 31957.0, credit_limit: 50000 },
  { id: 2, code: "2615", name: "AL-MADINA KARYANA STORE", name_urdu: "المدینہ کریانہ اسٹور", phone: "03019876543", route_name: "Chandani Chowk", address: "CHANDANI CHOWK DHAMTHAL", balance: 14500.0, credit_limit: 40000 },
  { id: 3, code: "2616", name: "BISMILLAH GENERAL STORE", name_urdu: "بسم اللہ جنرل اسٹور", phone: "03055554443", route_name: "Sankhtra Road", address: "SANKHTRA ROAD MAIN STOP", balance: 8200.0, credit_limit: 30000 },
  { id: 4, code: "2617", name: "IQBAL TRADERS & SNACKS", name_urdu: "اقبال ٹریڈرز", phone: "03081122334", route_name: "Kotla Stop", address: "KOTLA STOP MARKET", balance: 45000.0, credit_limit: 80000 },
  { id: 5, code: "2618", name: "ASIF CONFECTIONERY", name_urdu: "آصف کنفیکشنری", phone: "03024466880", route_name: "Main Bazaar", address: "MAIN BAZAAR CANTEEN", balance: 5300.0, credit_limit: 25000 },
];

// Helper to get from LocalStorage safely
function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

export const Storage = {
  getSettings(): CompanySettings {
    return getStorage<CompanySettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(settings: CompanySettings): void {
    setStorage(STORAGE_KEYS.SETTINGS, settings);
  },

  getCategories(): string[] {
    return getStorage<string[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },

  addCategory(name: string): void {
    const cats = this.getCategories();
    if (!cats.includes(name)) {
      cats.push(name);
      setStorage(STORAGE_KEYS.CATEGORIES, cats);
    }
  },

  getProducts(): Product[] {
    return getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  },

  saveProduct(product: Omit<Product, "id"> & { id?: number }): Product {
    const products = this.getProducts();
    if (product.id) {
      const idx = products.findIndex((p) => p.id === product.id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...product };
        setStorage(STORAGE_KEYS.PRODUCTS, products);
        return products[idx];
      }
    }
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const created: Product = {
      ...product,
      id: newId,
      code: product.code || `P-${newId + 100}`,
      min_stock_alert: product.min_stock_alert || 5,
    };
    products.push(created);
    setStorage(STORAGE_KEYS.PRODUCTS, products);
    return created;
  },

  deleteProduct(id: number): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.PRODUCTS, products);
  },

  adjustStock(productId: number, ctnChange: number, pcsChange: number): Product | null {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx === -1) return null;
    products[idx].stock_ctn = Math.max(0, products[idx].stock_ctn + ctnChange);
    products[idx].stock_pcs = Math.max(0, products[idx].stock_pcs + pcsChange);
    setStorage(STORAGE_KEYS.PRODUCTS, products);
    return products[idx];
  },

  getCustomers(): Customer[] {
    return getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  },

  saveCustomer(customer: Omit<Customer, "id"> & { id?: number }): Customer {
    const customers = this.getCustomers();
    if (customer.id) {
      const idx = customers.findIndex((c) => c.id === customer.id);
      if (idx !== -1) {
        customers[idx] = { ...customers[idx], ...customer };
        setStorage(STORAGE_KEYS.CUSTOMERS, customers);
        return customers[idx];
      }
    }
    const newId = customers.length > 0 ? Math.max(...customers.map((c) => c.id)) + 1 : 1;
    const created: Customer = {
      ...customer,
      id: newId,
      code: customer.code || `C-${newId + 2610}`,
      credit_limit: customer.credit_limit || 50000,
      balance: customer.balance || 0,
    };
    customers.push(created);
    setStorage(STORAGE_KEYS.CUSTOMERS, customers);
    return created;
  },

  deleteCustomer(id: number): void {
    const customers = this.getCustomers().filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CUSTOMERS, customers);
  },

  recordCustomerPayment(customerId: number, amount: number, notes: string = ""): Customer | null {
    const customers = this.getCustomers();
    const idx = customers.findIndex((c) => c.id === customerId);
    if (idx === -1) return null;

    customers[idx].balance = Math.max(0, customers[idx].balance - amount);
    setStorage(STORAGE_KEYS.CUSTOMERS, customers);

    const payments = getStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
    const now = new Date();
    const dateStr = `${now.toLocaleDateString("en-PK")} | ${now.toLocaleTimeString("en-US", { hour12: true })}`;
    payments.unshift({
      id: Date.now(),
      customer_id: customerId,
      amount,
      payment_date: dateStr,
      payment_type: "cash",
      notes,
      created_at: now.toISOString(),
    });
    setStorage(STORAGE_KEYS.PAYMENTS, payments);

    return customers[idx];
  },

  getInvoices(): Invoice[] {
    return getStorage<Invoice[]>(STORAGE_KEYS.INVOICES, []);
  },

  createInvoice(payload: {
    customer_id: number;
    salesman?: string;
    invoice_disc_pct?: number;
    freight?: number;
    cash_received?: number;
    notes?: string;
    items: {
      product_id: number;
      product_name: string;
      ctn_size: number;
      rate_ctn: number;
      rate_pcs: number;
      ctn: number;
      pcs: number;
      bns: number;
      tr_offer: number;
      disc_pct: number;
      gst_pct: number;
    }[];
  }): Invoice {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === payload.customer_id);
    if (!customer) throw new Error("Customer not found");

    const settings = this.getSettings();
    const invoices = this.getInvoices();

    // Next sequential invoice number (starting 6786 style or auto increment)
    let nextNum = 6786;
    if (invoices.length > 0) {
      const parsed = parseInt(invoices[0].invoice_no, 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }
    const invoiceNo = String(nextNum);

    const now = new Date();
    const invoiceDate = `${now.toLocaleDateString("en-PK")} | ${now.toLocaleTimeString("en-US", { hour12: true })}`;

    let grossTotal = 0;
    const processedItems: InvoiceItem[] = payload.items.map((it) => {
      const base = (it.ctn * it.rate_ctn) + (it.pcs * it.rate_pcs);
      const discount = (base * (it.disc_pct / 100)) + it.tr_offer;
      let lineTotal = Math.max(0, base - discount);
      if (it.gst_pct > 0) lineTotal += lineTotal * (it.gst_pct / 100);
      lineTotal = Math.round(lineTotal * 100) / 100;
      grossTotal += lineTotal;

      return {
        ...it,
        line_total: lineTotal,
      };
    });

    grossTotal = Math.round(grossTotal * 100) / 100;
    const invoiceDiscVal = Math.round((grossTotal * ((payload.invoice_disc_pct || 0) / 100)) * 100) / 100;
    const netTotal = Math.max(0, Math.round((grossTotal - invoiceDiscVal + Number(payload.freight || 0)) * 100) / 100);

    const previousBalance = customer.balance || 0;
    const cashRec = Number(payload.cash_received) || 0;
    const currentBalance = Math.round((netTotal - cashRec) * 100) / 100;
    const totalBalance = Math.round((previousBalance + currentBalance) * 100) / 100;

    const newInvoice: Invoice = {
      id: Date.now(),
      invoice_no: invoiceNo,
      invoice_date: invoiceDate,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_code: customer.code,
      customer_area: customer.address || customer.route_name,
      salesman: payload.salesman || settings.salesman_name,
      previous_balance: previousBalance,
      gross_total: grossTotal,
      invoice_disc_pct: payload.invoice_disc_pct || 0,
      invoice_disc_val: invoiceDiscVal,
      freight: payload.freight || 0,
      cash_received: cashRec,
      current_balance: currentBalance,
      total_balance: totalBalance,
      notes: payload.notes || "",
      items: processedItems,
      created_at: now.toISOString(),
    };

    // Deduct stock from products
    const products = this.getProducts();
    for (const item of processedItems) {
      if (item.product_id) {
        const pIdx = products.findIndex((p) => p.id === item.product_id);
        if (pIdx !== -1) {
          products[pIdx].stock_ctn = Math.max(0, products[pIdx].stock_ctn - item.ctn);
          products[pIdx].stock_pcs = Math.max(0, products[pIdx].stock_pcs - (item.pcs + item.bns));
        }
      }
    }
    setStorage(STORAGE_KEYS.PRODUCTS, products);

    // Update customer balance
    customer.balance = totalBalance;
    const cIdx = customers.findIndex((c) => c.id === customer.id);
    if (cIdx !== -1) {
      customers[cIdx] = customer;
      setStorage(STORAGE_KEYS.CUSTOMERS, customers);
    }

    // Save invoice
    invoices.unshift(newInvoice);
    setStorage(STORAGE_KEYS.INVOICES, invoices);

    // Save payment if cash collected on spot
    if (cashRec > 0) {
      const payments = getStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
      payments.unshift({
        id: Date.now() + 1,
        customer_id: customer.id,
        amount: cashRec,
        payment_date: invoiceDate,
        payment_type: "cash",
        notes: `On-spot payment for Invoice #${invoiceNo}`,
        created_at: now.toISOString(),
      });
      setStorage(STORAGE_KEYS.PAYMENTS, payments);
    }

    return newInvoice;
  },

  deleteInvoice(id: number): void {
    const invoices = this.getInvoices();
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    // Revert customer balance
    const customers = this.getCustomers();
    const cIdx = customers.findIndex((c) => c.id === inv.customer_id);
    if (cIdx !== -1) {
      customers[cIdx].balance = Math.max(0, customers[cIdx].balance - inv.current_balance);
      setStorage(STORAGE_KEYS.CUSTOMERS, customers);
    }

    // Restore stock
    const products = this.getProducts();
    for (const item of inv.items) {
      if (item.product_id) {
        const pIdx = products.findIndex((p) => p.id === item.product_id);
        if (pIdx !== -1) {
          products[pIdx].stock_ctn += item.ctn;
          products[pIdx].stock_pcs += (item.pcs + item.bns);
        }
      }
    }
    setStorage(STORAGE_KEYS.PRODUCTS, products);

    // Remove invoice
    const updatedInvoices = invoices.filter((i) => i.id !== id);
    setStorage(STORAGE_KEYS.INVOICES, updatedInvoices);
  },

  getGodownSummary() {
    const invoices = this.getInvoices();
    const summaryMap: {
      [name: string]: {
        product_name: string;
        total_ctn: number;
        total_pcs: number;
        total_bns: number;
        total_amount: number;
      };
    } = {};

    let totalCartons = 0;
    let totalPieces = 0;
    let totalBonus = 0;
    let totalSales = 0;

    for (const inv of invoices) {
      for (const item of inv.items) {
        if (!summaryMap[item.product_name]) {
          summaryMap[item.product_name] = {
            product_name: item.product_name,
            total_ctn: 0,
            total_pcs: 0,
            total_bns: 0,
            total_amount: 0,
          };
        }
        summaryMap[item.product_name].total_ctn += item.ctn;
        summaryMap[item.product_name].total_pcs += item.pcs;
        summaryMap[item.product_name].total_bns += item.bns;
        summaryMap[item.product_name].total_amount += item.line_total;

        totalCartons += item.ctn;
        totalPieces += item.pcs;
        totalBonus += item.bns;
        totalSales += item.line_total;
      }
    }

    return {
      itemsSummary: Object.values(summaryMap).sort((a, b) => b.total_ctn - a.total_ctn),
      totalInvoices: invoices.length,
      totalCartons,
      totalPieces,
      totalBonus,
      totalSales: Math.round(totalSales * 100) / 100,
    };
  },

  exportBackup(): string {
    const data = {
      settings: this.getSettings(),
      categories: this.getCategories(),
      products: this.getProducts(),
      customers: this.getCustomers(),
      invoices: this.getInvoices(),
      payments: getStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []),
      exported_at: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) setStorage(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.categories) setStorage(STORAGE_KEYS.CATEGORIES, data.categories);
      if (data.products) setStorage(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.customers) setStorage(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.invoices) setStorage(STORAGE_KEYS.INVOICES, data.invoices);
      if (data.payments) setStorage(STORAGE_KEYS.PAYMENTS, data.payments);
      return true;
    } catch {
      return false;
    }
  },
};

