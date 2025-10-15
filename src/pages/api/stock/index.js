// pages/api/stock/index.js
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "stock.json");

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 10000;

export default function handler(req, res) {
  const now = Date.now();

  try {
    if (req.method === "GET") {
      if (cache.data && now - cache.timestamp < CACHE_TTL) {
        console.log("⚡ Serving /api/stock from Memory Cache");
        return res.status(200).json(cache.data);
      }

      const jsonData = fs.readFileSync(filePath, "utf8");
      const stock = JSON.parse(jsonData);
      cache = { data: stock, timestamp: now };
      console.log("🧠 Stock cache refreshed");
      return res.status(200).json(stock);
    }

    if (req.method === "POST") {
      const stock = cache.data || JSON.parse(fs.readFileSync(filePath, "utf8"));
      const newStock = req.body;

      if (!newStock || typeof newStock !== "object") {
        return res.status(400).json({ message: "Invalid request body" });
      }

      newStock.id = stock.length ? Math.max(...stock.map(s => s.id)) + 1 : 1;
      const updatedStock = [...stock, newStock];

      fs.writeFileSync(filePath, JSON.stringify(updatedStock, null, 2), "utf8");

      cache = { data: updatedStock, timestamp: Date.now() };
      console.log("🧩 Cache updated after POST /api/stock");

      return res.status(201).json(newStock);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("❌ Error in /api/stock:", error);
    return res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
}
