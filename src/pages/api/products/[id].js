import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "products.json");

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 10000;

export default function handler(req, res) {
  const { id } = req.query;
  const now = Date.now();

  try {
    if (req.method === "GET") {
      if (cache.data && now - cache.timestamp < CACHE_TTL) {
        console.log("⚡ Serving /api/products/[id] from Memory Cache");
        const product = cache.data.find((p) => p.id === parseInt(id));
        if (product) return res.status(200).json(product);
        return res.status(404).json({ message: "Product not found" });
      }

      const jsonData = fs.readFileSync(filePath, "utf8");
      const products = JSON.parse(jsonData);
      cache = { data: products, timestamp: now };
      console.log("🧠 Products cache refreshed");

      const product = products.find((p) => p.id === parseInt(id));
      if (product) return res.status(200).json(product);
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.method === "PUT") {
      const products = cache.data || JSON.parse(fs.readFileSync(filePath, "utf8"));
      const index = products.findIndex((p) => p.id === parseInt(id));
      if (index === -1) return res.status(404).json({ message: "Product not found" });

      products[index] = { ...products[index], ...req.body, id: parseInt(id) };
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf8");

      cache = { data: products, timestamp: Date.now() };
      console.log("🧩 Products cache updated after PUT");
      return res.status(200).json(products[index]);
    }

    if (req.method === "DELETE") {
      const products = cache.data || JSON.parse(fs.readFileSync(filePath, "utf8"));
      const index = products.findIndex((p) => p.id === parseInt(id));
      if (index === -1) return res.status(404).json({ message: "Product not found" });

      products.splice(index, 1);
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf8");

      cache = { data: products, timestamp: Date.now() };
      console.log("🚮 Products cache updated after DELETE");
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("❌ Error in /api/products/[id]:", error);
    return res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
}
