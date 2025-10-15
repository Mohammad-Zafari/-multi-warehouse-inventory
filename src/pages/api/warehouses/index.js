import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "warehouses.json");

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 10000;

export default function handler(req, res) {
  const now = Date.now();

  try {
    if (req.method === "GET") {
      if (cache.data && now - cache.timestamp < CACHE_TTL) {
        console.log("⚡ Serving /api/warehouses from Memory Cache");
        return res.status(200).json(cache.data);
      }

      const jsonData = fs.readFileSync(filePath, "utf8");
      const warehouses = JSON.parse(jsonData);

      cache = { data: warehouses, timestamp: now };
      console.log("🧠 Warehouses cache refreshed");

      return res.status(200).json(warehouses);
    }

    if (req.method === "POST") {
      const warehouses =
        cache.data || JSON.parse(fs.readFileSync(filePath, "utf8"));

      const newWarehouse = req.body;
      if (!newWarehouse || typeof newWarehouse !== "object") {
        return res.status(400).json({ message: "Invalid request body." });
      }

      newWarehouse.id = warehouses.length
        ? Math.max(...warehouses.map((w) => w.id)) + 1
        : 1;

      const updatedWarehouses = [...warehouses, newWarehouse];
      fs.writeFileSync(
        filePath,
        JSON.stringify(updatedWarehouses, null, 2),
        "utf8"
      );

      cache = { data: updatedWarehouses, timestamp: Date.now() };
      console.log("🧩 Warehouses cache updated after POST");

      return res.status(201).json(newWarehouse);
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("❌ Error in /api/warehouses:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
  }
}
