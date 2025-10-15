import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "warehouses.json");

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 10000;

export default function handler(req, res) {
  const { id } = req.query;
  const now = Date.now();

  try {
    if (req.method === "GET") {
      if (cache.data && now - cache.timestamp < CACHE_TTL) {
        console.log("⚡ Serving /api/warehouses/[id] from Memory Cache");
        const warehouse = cache.data.find((w) => w.id === parseInt(id));
        if (warehouse) return res.status(200).json(warehouse);
        return res.status(404).json({ message: "Warehouse not found" });
      }

      const warehouses = JSON.parse(fs.readFileSync(filePath, "utf8"));
      cache = { data: warehouses, timestamp: now };
      console.log("🧠 Warehouses cache refreshed");

      const warehouse = warehouses.find((w) => w.id === parseInt(id));
      if (warehouse) return res.status(200).json(warehouse);
      return res.status(404).json({ message: "Warehouse not found" });
    }

    if (req.method === "PUT") {
      const warehouses = cache.data || JSON.parse(fs.readFileSync(filePath, "utf8"));
      const index = warehouses.findIndex((w) => w.id === parseInt(id));
      if (index === -1) return res.status(404).json({ message: "Warehouse not found" });

      warehouses[index] = { ...warehouses[index], ...req.body, id: parseInt(id) };
      fs.writeFileSync(filePath, JSON.stringify(warehouses, null, 2), "utf8");

      cache = { data: warehouses, timestamp: Date.now() };
      console.log("🧩 Warehouses cache updated after PUT");
      return res.status(200).json(warehouses[index]);
    }

    if (req.method === "DELETE") {
      const warehouses = cache.data || JSON.parse(fs.readFileSync(filePath, "utf8"));
      const index = warehouses.findIndex((w) => w.id === parseInt(id));
      if (index === -1) return res.status(404).json({ message: "Warehouse not found" });

      warehouses.splice(index, 1);
      fs.writeFileSync(filePath, JSON.stringify(warehouses, null, 2), "utf8");

      cache = { data: warehouses, timestamp: Date.now() };
      console.log("🚮 Warehouses cache updated after DELETE");
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("❌ Error in /api/warehouses/[id]:", error);
    return res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
}
