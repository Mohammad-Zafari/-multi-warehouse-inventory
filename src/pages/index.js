// File: /pages/index.js
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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import fs from "fs";
import path from "path";

export default function Home({
  products,
  warehouses,
  stock,
  warehouseStockData: initialWarehouseData,
  categoryStockData: initialCategoryData,
  error
}) {
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [liveProducts, setLiveProducts] = useState(products);
  const [liveWarehouses, setLiveWarehouses] = useState(warehouses);
  const [liveStock, setLiveStock] = useState(stock);
  const [alertCount, setAlertCount] = useState(0);
  const [warehouseChart, setWarehouseChart] = useState(initialWarehouseData);
  const [categoryChart, setCategoryChart] = useState(initialCategoryData);

  // -------- Re-fetch every 5 seconds --------
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [pRes, wRes, sRes, aRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/warehouses'),
          fetch('/api/stock'),
          fetch('/api/alerts'),
        ]);
        if (!pRes.ok || !wRes.ok || !sRes.ok || !aRes.ok)
          throw new Error('Failed during re-fetch');
        const [p, w, s, a] = await Promise.all([
          pRes.json(),
          wRes.json(),
          sRes.json(),
          aRes.json()
        ]);
        setLiveProducts(p);
        setLiveWarehouses(w);
        setLiveStock(s);
        setAlertCount(a.length);

        // 🌀 Recalculate charts using latest data
        setWarehouseChart(() => {
          const grouped = s.reduce((acc, item) => {
            acc[item.warehouseId] = (acc[item.warehouseId] || 0) + item.quantity;
            return acc;
          }, {});
          return Object.entries(grouped).map(([id, qty]) => ({
            name: w.find(x => x.id === parseInt(id))?.name || `Warehouse ${id}`,
            value: qty,
          }));
        });

        setCategoryChart(() => {
          const catTotals = {};
          s.forEach((item) => {
            const prod = p.find((px) => px.id === item.productId);
            if (!prod?.category) return;
            catTotals[prod.category] =
              (catTotals[prod.category] || 0) + item.quantity;
          });
          return Object.entries(catTotals).map(([category, total]) => ({
            category,
            totalQuantity: total,
          }));
        });

      } catch (err) {
        console.error('Re-fetch error:', err.message);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initial fetch for alert count
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const data = await res.json();
          setAlertCount(data.length);
        }
      } catch (err) {
        console.error('Failed to fetch alerts:', err.message);
      }
    };
    fetchAlerts();
  }, []);

  // -------- Summary and Table Data --------
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
      <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, mb: 4, px: { xs: 2, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#2E7D32',
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '1.8rem', sm: '2.2rem' },
          }}
        >
          Dashboard Overview
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* KPI Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={styles.kpiCard}>
              <InventoryIcon color="success" sx={styles.kpiIcon} />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={styles.kpiTitle}>
                  Total Products
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {summaryData.productCount}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={styles.kpiCard}>
              <WarehouseIcon color="success" sx={styles.kpiIcon} />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={styles.kpiTitle}>
                  Warehouses
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {summaryData.warehouseCount}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
                ...styles.kpiCard,
                background:
                  alertCount > 0
                    ? 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)'
                    : 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
              }}
            >
              <WarningAmberIcon
                sx={{
                  ...styles.kpiIcon,
                  color: alertCount > 0 ? '#E65100' : '#388E3C',
                }}
              />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={styles.kpiTitle}>
                  Low Stock Alerts
                </Typography>
                <Typography variant="h5" fontWeight="bold" color={alertCount > 0 ? 'error' : 'success.main'}>
                  {alertCount}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={styles.valueCard}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 1.5, sm: 2 } }}>
                <MonetizationOnIcon sx={styles.kpiIcon} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Stock Value
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    $
                    {summaryData.totalValue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} lg={6}>
            <WarehousePieChart data={warehouseChart} />
          </Grid>
          <Grid item xs={12} lg={6}>
            <CategoryBarChart data={categoryChart} />
          </Grid>

          {/* Inventory Table */}
          <Grid item xs={12}>
            <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ px: { xs: 1, sm: 2 } }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary" mb={2}>
                  Inventory Summary
                </Typography>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    width: '100%',
                    overflowX: 'auto',
                  }}
                >
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
                            '&:hover': { backgroundColor: 'rgba(76,175,80,0.08)' },
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

// ---------- STYLES ----------
const styles = {
  kpiCard: {
    display: 'flex',
    alignItems: 'center',
    p: { xs: 1.5, sm: 2 },
    borderRadius: 3,
    boxShadow: '0 2px 6px rgba(76,175,80,0.35)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 10px rgba(76,175,80,0.45)',
    },
  },
  kpiIcon: { fontSize: { xs: 32, sm: 40 }, mr: 2 },
  kpiTitle: { fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.875rem' } },
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
  },
};

// ---------- getServerSideProps ----------
export async function getServerSideProps() {
  try {
    const warehousePath = path.join(process.cwd(), "data", "warehouses.json");
    const stockPath = path.join(process.cwd(), "data", "stock.json");
    const productsPath = path.join(process.cwd(), "data", "products.json");

    const warehouses = JSON.parse(fs.readFileSync(warehousePath, "utf8"));
    const stock = JSON.parse(fs.readFileSync(stockPath, "utf8"));
    const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));

    const warehouseStockData = warehouses.map((w) => {
      const totalQty = stock
        .filter((s) => s.warehouseId === w.id)
        .reduce((sum, s) => sum + s.quantity, 0);
      return { name: w.name, value: totalQty };
    });

    const categoryTotals = {};
    stock.forEach((s) => {
      const p = products.find((p) => p.id === s.productId);
      if (!p?.category) return;
      categoryTotals[p.category] =
        (categoryTotals[p.category] || 0) + s.quantity;
    });
    const categoryStockData = Object.entries(categoryTotals).map(
      ([category, total]) => ({ category, totalQuantity: total })
    );

    return {
      props: {
        products,
        warehouses,
        stock,
        warehouseStockData,
        categoryStockData,
        error: null,
      },
    };
  } catch (err) {
    return {
      props: {
        products: [],
        warehouses: [],
        stock: [],
        warehouseStockData: [],
        categoryStockData: [],
        error: err.message,
      },
    };
  }
}
