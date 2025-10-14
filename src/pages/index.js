// pages/index.js — Dashboard (Hybrid SSR + Auto Re-fetch every 5s)
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  Grid,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CategoryIcon from '@mui/icons-material/Category';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import GreenAppBar from '@/components/GreenAppBar';

// Threshold constant
const LOW_STOCK_THRESHOLD = 10;

// ─────────────────────────────────────────────────────────
// Dashboard Component
// ─────────────────────────────────────────────────────────
export default function DashboardPage({
  stock: initialStock,
  products: initialProducts,
  warehouses: initialWarehouses,
  error,
}) {
  const [stock, setStock] = useState(initialStock || []);
  const [products, setProducts] = useState(initialProducts || []);
  const [warehouses, setWarehouses] = useState(initialWarehouses || []);
  const [loading, setLoading] = useState(false);

  // Derived KPI calculations
  const totalProducts = products.length;
  const totalWarehouses = warehouses.length;
  const totalStockCount = stock.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
  const lowStockItems = stock.filter((s) => Number(s.quantity) < LOW_STOCK_THRESHOLD);

  // Auto Re-fetch each 5s
  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [p, w, s] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/warehouses'),
          fetch('/api/stock'),
        ]);
        if (!p.ok || !w.ok || !s.ok) throw new Error('Failed to fetch KPI data');
        const [products, warehouses, stock] = await Promise.all([
          p.json(),
          w.json(),
          s.json(),
        ]);
        if (active) {
          setProducts(products);
          setWarehouses(warehouses);
          setStock(stock);
        }
      } catch (err) {
        console.error('Dashboard re-fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchData, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return (
      <>
        <GreenAppBar />
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">
            <Typography variant="h6">Failed to load dashboard data.</Typography>
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <GreenAppBar />
      <Box sx={{ backgroundColor: '#F4F6F8', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight={700}
            color="success.main"
            sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <InventoryIcon /> Dashboard
          </Typography>

          {/* ───── KPI Cards ───── */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={styles.kpiCard}>
                <CategoryIcon sx={styles.kpiIcon} />
                <Typography variant="h6" fontWeight={600}>
                  Products
                </Typography>
                <Typography variant="h4" color="success.main">
                  {totalProducts}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={styles.kpiCard}>
                <WarehouseIcon sx={styles.kpiIcon} />
                <Typography variant="h6" fontWeight={600}>
                  Warehouses
                </Typography>
                <Typography variant="h4" color="success.main">
                  {totalWarehouses}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={styles.kpiCard}>
                <InventoryIcon sx={styles.kpiIcon} />
                <Typography variant="h6" fontWeight={600}>
                  Total Units
                </Typography>
                <Typography variant="h4" color="success.main">
                  {totalStockCount}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={styles.kpiCard}>
                <WarningAmberIcon sx={styles.kpiIcon} color="warning" />
                <Typography variant="h6" fontWeight={600}>
                  Low Stock Items
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {lowStockItems.length}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* ───── Stock Overview ───── */}
          <Card sx={styles.tableCard}>
            <Typography variant="h6" fontWeight={600} color="success.main">
              Stock Overview
            </Typography>
            <Divider sx={{ my: 2 }} />
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress color="success" />
                <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                  Updating data...
                </Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'success.light' }}>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Warehouse</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        No stock data available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stock.map((item) => {
                      const product = products.find(
                        (p) => Number(p.id) === Number(item.productId)
                      );
                      const warehouse = warehouses.find(
                        (w) => Number(w.id) === Number(item.warehouseId)
                      );
                      const low = Number(item.quantity) < LOW_STOCK_THRESHOLD;
                      return (
                        <TableRow
                          key={`${item.warehouseId}-${item.productId}`}
                          sx={{
                            backgroundColor: low ? '#FFF9C4' : 'inherit',
                            '&:hover': { backgroundColor: '#F1F8E9' },
                          }}
                        >
                          <TableCell>{product?.name ?? `Product ${item.productId}`}</TableCell>
                          <TableCell>{warehouse?.name ?? `Warehouse ${item.warehouseId}`}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color={low ? 'warning.dark' : 'success.dark'}
                            >
                              {low ? 'Low' : 'OK'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </Container>
      </Box>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────
const styles = {
  kpiCard: {
    borderRadius: 3,
    p: 3,
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    transition: '0.2s',
    '&:hover': { transform: 'translateY(-3px)' },
  },
  kpiIcon: {
    fontSize: 36,
    color: 'success.main',
    mb: 1,
  },
  tableCard: {
    mt: 2,
    p: 3,
    borderRadius: 3,
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
  },
};

// ─────────────────────────────────────────────────────────
// SSR Initial Data Fetch
// ─────────────────────────────────────────────────────────
export async function getServerSideProps() {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const [productRes, warehouseRes, stockRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`),
      fetch(`${baseUrl}/api/warehouses`),
      fetch(`${baseUrl}/api/stock`),
    ]);

    if (!productRes.ok || !warehouseRes.ok || !stockRes.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const [products, warehouses, stock] = await Promise.all([
      productRes.json(),
      warehouseRes.json(),
      stockRes.json(),
    ]);

    return {
      props: { products, warehouses, stock },
    };
  } catch (err) {
    return {
      props: {
        products: [],
        warehouses: [],
        stock: [],
        error: err.message || 'Unknown error during SSR fetch',
      },
    };
  }
}
