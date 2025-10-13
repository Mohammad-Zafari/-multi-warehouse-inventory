// File: /pages/index.js
// Final version: vibrant pie chart, unified fonts, consistent layout, and sorting.

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// MUI Components
import {
  Container, Typography, Box, Grid, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  AppBar, Toolbar, TableSortLabel, CircularProgress,
} from '@mui/material';

import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// --- Improved and Vibrant Pie Chart Component ---
// --- Improved Auto‑Color Pie Chart (random colors, no limit) ---
// --- Final & Most Robust Pie Chart Component (Hydration-Safe) ---
const WarehousePieChart = dynamic(() => Promise.resolve(({ data }) => {
  // ✅ We need these React hooks now
  const { useState, useEffect } = require('react');
  const {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
  } = require('recharts');

  // This state ensures the chart only renders on the client, after the initial render.
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // When the component mounts on the client, we set the state to true.
    setIsClient(true);
  }, []);

  // A simple function to generate deterministic random colors based on an index
  const getRandomColor = (seed) => {
    const hue = (seed * 137.508) % 360;
    const saturation = 70 + (seed * 23) % 20;
    const lightness = 45 + (seed * 37) % 15;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // 💡 On the server and the first client render, this returns a placeholder.
  // This completely avoids the hydration mismatch error.
  if (!isClient) {
    return <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />;
  }
  
  // Now, this part ONLY runs on the client in the second pass.
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 280 }}>
        <Typography color="text.secondary">No data for chart</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <defs>
          {data.map((_, i) => {
            const color = getRandomColor(i + 1);
            return (
              <linearGradient id={`grad-${i}`} key={i} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.95}/>
                <stop offset="100%" stopColor={color} stopOpacity={0.55}/>
              </linearGradient>
            );
          })}
        </defs>

        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={95}
          innerRadius={45}
          labelLine={false}
          isAnimationActive
          animationDuration={1000}
        >
          {data.map((_, i) => (
            <Cell
              key={`slice-${i}`}
              fill={`url(#grad-${i})`}
              stroke="#fff"
              strokeWidth={2}
              style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))" }}
            />
          ))}
        </Pie>

        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            borderRadius: 8,
            border: "none",
            boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
          }}
          formatter={(value) => `${value.toLocaleString('en-US')} units`}
        />
        <Legend
          verticalAlign="bottom"
          height={40}
          iconType="circle"
          wrapperStyle={{
            fontSize: '0.9rem',
            fontFamily: 'Roboto, sans-serif',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}), { ssr: false,
     // Optional: Add a loading skeleton for a better user experience
     loading: () => <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
});


// --- Main Component ---
export default function Home() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/warehouses').then(res => res.json()),
      fetch('/api/stock').then(res => res.json()),
    ])
      .then(([p, w, s]) => {
        setProducts(p);
        setWarehouses(w);
        setStock(s);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      });
  }, []);

  const summaryData = useMemo(() => {
    const totalValue = stock.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      const cost = product ? Number(product.unitCost) || 0 : 0;
      return sum + (cost * item.quantity);
    }, 0);
    return {
      productCount: products.length,
      warehouseCount: warehouses.length,
      totalValue: isNaN(totalValue) ? 0 : totalValue,
    };
  }, [products, warehouses, stock]);

  const warehouseStockData = useMemo(() => {
    const stockByWarehouse = stock.reduce((acc, s) => {
      acc[s.warehouseId] = (acc[s.warehouseId] || 0) + s.quantity;
      return acc;
    }, {});
    return Object.entries(stockByWarehouse).map(([id, qty]) => {
      const warehouse = warehouses.find(w => w.id === parseInt(id));
      return { name: warehouse ? warehouse.name : `Warehouse ${id}`, value: qty };
    });
  }, [stock, warehouses]);

  const sortedInventory = useMemo(() => {
    let inv = products.map(product => {
      const pStock = stock.filter(s => s.productId === product.id);
      const totalQuantity = pStock.reduce((sum, s) => sum + s.quantity, 0);
      return {
        ...product,
        totalQuantity,
        isLowStock: totalQuantity < product.reorderPoint,
      };
    });
    const comparator = (a, b) => {
      let valA = a[orderBy]; let valB = b[orderBy];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valB < valA) return order === 'asc' ? 1 : -1;
      if (valB > valA) return order === 'asc' ? -1 : 1;
      return 0;
    };
    inv.sort(comparator);
    return inv;
  }, [products, stock, order, orderBy]);

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <InventoryIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Inventory Management System</Typography>
          <Button color="inherit" component={Link} href="/products">Products</Button>
          <Button color="inherit" component={Link} href="/warehouses">Warehouses</Button>
          <Button color="inherit" component={Link} href="/stock">Stock Levels</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>

        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item lg={8} md={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>Total Products</Typography>
                    <Typography variant="h4">{summaryData.productCount.toLocaleString('en-US')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>Warehouses</Typography>
                    <Typography variant="h4">{summaryData.warehouseCount.toLocaleString('en-US')}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>Total Stock Value</Typography>
                    <Typography variant="h4">
                      ${summaryData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* 📊 Vibrant Pie Chart */}
          <Grid item lg={4} md={12}>
            <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="subtitle1" color="text.secondary" align="center" gutterBottom>
                Stock Distribution by Warehouse
              </Typography>
              <WarehousePieChart data={warehouseStockData} />
            </Paper>
          </Grid>

          {/* Inventory Table */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>Inventory Overview</Typography>
            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>SKU</strong></TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'name'}
                        direction={orderBy === 'name' ? order : 'asc'}
                        onClick={() => handleSortRequest('name')}
                      >
                        <strong>Product Name</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'category'}
                        direction={orderBy === 'category' ? order : 'asc'}
                        onClick={() => handleSortRequest('category')}
                      >
                        <strong>Category</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={orderBy === 'totalQuantity'}
                        direction={orderBy === 'totalQuantity' ? order : 'asc'}
                        onClick={() => handleSortRequest('totalQuantity')}
                      >
                        <strong>Total Stock</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right"><strong>Reorder Point</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedInventory.map(item => (
                    <TableRow key={item.id} hover sx={{ backgroundColor: item.isLowStock ? 'rgba(255, 167, 38, 0.1)' : 'inherit' }}>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">{item.totalQuantity.toLocaleString('en-US')}</TableCell>
                      <TableCell align="right">{item.reorderPoint.toLocaleString('en-US')}</TableCell>
                      <TableCell>
                        <Typography color={item.isLowStock ? 'warning.main' : 'success.main'} fontWeight="bold">
                          {item.isLowStock ? 'Low Stock' : 'In Stock'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
