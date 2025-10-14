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

export default function EditStock({ initialStock, products, warehouses, error }) {
  const [stock, setStock] = useState(initialStock || {});
  const [actionError, setActionError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setStock({ ...stock, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);

    try {
      const res = await fetch(`/api/stock/${stock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(stock.productId),
          warehouseId: parseInt(stock.warehouseId),
          quantity: parseInt(stock.quantity),
        }),
      });

      if (!res.ok) throw new Error('Failed to update stock record.');
      router.push('/stock');
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (error) {
    return (
      <>
        <GreenAppBar />
        <Container sx={{ mt: 10 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            color="success"
            component={Link}
            href="/stock"
          >
            Back to Stock List
          </Button>
        </Container>
      </>
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
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            color="success.main"
            fontWeight={700}
          >
            Edit Stock Record
          </Typography>

          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionError}
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
              value={stock.productId || ''}
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
              value={stock.warehouseId || ''}
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
              type="number"
              label="Quantity"
              name="quantity"
              inputProps={{ min: '0' }}
              value={stock.quantity || ''}
              onChange={handleChange}
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
                  fontWeight: 600,
                  '&:hover': {
                    color: '#43A047',
                    borderColor: '#43A047',
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

// ─────────────────────────────── SSR
export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const [stockRes, productsRes, warehousesRes] = await Promise.all([
      fetch(`${baseUrl}/api/stock/${id}`),
      fetch(`${baseUrl}/api/products`),
      fetch(`${baseUrl}/api/warehouses`),
    ]);

    if (!stockRes.ok || !productsRes.ok || !warehousesRes.ok) {
      throw new Error('Failed to fetch stock or related data.');
    }

    const [initialStock, products, warehouses] = await Promise.all([
      stockRes.json(),
      productsRes.json(),
      warehousesRes.json(),
    ]);

    return { props: { initialStock, products, warehouses } };
  } catch (err) {
    console.error('SSR Error [stock/edit/[id]]:', err);
    return {
      props: {
        initialStock: null,
        products: [],
        warehouses: [],
        error: err.message || 'Server failed to load data.',
      },
    };
  }
}
