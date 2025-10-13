// pages/products/edit/[id].js
import { useState, useEffect } from 'react';
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
} from '@mui/material';
import GreenAppBar from '@/components/GreenAppbar'; // ✅ eco‑green AppBar
import NeutralInput from '@/components/NeutralInput'; // ✅ neutral gray‑focus input

export default function EditProduct() {
  const [product, setProduct] = useState({
    sku: '',
    name: '',
    category: '',
    unitCost: '',
    reorderPoint: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product data');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          unitCost: parseFloat(product.unitCost),
          reorderPoint: parseInt(product.reorderPoint),
        }),
      });
      if (!res.ok) throw new Error('Failed to update product');
      router.push('/products');
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
            Edit Product
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

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
              label="Unit Cost"
              name="unitCost"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={product.unitCost}
              onChange={handleChange}
            />

            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="Reorder Point"
              name="reorderPoint"
              type="number"
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
                  '&:hover': { bgcolor: '#43A047' },
                }}
              >
                Update Product
              </Button>

              <Button
                fullWidth
                variant="outlined"
                component={Link}
                href="/products"
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
