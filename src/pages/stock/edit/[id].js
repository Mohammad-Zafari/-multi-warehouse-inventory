import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
} from '@mui/material';
import GreenAppBar from '@/components/GreenAppBar';
import { getBaseUrl } from '@/lib/getBaseUrl';

export default function EditStock({ initialStock, products, warehouses, error }) {
  const router = useRouter();
  const [stock, setStock] = useState(
    initialStock || { product_id: '', warehouse_id: '', quantity: 0 }
  );
  const [formError, setFormError] = useState(error || null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setStock({ ...stock, [event.target.name]: event.target.value });
  };

  const validate = (data) => {
    if (!data.product_id || !data.warehouse_id || !data.quantity) {
      return 'All fields are required.';
    }
    if (isNaN(data.quantity) || Number(data.quantity) <= 0) {
      return 'Quantity must be a positive number.';
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    const validationError = validate(stock);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/stock/${stock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: stock.product_id,
          warehouse_id: stock.warehouse_id,
          quantity: Number(stock.quantity),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update stock.');
      router.push('/stock');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <>
        <GreenAppBar />
        <Container sx={{ py: { xs: 3, sm: 5 }, textAlign: 'center' }}>
          <Alert severity="error">{error}</Alert>
          <Button variant="contained" color="success" sx={{ mt: 2 }} component={Link} href="/stock">
            Back to Stock
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <GreenAppBar />
      <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 5 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: '12px',
            bgcolor: '#fff',
            boxShadow: '0 0 8px 2px rgba(76,175,80,0.12), 0 4px 10px rgba(0,0,0,0.04)',
          }}
        >
          <Typography variant="h4" fontWeight={700} color="success.main" gutterBottom>
            Edit Stock
          </Typography>

          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl fullWidth required>
              <InputLabel>Product</InputLabel>
              <Select
                name="product_id"
                value={stock.product_id}
                label="Product"
                onChange={handleChange}
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Warehouse</InputLabel>
              <Select
                name="warehouse_id"
                value={stock.warehouse_id}
                label="Warehouse"
                onChange={handleChange}
              >
                {warehouses.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {w.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              value={stock.quantity}
              onChange={handleChange}
              fullWidth
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#4CAF50',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#43A047' },
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Stock'}
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/stock"
                sx={{
                  borderColor: '#4CAF50',
                  color: '#4CAF50',
                  fontWeight: 600,
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

// ✅ SSR Standardized
export async function getServerSideProps(context) {
  const { id } = context.params;
  const baseUrl = getBaseUrl(context.req);
  try {
    const [stockRes, productsRes, warehousesRes] = await Promise.all([
      fetch(`${baseUrl}/api/stock/${id}`),
      fetch(`${baseUrl}/api/products`),
      fetch(`${baseUrl}/api/warehouses`),
    ]);

    if (!stockRes.ok) throw new Error(`Stock not found (id: ${id}).`);
    if (!productsRes.ok || !warehousesRes.ok) throw new Error('Failed to fetch related data.');

    const [initialStock, products, warehouses] = await Promise.all([
      stockRes.json(),
      productsRes.json(),
      warehousesRes.json(),
    ]);

    return { props: { initialStock, products, warehouses, error: null } };
  } catch (err) {
    return { props: { initialStock: null, products: [], warehouses: [], error: err.message } };
  }
}
