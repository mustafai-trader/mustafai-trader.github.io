import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "invoicer.db");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

export function initDatabase() {
  db.exec(`
    -- Business Settings (Fully Dynamic)
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      company_name_urdu TEXT,
      address TEXT,
      phone TEXT,
      salesman_name TEXT,
      currency TEXT DEFAULT 'Rs',
      receipt_footer TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Routes / Beats for Salesmen
    CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Product Categories
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      name_urdu TEXT
    );

    -- Products with Full Inventory Tracking & Pricing
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      name_urdu TEXT,
      category TEXT DEFAULT 'General',
      retail_price REAL DEFAULT 0.0,       -- MRP printed on packet
      ctn_size INTEGER DEFAULT 12,          -- Pieces per carton
      rate_ctn REAL DEFAULT 0.0,           -- Wholesale rate per carton
      rate_pcs REAL DEFAULT 0.0,           -- Rate per loose piece
      stock_ctn INTEGER DEFAULT 0,         -- Available cartons in warehouse
      stock_pcs INTEGER DEFAULT 0,         -- Available loose pieces
      min_stock_alert INTEGER DEFAULT 5,   -- Low stock alert threshold
      default_disc REAL DEFAULT 0.0,       -- Default trade discount %
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Stock Movement / Adjustments History
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      movement_type TEXT NOT NULL,          -- 'purchase', 'sale', 'adjustment', 'return'
      ctn_change INTEGER DEFAULT 0,
      pcs_change INTEGER DEFAULT 0,
      reference_id TEXT,                    -- Invoice # or Purchase #
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Customers / Shops
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      name_urdu TEXT,
      phone TEXT,
      route_name TEXT,
      address TEXT,
      credit_limit REAL DEFAULT 50000.0,
      balance REAL DEFAULT 0.0,            -- Current outstanding ledger balance
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Direct Payments / Recoveries (independent or against invoice)
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_type TEXT DEFAULT 'cash',    -- 'cash', 'bank', 'cheque'
      reference_invoice_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    -- Invoices
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no TEXT UNIQUE NOT NULL,
      invoice_date TEXT NOT NULL,
      customer_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_code TEXT NOT NULL,
      customer_area TEXT,
      salesman TEXT,
      previous_balance REAL DEFAULT 0.0,
      gross_total REAL DEFAULT 0.0,
      invoice_disc_pct REAL DEFAULT 0.0,
      invoice_disc_val REAL DEFAULT 0.0,
      freight REAL DEFAULT 0.0,
      cash_received REAL DEFAULT 0.0,
      current_balance REAL DEFAULT 0.0,
      total_balance REAL DEFAULT 0.0,
      status TEXT DEFAULT 'booked',         -- 'booked', 'dispatched', 'delivered', 'cancelled'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    -- Invoice Items
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      ctn_size INTEGER DEFAULT 12,
      rate_pcs REAL DEFAULT 0.0,
      rate_ctn REAL DEFAULT 0.0,
      ctn INTEGER DEFAULT 0,
      pcs INTEGER DEFAULT 0,
      bns INTEGER DEFAULT 0,
      tr_offer REAL DEFAULT 0.0,
      disc_pct REAL DEFAULT 0.0,
      gst_pct REAL DEFAULT 0.0,
      line_total REAL DEFAULT 0.0,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );
  `);

  // Ensure default business settings exist
  const settingCheck = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
  if (settingCheck.count === 0) {
    db.prepare(`
      INSERT INTO settings (id, company_name, company_name_urdu, address, phone, salesman_name, receipt_footer)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      "default",
      "DISTRIBUTION TRADERS",
      "ڈسٹری بیوشن ٹریڈرز",
      "MAIN BAZAAR ROAD",
      "0300-1234567 / 0308-7654321",
      "Sales Representative",
      "Thank you for your business / شکریہ، آپ کے تعاون کا بہت شکریہ"
    );
  }

  // Ensure default categories exist
  const catCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  if (catCount.count === 0) {
    const insertCat = db.prepare("INSERT INTO categories (name, name_urdu) VALUES (?, ?)");
    insertCat.run("Snacks & Chips", "سنیکس و چپس");
    insertCat.run("Nimko & Daal", "نمکو و دال");
    insertCat.run("Biscuits & Bakery", "بسکٹ و بیکری");
    insertCat.run("Confectionery", "کنفیکشنری و ٹافیاں");
    insertCat.run("Beverages", "مشروبات");
    insertCat.run("General Items", "جنرل آئٹمز");
  }
}
