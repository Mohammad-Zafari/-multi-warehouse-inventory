import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const stockFile = path.join(dataDir, 'stock.json');
const transferFile = path.join(dataDir, 'transfer.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    // --- GET: return transfer history ---
    try {
      if (!fs.existsSync(transferFile)) {
        fs.writeFileSync(transferFile, '[]', 'utf8');
      }
      const history = JSON.parse(fs.readFileSync(transferFile, 'utf8'));
      return res.status(200).json(history);
    } catch (error) {
      console.error('❌ Error reading transfer.json:', error);
      return res.status(500).json({ message: 'Cannot read transfer history.' });
    }
  }

  if (req.method === 'POST') {
    // --- POST: process transfer + log it ---
    try {
      const { fromWarehouseId, toWarehouseId, productId, quantity } = req.body;

      if (!fromWarehouseId || !toWarehouseId || !productId || !quantity)
        return res.status(400).json({ message: 'Missing required fields.' });

      if (fromWarehouseId === toWarehouseId)
        return res
          .status(400)
          .json({ message: 'Source and destination cannot be the same.' });

      // --- Read stock file ---
      if (!fs.existsSync(stockFile)) {
        return res.status(500).json({ message: 'Stock file not found.' });
      }
      const stockData = JSON.parse(fs.readFileSync(stockFile, 'utf8'));

      // Lookup source & destination
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

      if (sourceIndex === -1)
        return res
          .status(404)
          .json({ message: 'Source warehouse does not contain this product.' });

      if (Number(stockData[sourceIndex].quantity) < Number(quantity))
        return res
          .status(400)
          .json({ message: 'Insufficient stock in source warehouse.' });

      // --- Apply transfer logic ---
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

      // --- Save updated stock ---
      fs.writeFileSync(stockFile, JSON.stringify(stockData, null, 2), 'utf8');

      // --- Log transfer to transfer.json ---
      let history = [];
      if (fs.existsSync(transferFile)) {
        history = JSON.parse(fs.readFileSync(transferFile, 'utf8'));
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
      fs.writeFileSync(transferFile, JSON.stringify(history, null, 2), 'utf8');

      return res
        .status(200)
        .json({ message: 'Transfer successful.', updatedStock: stockData });
    } catch (error) {
      console.error('❌ Error in transfer API:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }

  // ❌ Unsupported method
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
