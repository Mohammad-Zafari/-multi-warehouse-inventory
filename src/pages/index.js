// File: /pages/index.js
// Unified Dashboard Page using shared <GreenAppBar /> component

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import GreenAppBar from '@/components/GreenAppBar';
import CategoryBarChart from '@/components/charts/CategoryBarChart';
import WarehousePieChart from '@/components/charts/WarehousePieChart';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TableSortLabel, CircularProgress, Alert
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/products').then(r => r.ok ? r.json() : Promise.reject(`Products error: ${r.status}`)),
      fetch('/api/warehouses').then(r => r.ok ? r.json() : Promise.reject(`Warehouses error: ${r.status}`)),
      fetch('/api/stock').then(r => r.ok ? r.json() : Promise.reject(`Stock error: ${r.status}`)),
    ])
      .then(([p, w, s]) => {
        setProducts(p);
        setWarehouses(w);
        setStock(s);
      })
      .catch(e => setError(e.toString()))
      .finally(() => setLoading(false));
  }, []);

  const summaryData = useMemo(() => {
    const totalValue = stock.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      const cost = product ? Number(product.unitCost) || 0 : 0;
      return sum + cost * item.quantity;
    }, 0);
    return {
      productCount: products.length,
      warehouseCount: warehouses.length,
      totalValue: isNaN(totalValue) ? 0 : totalValue,
    };
  }, [products, warehouses, stock]);

  const warehouseStockData = useMemo(() => {
    const grouped = stock.reduce((acc, s) => {
      acc[s.warehouseId] = (acc[s.warehouseId] || 0) + s.quantity;
      return acc;
    }, {});
    return Object.entries(grouped).map(([id, qty]) => ({
      name: warehouses.find(w => w.id === parseInt(id))?.name || `Warehouse ${id}`,
      value: qty,
    }));
  }, [stock, warehouses]);

  const categoryStockData = useMemo(() => {
    const totals = {};
    stock.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product?.category) return;
      totals[product.category] = (totals[product.category] || 0) + item.quantity;
    });
    return Object.entries(totals).map(([category, totalQuantity]) => ({
      category,
      totalQuantity,
    }));
  }, [stock, products]);

  const sortedInventory = useMemo(() => {
    let inv = products.map(p => {
      const totalQ = stock.filter(s => s.productId === p.id)
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
  }, [products, stock, orderBy, order]);

  const handleSortRequest = (prop) => {
    const isAsc = orderBy === prop && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(prop);
  };

  if (loading)
    return (
      <Box sx={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', flexDirection: 'column', gap: 2
      }}>
        <CircularProgress color="success" size={50} />
        <Typography sx={{ color: 'success.dark' }}>Loading GreenSupply Data...</Typography>
      </Box>
    );

  if (error)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          <strong>Failed to load dashboard data.</strong> Please refresh the page.
          <Typography variant="body2" sx={{ mt: 1 }}>{error}</Typography>
        </Alert>
      </Container>
    );

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Shared Header */}
      <GreenAppBar />

      {/* Dashboard Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, md: 5 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#2E7D32',
            mb: 3,
            letterSpacing: 0.3
          }}
        >
          Dashboard Overview
        </Typography>

        <Grid container spacing={3}>

          {/* KPI: Products Count */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={2}
              sx={{
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
              }}
            >
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
            <Card
              elevation={2}
              sx={{
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
              }}
            >
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
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                color: 'white',
                background: 'linear-gradient(135deg, #66BB6A 30%, #388E3C 90%)',
                boxShadow: '0 2px 6px rgba(56,142,60,0.45)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(56,142,60,0.55)',
                },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: '16px !important' }}>
                <MonetizationOnIcon sx={{ fontSize: 40, mr: 2, opacity: 0.85 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Stock Value
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${summaryData.totalValue.toLocaleString('en-US', {
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

          {/* Inventory Table */}
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
                            '&:hover': {
                              backgroundColor: 'rgba(76,175,80,0.08)'
                            },
                          }}
                        >
                          <TableCell component="th" scope="row">{row.name}</TableCell>
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
