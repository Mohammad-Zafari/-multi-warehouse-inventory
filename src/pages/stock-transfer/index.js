// pages/stock-transfer/index.js
import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from '@mui/material';
import GreenAppBar from '../../components/GreenAppBar'; // ✅ اضافه شد

export default function StockTransferPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);

  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');

  const [snack, setSnack] = useState({ open: false, type: 'success', msg: '' });
  const [loading, setLoading] = useState(true);

  const handleSnackbarClose = () => setSnack({ ...snack, open: false });

  // 🧠 Load data once
  useEffect(() => {
    async function loadData() {
      try {
        const [whRes, prodRes, stockRes, transferRes] = await Promise.all([
          fetch('/api/warehouses'),
          fetch('/api/products'),
          fetch('/api/stock'),
          fetch('/api/transfer'),
        ]);

        if (!whRes.ok || !prodRes.ok || !stockRes.ok || !transferRes.ok)
          throw new Error('Failed to fetch resources.');

        const [warehousesData, productsData, stockData, transferData] =
          await Promise.all([
            whRes.json(),
            prodRes.json(),
            stockRes.json(),
            transferRes.json(),
          ]);

        setWarehouses(warehousesData);
        setProducts(productsData);
        setStock(stockData);
        setTransferHistory(
          transferData.map((t) => ({
            id: t.id,
            date: new Date(t.date).toLocaleString(),
            fromWarehouse:
              warehousesData.find((w) => w.id === t.fromWarehouseId)?.name ||
              `Warehouse ${t.fromWarehouseId}`,
            toWarehouse:
              warehousesData.find((w) => w.id === t.toWarehouseId)?.name ||
              `Warehouse ${t.toWarehouseId}`,
            product:
              productsData.find((p) => p.id === t.productId)?.name ||
              `Product ${t.productId}`,
            qty: t.quantity,
          }))
        );
      } catch (err) {
        console.error('❌ Error loading data:', err);
        setSnack({
          open: true,
          type: 'error',
          msg: 'Failed to load data from server.',
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 🔍 Filter products available in selected source warehouse
  const productsAvailableInSource = fromWarehouse
    ? products.filter((p) =>
        stock.some(
          (s) =>
            Number(s.warehouseId) === Number(fromWarehouse) &&
            Number(s.productId) === Number(p.id) &&
            s.quantity > 0
        )
      )
    : [];

  // 🏭 Exclude source warehouse from destination list
  const destinationWarehouses = warehouses.filter(
    (w) => Number(w.id) !== Number(fromWarehouse)
  );

  // 🧾 Get current stock in selected source warehouse
  const currentStock =
    stock.find(
      (s) =>
        Number(s.warehouseId) === Number(fromWarehouse) &&
        Number(s.productId) === Number(productId)
    )?.quantity ?? 0;

  // 📦 Handle transfer action
  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!fromWarehouse || !toWarehouse || !productId || !quantity) {
      setSnack({ open: true, type: 'error', msg: 'Please fill in all fields.' });
      return;
    }

    if (fromWarehouse === toWarehouse) {
      setSnack({
        open: true,
        type: 'error',
        msg: 'Source and destination warehouses cannot be the same.',
      });
      return;
    }

    const sourceRecord = stock.find(
      (s) =>
        Number(s.warehouseId) === Number(fromWarehouse) &&
        Number(s.productId) === Number(productId)
    );

    if (!sourceRecord) {
      setSnack({
        open: true,
        type: 'error',
        msg: 'This product is not available in the selected source warehouse.',
      });
      return;
    }

    if (Number(sourceRecord.quantity) < Number(quantity)) {
      setSnack({
        open: true,
        type: 'error',
        msg: 'Insufficient stock in the source warehouse.',
      });
      return;
    }

    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWarehouseId: parseInt(fromWarehouse),
          toWarehouseId: parseInt(toWarehouse),
          productId: parseInt(productId),
          quantity: parseInt(quantity),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Transfer failed.');

      setSnack({
        open: true,
        type: 'success',
        msg: data?.message || 'Stock transferred successfully!',
      });

      // reload stock
      const stockRes = await fetch('/api/stock');
      const newStock = await stockRes.json();
      setStock(newStock);

      // reload transfer history
      const transferRes = await fetch('/api/transfer');
      const updatedHistory = await transferRes.json();
      setTransferHistory(
        updatedHistory.map((t) => ({
          id: t.id,
          date: new Date(t.date).toLocaleString(),
          fromWarehouse:
            warehouses.find((w) => w.id === t.fromWarehouseId)?.name ||
            `Warehouse ${t.fromWarehouseId}`,
          toWarehouse:
            warehouses.find((w) => w.id === t.toWarehouseId)?.name ||
            `Warehouse ${t.toWarehouseId}`,
          product:
            products.find((p) => p.id === t.productId)?.name ||
            `Product ${t.productId}`,
          qty: t.quantity,
        }))
      );

      // reset form
      setFromWarehouse('');
      setToWarehouse('');
      setProductId('');
      setQuantity('');
    } catch (err) {
      console.error('❌ Transfer failed:', err);
      setSnack({
        open: true,
        type: 'error',
        msg: err.message || 'An error occurred while transferring stock.',
      });
    }
  };

  // ⏳ Loader
  if (loading) {
    return (
      <>
        <GreenAppBar /> {/* ✅ نمایش هدر در حالت لود */}
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2, color: 'rgba(0,0,0,0.6)' }}>
            Loading warehouses and products...
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <GreenAppBar /> {/* ✅ هدر سبز در بالای صفحه */}

      <Box sx={{ backgroundColor: '#F9FAFB', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 8, lg: 10 } }}>
          <Typography
            variant="h4"
            sx={{
              color: '#1B5E20',
              fontWeight: 700,
              mb: 4,
              textShadow: '0 1px 1px rgba(0,0,0,0.15)',
            }}
          >
            Stock Transfer
          </Typography>

          {/* --- Transfer Form --- */}
          <Grid container spacing={4}>
            {/* فرم انتقال */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#1B5E20', fontWeight: 600, mb: 2 }}>
                  Transfer Form
                </Typography>

                <form onSubmit={handleTransfer}>
                  <Grid container spacing={2}>
                    {/* From */}
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>From Warehouse</InputLabel>
                        <Select
                          value={fromWarehouse}
                          label="From Warehouse"
                          onChange={(e) => {
                            setFromWarehouse(e.target.value);
                            setProductId('');
                          }}
                        >
                          {warehouses.map((wh) => (
                            <MenuItem key={wh.id} value={wh.id}>
                              {wh.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* To */}
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>To Warehouse</InputLabel>
                        <Select
                          value={toWarehouse}
                          label="To Warehouse"
                          onChange={(e) => setToWarehouse(e.target.value)}
                        >
                          {destinationWarehouses.map((wh) => (
                            <MenuItem key={wh.id} value={wh.id}>
                              {wh.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Product */}
                    <Grid item xs={12}>
                      <FormControl fullWidth disabled={!fromWarehouse}>
                        <InputLabel>Product</InputLabel>
                        <Select
                          value={productId}
                          label="Product"
                          onChange={(e) => setProductId(e.target.value)}
                        >
                          {productsAvailableInSource.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {fromWarehouse && productId && (
                        <Typography variant="body2" sx={{ mt: 1, color: '#388E3C' }}>
                          Available in source: {currentStock} units
                        </Typography>
                      )}
                    </Grid>

                    {/* Quantity */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>

                    {/* Submit */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                          py: 1.3,
                          fontWeight: 600,
                          backgroundColor: '#388E3C',
                          '&:hover': { backgroundColor: '#2E7D32' },
                        }}
                      >
                        Transfer Stock
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>

            {/* --- Stock Summary --- */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#1B5E20', fontWeight: 600, mb: 2 }}>
                  Current Stock Summary
                </Typography>
                {warehouses.map((wh) => (
                  <Box key={wh.id} sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: '#2E7D32', fontWeight: 600, mb: 0.5 }}
                    >
                      {wh.name}
                    </Typography>
                    {stock
                      .filter((i) => Number(i.warehouseId) === Number(wh.id))
                      .map((r) => {
                        const productName = products.find(
                          (p) => Number(p.id) === Number(r.productId)
                        )?.name;
                        return (
                          <Typography
                            key={r.id}
                            variant="body2"
                            sx={{ color: 'rgba(0,0,0,0.7)', pl: 2 }}
                          >
                            {productName ?? `Unknown Product (${r.productId})`}: {r.quantity ?? 0}
                          </Typography>
                        );
                      })}
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>

          {/* --- Transfer History --- */}
          <Box sx={{ mt: 5 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" sx={{ color: '#1B5E20', fontWeight: 600, mb: 2 }}>
                Transfer History
              </Typography>
              {transferHistory.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                  No transfers yet.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>To</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transferHistory.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.date}</TableCell>
                        <TableCell>{t.fromWarehouse}</TableCell>
                        <TableCell>{t.toWarehouse}</TableCell>
                        <TableCell>{t.product}</TableCell>
                        <TableCell>{t.qty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </Box>

          {/* Snackbar */}
          <Snackbar
            open={snack.open}
            autoHideDuration={3500}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleSnackbarClose} severity={snack.type} sx={{ width: '100%' }}>
              {snack.msg}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
}
