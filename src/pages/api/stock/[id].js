import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "stock.json");

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 10000;

export default function handler(req, res) {
  const { id } = req.query;
  const now = Date.now();

  try {
    if (req.method === "GET") {
      if (cache.data && now - cache.timestamp < CACHE_TTL) {
        console.log("⚡ Serving /api/stock/[id] from Memory Cache");
        const item = cache.data.find((s) => s.id === parseInt(id));
        if (item) return res.status(200).json(item);
        return res.status(404).json({ message: "Stock item not found" });
      }

      const stock = JSON.parse(fs.readFileSync(filePath, "utf8"));
      cache = { data: stock, timestamp: now };
      console.log("🧠 Stock cache refreshed");

      const stockItem = stock.find((s) => s.id === parseInt(id));
      if (stockItem) return res.status(200).json(stockItem);
      return res.status(404).json({ message: "Stock item not found" });
    }

    if (req.method === "PUT") {
      const stock = cache.data || JSON.parse(fs.readFileSync(filePath, "utf8"));
      const index = stock.findIndex((s) => s.id === parseInt(id));
      if (index === -1) return res.status(404).json({ message: "Stock item not found" });

      stock[index] = { ...stock[index], ...req.body, id: parseInt(id) };
      fs.writeFileSync(filePath, JSON.stringify(stock, null, 2), "utf8");

      cache = { data: stock, timestamp: Date.now() };
      console.log("🧩 Stock cache updated after PUT");
      return res.status(200).json(stock[index]);
    }

    if (req.method === "DELETE") {
      const stock = cache.data || JSON.parse(fs.readFileSync(filePath, "utf8"));
      const index = stock.findIndex((s) => s.id === parseInt(id));
      if (index === -1) return res.status(404).json({ message: "Stock item not found" });

      stock.splice(index, 1);
      fs.writeFileSync(filePath, JSON.stringify(stock, null, 2), "utf8");

      cache = { data: stock, timestamp: Date.now() };
      console.log("🚮 Stock cache updated after DELETE");
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("❌ Error in /api/stock/[id]:", error);
    return res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
}
