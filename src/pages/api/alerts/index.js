import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const stockFile = path.join(dataDir, "stock.json");
const productsFile = path.join(dataDir, "products.json");
const warehousesFile = path.join(dataDir, "warehouses.json");
const alertsFile = path.join(dataDir, "alerts.json");

const LOW_STOCK_THRESHOLD = 10;

/* 🧠 ---- Simple Memory Cache (RAM) ---- */
let cache = {
  data: null,      
  timestamp: 0       
};
const CACHE_TTL = 5000; 

/* --------------------------- API Handler ---------------------------- */
export default function handler(req, res) {
  const now = Date.now();

  /* --------------------------------------------------------
     GET /api/alerts — Fetch low stock list (with Memory Cache)
  --------------------------------------------------------- */
  if (req.method === "GET") {
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
      console.log("⚡ Serving /api/alerts from Memory Cache");
      return res.status(200).json(cache.data);
    }

    try {
      const stock = JSON.parse(fs.readFileSync(stockFile, "utf8"));
      const products = JSON.parse(fs.readFileSync(productsFile, "utf8"));
      const warehouses = JSON.parse(fs.readFileSync(warehousesFile, "utf8"));

      const lowStockItems = stock
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          const warehouse = warehouses.find((w) => w.id === item.warehouseId);
          const threshold = product?.reorderPoint ?? LOW_STOCK_THRESHOLD;

          return {
            ...item,
            productName: product ? product.name : "Unknown Product",
            warehouseName: warehouse ? warehouse.name : "Unknown Warehouse",
            reorderPoint: threshold,
            isLow: Number(item.quantity) < threshold,
          };
        })
        .filter((item) => item.isLow);

      fs.writeFileSync(alertsFile, JSON.stringify(lowStockItems, null, 2), "utf8");

      cache = { data: lowStockItems, timestamp: now };
      console.log("🧠 Cache refreshed at", new Date(now).toLocaleTimeString());

      return res.status(200).json(lowStockItems);
    } catch (err) {
      console.error("❌ Error while generating alerts:", err);
      return res.status(500).json({ message: "Error generating alerts." });
    }
  }

  /* ----------------------------------------------------------
     DELETE /api/alerts?id=productId-warehouseId — Dismiss alert
  ----------------------------------------------------------- */
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "Missing alert id." });

      const alerts = cache.data || JSON.parse(fs.readFileSync(alertsFile, "utf8"));
      const updatedAlerts = alerts.filter(
        (a) => `${a.productId}-${a.warehouseId}` !== id
      );

      fs.writeFileSync(alertsFile, JSON.stringify(updatedAlerts, null, 2), "utf8");

      cache = { data: updatedAlerts, timestamp: Date.now() };

      console.log("🗑️ Alert removed & Cache updated:", id);
      return res.status(200).json({ success: true, alerts: updatedAlerts });
    } catch (err) {
      console.error("❌ Error deleting alert:", err);
      return res.status(500).json({ message: "Error deleting alert." });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
