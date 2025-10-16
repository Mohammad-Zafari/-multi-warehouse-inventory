import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "products.json");

let cache = {
  data: null,      
  timestamp: 0    
};
const CACHE_TTL = 10000;

export default function handler(req, res) {
  const now = Date.now();

  if (req.method === "GET") {
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
      console.log("⚡ Serving /api/products from Memory Cache");
      return res.status(200).json(cache.data);
    }

    try {
      const jsonData = fs.readFileSync(filePath, "utf8");
      const products = JSON.parse(jsonData);

      cache = { data: products, timestamp: now };
      console.log("🧠 Product cache refreshed at", new Date(now).toLocaleTimeString());

      return res.status(200).json(products);
    } catch (error) {
      console.error("❌ Error reading products:", error);
      return res.status(500).json({ message: "Error reading products file." });
    }
  }

  if (req.method === "POST") {
    try {
      const products = cache.data || JSON.parse(fs.readFileSync(filePath, "utf8"));

      const newProduct = req.body;
      newProduct.id = products.length
        ? Math.max(...products.map((p) => p.id)) + 1
        : 1;

      const updatedProducts = [...products, newProduct];

      fs.writeFileSync(filePath, JSON.stringify(updatedProducts, null, 2), "utf8");

      cache = { data: updatedProducts, timestamp: Date.now() };
      console.log("🧩 Cache updated after POST /api/products");

      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("❌ Error adding new product:", error);
      return res.status(500).json({ message: "Error writing products file." });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
