import { useState } from 'react';
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
} from '@mui/material';
import GreenAppBar from '@/components/GreenAppBar';
import NeutralInput from '@/components/NeutralInput';

export default function AddStock({ products = [], warehouses = [], error }) {
  const [stock, setStock] = useState({
    productId: '',
    warehouseId: '',
    quantity: '',
  });
  const [actionError, setActionError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setStock({ ...stock, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);

    if (!stock.productId || !stock.warehouseId || !stock.quantity) {
      setActionError('Please fill in all fields.');
      return;
    }

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

      if (!res.ok) throw new Error('Failed to add new stock record.');

      router.push('/stock');
    } catch (err) {
      setActionError(err.message);
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
            backgroundColor: '#fff',
            boxShadow: `
              0 0 10px 2px rgba(76, 175, 80, 0.25),
              0 4px 8px rgba(0, 0, 0, 0.05)
            `,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            color="success.main"
            gutterBottom
          >
            Add Stock Record
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load data: {error}
            </Alert>
          )}

          {actionError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}

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
              fullWidth
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
              fullWidth
            >
              {warehouses.map((wh) => (
                <MenuItem key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code})
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
                  fontWeight: 600,
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
                  fontWeight: 600,
                  '&:hover': { color: '#43A047', borderColor: '#43A047' },
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

// ─────────────────────────────── SSR
export async function getServerSideProps() {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const [productsRes, warehousesRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`),
      fetch(`${baseUrl}/api/warehouses`),
    ]);

    if (!productsRes.ok || !warehousesRes.ok) {
      throw new Error('Failed to fetch products/warehouses.');
    }

    const [products, warehouses] = await Promise.all([
      productsRes.json(),
      warehousesRes.json(),
    ]);

    return { props: { products, warehouses } };
  } catch (err) {
    console.error('SSR Error [stock/add]:', err);
    return {
      props: {
        products: [],
        warehouses: [],
        error: err.message || 'Unexpected server error.',
      },
    };
  }
}
