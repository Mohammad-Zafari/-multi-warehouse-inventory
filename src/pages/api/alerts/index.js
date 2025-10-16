import fs from "fs";
import path from "path";

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 5000;

const determineStatus = (quantity, reorderPoint) => {
  if (quantity <= 0) return "critical";
  if (quantity < reorderPoint) return "low";
  if (quantity <= reorderPoint * 2) return "adequate";
  return "overstocked";
};

const calcReorderQty = (qty, reorderPoint) =>
  Math.max(reorderPoint * 2 - qty, reorderPoint);

export default function handler(req, res) {
  const now = Date.now();
  const base = path.join(process.cwd(), "data");
  const alertsPath = path.join(base, "alerts.json");
  const stockPath = path.join(base, "stock.json");
  const productsPath = path.join(base, "products.json");
  const warehousesPath = path.join(base, "warehouses.json");
  const historyPath = path.join(base, "alert_history.json"); // 🔹 مسیر تاریخچه

  if (req.method === "GET") {
    if (cache.data && now - cache.timestamp < CACHE_TTL)
      return res.status(200).json(cache.data);

    try {
      const stock = JSON.parse(fs.readFileSync(stockPath, "utf8"));
      const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
      const warehouses = JSON.parse(fs.readFileSync(warehousesPath, "utf8"));
      const stored = fs.existsSync(alertsPath)
        ? JSON.parse(fs.readFileSync(alertsPath, "utf8"))
        : [];

      const result = [];

      stock.forEach((s) => {
        const p = products.find((x) => x.id === s.productId);
        const w = warehouses.find((x) => x.id === s.warehouseId);
        if (!p || !w) return;

        const status = determineStatus(s.quantity, p.reorderPoint);
        if (status === "adequate" || status === "overstocked") return;

        const reorderQty = calcReorderQty(s.quantity, p.reorderPoint);
        const existing = stored.find(
          (a) =>
            a.productId === p.id &&
            a.warehouseId === w.id &&
            a.status === status &&
            a.action !== "reordered"
        );
        if (existing) result.push({ ...existing, reorderQty });
        else
          result.push({
            id: `${p.id}-${w.id}-${status}`,
            productId: p.id,
            warehouseId: w.id,
            productName: p.name,
            warehouseName: w.name,
            status,
            quantity: s.quantity,
            reorderQty,
            action: "pending",
          });
      });

      fs.writeFileSync(alertsPath, JSON.stringify(result, null, 2), "utf8");
      cache = { data: result, timestamp: now };
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { id, actionType } = req.body;
      const alerts = fs.existsSync(alertsPath)
        ? JSON.parse(fs.readFileSync(alertsPath, "utf8"))
        : [];

      let updatedAlerts = alerts.map((a) =>
        a.id === id
          ? {
              ...a,
              action:
                actionType === "resolved"
                  ? "resolved"
                  : actionType === "reordered"
                  ? "reordered"
                  : a.action,
            }
          : a
      );

      if (actionType === "reordered") {
        const stock = JSON.parse(fs.readFileSync(stockPath, "utf8"));
        const alertItem = alerts.find((a) => a.id === id);
        if (alertItem) {
          const idx = stock.findIndex(
            (s) =>
              s.productId === alertItem.productId &&
              s.warehouseId === alertItem.warehouseId
          );
          if (idx >= 0) {
            stock[idx].quantity += Number(alertItem.reorderQty);
          } else {
            stock.push({
              productId: alertItem.productId,
              warehouseId: alertItem.warehouseId,
              quantity: Number(alertItem.reorderQty),
            });
          }
          fs.writeFileSync(stockPath, JSON.stringify(stock, null, 2), "utf8");

          // 🔹 ثبت در تاریخچه سفارش‌ها
          let history = [];
          if (fs.existsSync(historyPath)) {
            const content = fs.readFileSync(historyPath, "utf8");
            history = content ? JSON.parse(content) : [];
          }
          history.push({
            timestamp: new Date().toISOString(),
            product: alertItem.productName,
            warehouse: alertItem.warehouseName,
            orderedQty: Number(alertItem.reorderQty),
            action: "reordered",
          });
          fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf8");
        }
      }

      fs.writeFileSync(alertsPath, JSON.stringify(updatedAlerts, null, 2), "utf8");
      cache = { data: updatedAlerts, timestamp: now };
      res.status(200).json({ success: true, updated: updatedAlerts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "DELETE") {
    fs.writeFileSync(alertsPath, JSON.stringify([], null, 2), "utf8");
    cache = { data: [], timestamp: now };
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
