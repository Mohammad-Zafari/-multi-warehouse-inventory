import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const stockFile = path.join(dataDir, "stock.json");
const transferFile = path.join(dataDir, "transfers.json");

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 10000;

export default function handler(req, res) {
  const now = Date.now();

  if (req.method === "GET") {
    try {
      if (cache.data && now - cache.timestamp < CACHE_TTL) {
        console.log("⚡ Serving transfers from Memory Cache");
        return res.status(200).json(cache.data);
      }

      if (!fs.existsSync(transferFile)) {
        fs.writeFileSync(transferFile, "[]", "utf8");
      }

      const history = JSON.parse(fs.readFileSync(transferFile, "utf8"));
      cache = { data: history, timestamp: now };
      console.log("🧠 Transfers cache refreshed");

      return res.status(200).json(history);
    } catch (error) {
      console.error("❌ Error reading transfers:", error);
      return res.status(500).json({ message: "Cannot read transfer history." });
    }
  }

  if (req.method === "POST") {
    try {
      const { fromWarehouseId, toWarehouseId, productId, quantity } = req.body;

      if (!fromWarehouseId || !toWarehouseId || !productId || !quantity) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      if (fromWarehouseId === toWarehouseId) {
        return res.status(400).json({ message: "Source and destination cannot be the same." });
      }

      if (!fs.existsSync(stockFile)) {
        return res.status(500).json({ message: "Stock file not found." });
      }

      const stockData = JSON.parse(fs.readFileSync(stockFile, "utf8"));

      const sourceIndex = stockData.findIndex(
        (s) =>
          Number(s.warehouseId) === Number(fromWarehouseId) &&
          Number(s.productId) === Number(productId)
      );
      const destIndex = stockData.findIndex(
        (s) =>
          Number(s.warehouseId) === Number(toWarehouseId) &&
          Number(s.productId) === Number(productId)
      );

      if (sourceIndex === -1) {
        return res.status(404).json({ message: "Source warehouse does not contain this product." });
      }

      if (Number(stockData[sourceIndex].quantity) < Number(quantity)) {
        return res.status(400).json({ message: "Insufficient stock in source warehouse." });
      }

      stockData[sourceIndex].quantity -= Number(quantity);
      if (destIndex >= 0) {
        stockData[destIndex].quantity += Number(quantity);
      } else {
        stockData.push({
          id: stockData.length + 1,
          warehouseId: Number(toWarehouseId),
          productId: Number(productId),
          quantity: Number(quantity),
        });
      }

      fs.writeFileSync(stockFile, JSON.stringify(stockData, null, 2), "utf8");

      let history = [];
      if (fs.existsSync(transferFile)) {
        history = JSON.parse(fs.readFileSync(transferFile, "utf8"));
      }

      const newTransfer = {
        id: history.length + 1,
        date: new Date().toISOString(),
        fromWarehouseId,
        toWarehouseId,
        productId,
        quantity: Number(quantity),
      };

      history.unshift(newTransfer);
      fs.writeFileSync(transferFile, JSON.stringify(history, null, 2), "utf8");

      cache = { data: history, timestamp: Date.now() };
      console.log("🧩 Transfer cache updated after POST");

      return res.status(200).json({
        success: true,
        message: "Transfer successful.",
        updatedStock: stockData,
      });
    } catch (error) {
      console.error("❌ Error in transfer API:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
