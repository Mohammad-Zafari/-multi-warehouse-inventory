// pages/stock/add.js
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
  Alert,
  CircularProgress,
} from '@mui/material';
import GreenAppBar from '@/components/GreenAppbar';
import NeutralInput from '@/components/NeutralInput'; // 👈 imported neutral component

export default function AddStock() {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, warehouseRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/warehouses'),
        ]);

        if (!productRes.ok || !warehouseRes.ok) {
          throw new Error('Failed to fetch products or warehouses');
        }

        const [productsData, warehousesData] = await Promise.all([
          productRes.json(),
          warehouseRes.json(),
        ]);

        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setStock({ ...stock, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(stock.productId),
          warehouseId: parseInt(stock.warehouseId),
          quantity: parseInt(stock.quantity),
        }),
      });

      if (res.ok) {
        router.push('/stock');
      } else {
        throw new Error('Failed to add new stock');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <GreenAppBar />

      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '12px',
            boxShadow: `
              0 0 10px 2px rgba(76, 175, 80, 0.25),
              0 4px 8px rgba(0, 0, 0, 0.05)
            `,
            backgroundColor: '#fff',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Add Stock Record
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress color="success" />
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 2 }}
            >
              <NeutralInput
                select
                required
                label="Product"
                name="productId"
                value={stock.productId}
                onChange={handleChange}
                margin="normal"
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </MenuItem>
                ))}
              </NeutralInput>

              <NeutralInput
                select
                required
                label="Warehouse"
                name="warehouseId"
                value={stock.warehouseId}
                onChange={handleChange}
                margin="normal"
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </MenuItem>
                ))}
              </NeutralInput>

              <NeutralInput
                required
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                inputProps={{ min: '0' }}
                value={stock.quantity}
                onChange={handleChange}
                margin="normal"
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
                  Add Stock
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  href="/stock"
                  sx={{
                    color: '#4CAF50',
                    borderColor: '#4CAF50',
                    '&:hover': { borderColor: '#43A047', color: '#43A047' },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
}
