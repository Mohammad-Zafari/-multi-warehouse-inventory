// pages/stock/edit/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import GreenAppBar from '@/components/GreenAppbar';  // ✅ unified eco-green AppBar
import NeutralInput from '@/components/NeutralInput'; // ✅ neutral-focus input

export default function EditStock() {
  const [stock, setStock] = useState({
    productId: '',
    warehouseId: '',
    quantity: '',
  });
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [stockRes, productRes, warehouseRes] = await Promise.all([
          fetch(`/api/stock/${id}`),
          fetch(`/api/products`),
          fetch(`/api/warehouses`),
        ]);

        if (!stockRes.ok || !productRes.ok || !warehouseRes.ok)
          throw new Error('Failed to load data');

        const [stockData, productsData, warehousesData] = await Promise.all([
          stockRes.json(),
          productRes.json(),
          warehouseRes.json(),
        ]);

        setStock(stockData);
        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    setStock({ ...stock, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/stock/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(stock.productId),
          warehouseId: parseInt(stock.warehouseId),
          quantity: parseInt(stock.quantity),
        }),
      });

      if (!res.ok) throw new Error('Failed to update stock');
      router.push('/stock');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress color="success" />
      </Box>
    );
  }

  return (
    <>
      <GreenAppBar />

      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '12px',
            backgroundColor: '#fff',
            boxShadow: `
              0 0 10px 2px rgba(76, 175, 80, 0.25),
              0 4px 8px rgba(0, 0, 0, 0.05)
            `,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Stock Record
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <NeutralInput
              select
              margin="normal"
              required
              fullWidth
              label="Product"
              name="productId"
              value={stock.productId}
              onChange={handleChange}
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </MenuItem>
              ))}
            </NeutralInput>

            <NeutralInput
              select
              margin="normal"
              required
              fullWidth
              label="Warehouse"
              name="warehouseId"
              value={stock.warehouseId}
              onChange={handleChange}
            >
              {warehouses.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </MenuItem>
              ))}
            </NeutralInput>

            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              inputProps={{ min: '0' }}
              value={stock.quantity}
              onChange={handleChange}
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#43A047' },
                }}
              >
                Update Stock
              </Button>

              <Button
                fullWidth
                variant="outlined"
                component={Link}
                href="/stock"
                sx={{
                  color: '#4CAF50',
                  borderColor: '#4CAF50',
                  '&:hover': {
                    borderColor: '#43A047',
                    color: '#43A047',
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
