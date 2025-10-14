import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Alert,
} from '@mui/material';
import GreenAppBar from '@/components/GreenAppBar';
import NeutralInput from '@/components/NeutralInput';

export default function AddProduct() {
  const [product, setProduct] = useState({
    sku: '',
    name: '',
    category: '',
    unitCost: '',
    reorderPoint: '',
  });
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!product.sku || !product.name || !product.category) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          unitCost: parseFloat(product.unitCost) || 0,
          reorderPoint: parseInt(product.reorderPoint) || 0,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to add product');
      }

      router.push('/products');
    } catch (err) {
      setError(err.message);
    }
  };

  // ─────────────────────────────── UI ───────────────────────────────
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
            Add New Product
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="SKU"
              name="sku"
              value={product.sku}
              onChange={handleChange}
            />

            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="Product Name"
              name="name"
              value={product.name}
              onChange={handleChange}
            />

            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="Category"
              name="category"
              value={product.category}
              onChange={handleChange}
            />

            <NeutralInput
              margin="normal"
              required
              fullWidth
              type="number"
              label="Unit Cost"
              name="unitCost"
              inputProps={{ step: '0.01', min: '0' }}
              value={product.unitCost}
              onChange={handleChange}
            />

            <NeutralInput
              margin="normal"
              required
              fullWidth
              type="number"
              label="Reorder Point"
              name="reorderPoint"
              inputProps={{ min: '0' }}
              value={product.reorderPoint}
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
                Add Product
              </Button>

              <Button
                fullWidth
                variant="outlined"
                component={Link}
                href="/products"
                sx={{
                  color: '#4CAF50',
                  fontWeight: 600,
                  borderColor: '#4CAF50',
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
