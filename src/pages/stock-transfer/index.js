// File: /pages/stock-transfer/index.js
import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, Grid, Card, FormControl,
  InputLabel, Select, MenuItem, TextField, Button, Snackbar,
  Alert, Table, TableHead, TableBody, TableRow, TableCell,
  CircularProgress, Divider, Grow, TableContainer, Paper
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import GreenAppBar from '@/components/GreenAppBar';
import { getBaseUrl } from '@/lib/getBaseUrl'; // ✅ اضافه شد

// ───────────────────────────── Component ─────────────────────────────
export default function StockTransferPage({
  warehouses: initialWarehouses,
  products: initialProducts,
  stock: initialStock,
  error,
}) {
  const [warehouses, setWarehouses] = useState(initialWarehouses || []);
  const [products, setProducts] = useState(initialProducts || []);
  const [stock, setStock] = useState(initialStock || []);
  const [transferHistory, setTransferHistory] = useState([]);
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [snack, setSnack] = useState({ open: false, type: 'success', msg: '' });
  const [loadingTransfers, setLoadingTransfers] = useState(true);
  const [transferring, setTransferring] = useState(false);

  const handleSnackbarClose = () => setSnack({ ...snack, open: false });

  // ─────────────────────────────── Transfer History ───────────────────────────────
  useEffect(() => {
    async function loadTransferHistory() {
      try {
        const res = await fetch('/api/transfers');
        if (!res.ok) throw new Error('Failed to fetch transfer history.');
        const data = await res.json();
        const mapped = data.map((t) => ({
          id: t.id,
          date: new Date(t.date).toLocaleString(),
          fromWarehouse:
            warehouses.find((w) => w.id === t.fromWarehouseId)?.name || `Warehouse ${t.fromWarehouseId}`,
          toWarehouse:
            warehouses.find((w) => w.id === t.toWarehouseId)?.name || `Warehouse ${t.toWarehouseId}`,
          product:
            products.find((p) => p.id === t.productId)?.name || `Product ${t.productId}`,
          qty: t.quantity,
        }));
        setTransferHistory(mapped.reverse());
      } catch (err) {
        console.error('❌ History load error:', err);
        setSnack({ open: true, type: 'error', msg: 'Failed to load transfer history.' });
      } finally {
        setLoadingTransfers(false);
      }
    }
    loadTransferHistory();
  }, [warehouses, products]);

  // ───────────────────────────── Auto Refresh ─────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [wRes, sRes] = await Promise.all([
          fetch('/api/warehouses'),
          fetch('/api/stock'),
        ]);
        if (!wRes.ok || !sRes.ok) throw new Error('Failed to refresh data');
        const [w, s] = await Promise.all([wRes.json(), sRes.json()]);
        if (isMounted) {
          setWarehouses(w);
          setStock(s);
        }
      } catch (err) {
        console.error('♻️ Auto-refresh error:', err);
      }
    };
    const timer = setInterval(fetchData, 5000);
    return () => { isMounted = false; clearInterval(timer); };
  }, []);

  // ───────────────────────────── Derived Data ─────────────────────────────
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
  const currentStock =
    stock.find(
      (s) =>
        Number(s.warehouseId) === Number(fromWarehouse) &&
        Number(s.productId) === Number(productId)
    )?.quantity ?? 0;

  // ───────────────────────────── Transfer Logic ─────────────────────────────
  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!fromWarehouse || !toWarehouse || !productId || !quantity)
      return setSnack({ open: true, type: 'error', msg: 'Please fill in all fields' });
    if (fromWarehouse === toWarehouse)
      return setSnack({ open: true, type: 'error', msg: 'Source and destination cannot be the same.' });
    if (Number(quantity) <= 0)
      return setSnack({ open: true, type: 'error', msg: 'Quantity must be positive.' });
    if (Number(currentStock) < Number(quantity))
      return setSnack({ open: true, type: 'error', msg: 'Insufficient stock in source warehouse.' });

    setTransferring(true);
    try {
      const res = await fetch('/api/transfers', {
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
      if (!res.ok) throw new Error(data.message || 'Transfer failed');

      setSnack({ open: true, type: 'success', msg: data?.message || 'Stock transferred!' });
      setFromWarehouse('');
      setToWarehouse('');
      setProductId('');
      setQuantity('');
    } catch (err) {
      setSnack({ open: true, type: 'error', msg: err.message });
    } finally {
      setTransferring(false);
    }
  };

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          <strong>Failed to load data from server.</strong>
          <Typography variant="body2" sx={{ mt: 1 }}>{error}</Typography>
        </Alert>
      </Container>
    );
  }

  // ───────────────────────────── UI ─────────────────────────────
  return (
    <>
      <GreenAppBar />
      <Box sx={{ backgroundColor: '#F4F6F8', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight={700}
            color="success.main"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 5 }}
          >
            <SwapHorizIcon /> Stock Transfer
          </Typography>

          <Grid container spacing={4} alignItems="stretch">
            {/* ▬▬▬ Transfer Form ▬▬▬ */}
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Grow in timeout={500} style={{ flexGrow: 1 }}>
                <Card sx={styles.card}>
                  <Typography variant="h6" fontWeight={600} color="success.main">
                    Transfer Form
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <form onSubmit={handleTransfer} style={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>From Warehouse</InputLabel>
                          <Select value={fromWarehouse} label="From Warehouse"
                            onChange={(e) => { setFromWarehouse(e.target.value); setProductId(''); }}>
                            {warehouses.map((wh) => (<MenuItem key={wh.id} value={wh.id}>{wh.name}</MenuItem>))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>To Warehouse</InputLabel>
                          <Select value={toWarehouse} label="To Warehouse"
                            onChange={(e) => setToWarehouse(e.target.value)}>
                            {warehouses
                              .filter((w) => Number(w.id) !== Number(fromWarehouse))
                              .map((wh) => (<MenuItem key={wh.id} value={wh.id}>{wh.name}</MenuItem>))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth disabled={!fromWarehouse}>
                          <InputLabel>Product</InputLabel>
                          <Select value={productId} label="Product"
                            onChange={(e) => setProductId(e.target.value)}>
                            {productsAvailableInSource.map((p) => (<MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>))}
                          </Select>
                        </FormControl>
                        {fromWarehouse && productId && (
                          <Typography variant="body2" component="div" sx={{ mt: 1, color: '#388E3C' }}>
                            Available in source: {currentStock} units
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth type="number" label="Quantity"
                          value={quantity} onChange={(e) => setQuantity(e.target.value)}
                          inputProps={{ min: 1 }} />
                      </Grid>
                      <Grid item xs={12} sx={{ mt: 1 }}>
                        <Button type="submit" fullWidth variant="contained" sx={styles.transferBtn}
                          disabled={transferring}>
                          {transferring ? <CircularProgress size={22} color="inherit" /> : 'TRANSFER STOCK'}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Card>
              </Grow>
            </Grid>

            {/* ▬▬▬ Stock Summary ▬▬▬ */}
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Grow in timeout={700} style={{ flexGrow: 1 }}>
                <Card sx={styles.card}>
                  <Typography variant="h6" fontWeight={600} color="success.main">
                    Current Stock Summary
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {warehouses.map((wh) => (
                    <Box key={wh.id} sx={styles.sectionBox}>
                      <Typography variant="subtitle1" fontWeight={600} color="success.dark">
                        {wh.name}
                      </Typography>
                      <Typography variant="body2" component="div" color="text.secondary">
                        {stock.filter((i) => Number(i.warehouseId) === Number(wh.id)).map((r) => {
                          const product = products.find((p) => Number(p.id) === Number(r.productId))?.name;
                          return (<div key={r.id}>{product ?? `Unknown (${r.productId})`}: {r.quantity ?? 0}</div>);
                        })}
                      </Typography>
                    </Box>
                  ))}
                </Card>
              </Grow>
            </Grid>
          </Grid>

          {/* ▬▬▬ Transfer History ▬▬▬ */}
          <Grow in timeout={900}>
            <Card sx={{ mt: 5, borderRadius: 3, p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="success.main">Transfer History</Typography>
              <Divider sx={{ my: 2 }} />
              {loadingTransfers ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress color="success" size={32} />
                  <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading transfer history...
                  </Typography>
                </Box>
              ) : transferHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No transfers yet.
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small" sx={{ minWidth: 700 }}>
                    <TableHead sx={{ backgroundColor: 'success.light' }}>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Qty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transferHistory.map((t) => (
                        <TableRow key={t.id} hover sx={{ '&:hover': { backgroundColor: '#F1F8E9' } }}>
                          <TableCell>{t.date}</TableCell>
                          <TableCell>{t.fromWarehouse}</TableCell>
                          <TableCell>{t.toWarehouse}</TableCell>
                          <TableCell>{t.product}</TableCell>
                          <TableCell align="right">{t.qty}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Grow>

          <Snackbar open={snack.open} autoHideDuration={4000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={handleSnackbarClose} severity={snack.type} sx={{ width: '100%' }}>
              {snack.msg}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
}

// ───────────────────────────── Styles ─────────────────────────────
const styles = {
  card: {
    borderRadius: 3,
    p: 3,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    backgroundColor: 'white',
    height: '100%',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  sectionBox: {
    backgroundColor: '#f1f8e9',
    p: 2,
    borderRadius: 2,
    mb: 2,
  },
  transferBtn: {
    mt: 1,
    py: 1.3,
    fontWeight: 600,
    letterSpacing: 0.5,
    background: 'linear-gradient(135deg, #66BB6A, #388E3C)',
    '&:hover': {
      background: 'linear-gradient(135deg, #81C784, #2E7D32)',
      transform: 'translateY(-1px)',
      boxShadow: '0 3px 8px rgba(56,142,60,0.3)',
    },
  },
};

// ───────────────────────────── SSR ─────────────────────────────
export async function getServerSideProps(context) {
  const baseUrl = getBaseUrl(context.req); // ✅ استاندارد جدید جایگزین manual protocol/host

  try {
    const [warehousesRes, productsRes, stockRes] = await Promise.all([
      fetch(`${baseUrl}/api/warehouses`),
      fetch(`${baseUrl}/api/products`),
      fetch(`${baseUrl}/api/stock`),
    ]);
    if (!warehousesRes.ok || !productsRes.ok || !stockRes.ok)
      throw new Error('Failed to fetch initial page data');

    const [warehouses, products, stock] = await Promise.all([
      warehousesRes.json(),
      productsRes.json(),
      stockRes.json(),
    ]);

    return { props: { warehouses, products, stock, error: null } };
  } catch (err) {
    return {
      props: {
        warehouses: [],
        products: [],
        stock: [],
        error: err.message || 'SSR data fetch failed',
      },
    };
  }
}
