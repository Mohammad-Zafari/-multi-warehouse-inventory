// File: /pages/index.js
// Unified Dashboard Page using shared <GreenAppBar /> with SSR data prefetch + 5s Re-fetch

import { useMemo, useState, useEffect } from 'react';
import GreenAppBar from '@/components/GreenAppBar';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import WarehousePieChart from '@/components/charts/WarehousePieChart';
import {
  Container, Typography, Box, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TableSortLabel, Alert
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// ---------- COMPONENT ----------
export default function Home({ products, warehouses, stock, error }) {
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // -------- Live States (for 5s re-fetch) --------
  const [liveProducts, setLiveProducts] = useState(products);
  const [liveWarehouses, setLiveWarehouses] = useState(warehouses);
  const [liveStock, setLiveStock] = useState(stock);

  // -------- Automatic Re-fetch every 5 seconds --------
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [pRes, wRes, sRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/warehouses'),
          fetch('/api/stock')
        ]);
        if (!pRes.ok || !wRes.ok || !sRes.ok)
          throw new Error('Failed during re-fetch');

        const [p, w, s] = await Promise.all([
          pRes.json(),
          wRes.json(),
          sRes.json()
        ]);

        setLiveProducts(p);
        setLiveWarehouses(w);
        setLiveStock(s);
      } catch (err) {
        console.error('Re-fetch error:', err.message);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // -------- Data Summary --------
  const summaryData = useMemo(() => {
    const totalValue = liveStock.reduce((sum, item) => {
      const product = liveProducts.find(p => p.id === item.productId);
      const cost = product ? Number(product.unitCost) || 0 : 0;
      return sum + cost * item.quantity;
    }, 0);
    return {
      productCount: liveProducts.length,
      warehouseCount: liveWarehouses.length,
      totalValue: isNaN(totalValue) ? 0 : totalValue,
    };
  }, [liveProducts, liveWarehouses, liveStock]);

  // -------- Charts Data --------
  const warehouseStockData = useMemo(() => {
    const grouped = liveStock.reduce((acc, s) => {
      acc[s.warehouseId] = (acc[s.warehouseId] || 0) + s.quantity;
      return acc;
    }, {});
    return Object.entries(grouped).map(([id, qty]) => ({
      name: liveWarehouses.find(w => w.id === parseInt(id))?.name || `Warehouse ${id}`,
      value: qty,
    }));
  }, [liveStock, liveWarehouses]);

  const categoryStockData = useMemo(() => {
    const totals = {};
    liveStock.forEach(item => {
      const product = liveProducts.find(p => p.id === item.productId);
      if (!product?.category) return;
      totals[product.category] = (totals[product.category] || 0) + item.quantity;
    });
    return Object.entries(totals).map(([category, totalQuantity]) => ({
      category,
      totalQuantity,
    }));
  }, [liveStock, liveProducts]);

  // -------- Inventory Table --------
  const sortedInventory = useMemo(() => {
    const inv = liveProducts.map(p => {
      const totalQ = liveStock
        .filter(s => s.productId === p.id)
        .reduce((sum, s) => sum + s.quantity, 0);
      return { ...p, totalQuantity: totalQ, isLowStock: totalQ < p.reorderPoint };
    });
    inv.sort((a, b) => {
      const valA = a[orderBy] ?? '';
      const valB = b[orderBy] ?? '';
      const cmp = valA > valB ? 1 : valA < valB ? -1 : 0;
      return order === 'asc' ? cmp : -cmp;
    });
    return inv;
  }, [liveProducts, liveStock, orderBy, order]);

  const handleSortRequest = (prop) => {
    const isAsc = orderBy === prop && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(prop);
  };

  // -------- Error State --------
  if (error)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          <strong>Failed to load dashboard data.</strong> Please refresh the page.
          <Typography variant="body2" sx={{ mt: 1 }}>{error}</Typography>
        </Alert>
      </Container>
    );

  // -------- Render --------
  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <GreenAppBar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, md: 5 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32', mb: 3, letterSpacing: 0.3 }}>
          Dashboard Overview
        </Typography>

        <Grid container spacing={3}>
          {/* KPI: Products Count */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={styles.kpiCard}>
              <InventoryIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Products
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {summaryData.productCount}
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* KPI: Warehouses Count */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={styles.kpiCard}>
              <WarehouseIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Warehouses
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {summaryData.warehouseCount}
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* KPI: Stock Value */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={styles.valueCard}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: '16px !important' }}>
                <MonetizationOnIcon sx={{ fontSize: 40, mr: 2, opacity: 0.85 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Stock Value
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    $
                    {summaryData.totalValue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6}>
            <WarehousePieChart data={warehouseStockData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <CategoryBarChart data={categoryStockData} />
          </Grid>

          {/* Inventory Summary Table */}
          <Grid item xs={12}>
            <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="text.primary" mb={2}>
                  Inventory Summary
                </Typography>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sortDirection={orderBy === 'name' ? order : false}>
                          <TableSortLabel
                            active={orderBy === 'name'}
                            direction={orderBy === 'name' ? order : 'asc'}
                            onClick={() => handleSortRequest('name')}
                          >
                            Product
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">Category</TableCell>
                        <TableCell align="right">Total Quantity</TableCell>
                        <TableCell align="right">Reorder Point</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedInventory.map(row => (
                        <TableRow
                          key={row.id}
                          sx={{
                            backgroundColor: row.isLowStock ? '#FFF3E0' : 'inherit',
                            '&:hover': { backgroundColor: 'rgba(76,175,80,0.08)' }
                          }}
                        >
                          <TableCell>{row.name}</TableCell>
                          <TableCell align="right">{row.category}</TableCell>
                          <TableCell align="right">{row.totalQuantity}</TableCell>
                          <TableCell align="right">{row.reorderPoint}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// ---------- PAGE STYLES ----------
const styles = {
  kpiCard: {
    display: 'flex',
    alignItems: 'center',
    p: 2,
    borderRadius: 3,
    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    boxShadow: '0 2px 6px rgba(76,175,80,0.35)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 10px rgba(76,175,80,0.45)',
    },
  },
  valueCard: {
    borderRadius: 3,
    color: 'white',
    background: 'linear-gradient(135deg, #66BB6A 30%, #388E3C 90%)',
    boxShadow: '0 2px 6px rgba(56,142,60,0.45)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(56,142,60,0.55)',
    },
  }
};

// ---------- SSR DATA FETCHING ----------
export async function getServerSideProps() {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const [productsRes, warehousesRes, stockRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`),
      fetch(`${baseUrl}/api/warehouses`),
      fetch(`${baseUrl}/api/stock`)
    ]);

    if (!productsRes.ok || !warehousesRes.ok || !stockRes.ok) {
      throw new Error('Failed to fetch one or more API endpoints');
    }

    const [products, warehouses, stock] = await Promise.all([
      productsRes.json(),
      warehousesRes.json(),
      stockRes.json()
    ]);

    return {
      props: { products, warehouses, stock }
    };
  } catch (err) {
    return {
      props: {
        products: [],
        warehouses: [],
        stock: [],
        error: err.message || 'Unknown error while fetching SSR data'
      }
    };
  }
}
