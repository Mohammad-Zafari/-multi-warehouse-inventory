import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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

export default function EditProduct({ product: initialProduct, error }) {
  const [product, setProduct] = useState(initialProduct || {});
  const [actionError, setActionError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          unitCost: parseFloat(product.unitCost),
          reorderPoint: parseInt(product.reorderPoint),
        }),
      });

      if (!res.ok) throw new Error('Failed to update product.');
      router.push('/products');
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
            href="/products"
          >
            Back to Products
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
            fontWeight={700}
            color="success.main"
            gutterBottom
          >
            Edit Product
          </Typography>

          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
              margin="normal"
              required
              fullWidth
              label="SKU"
              name="sku"
              value={product.sku || ''}
              onChange={handleChange}
            />

            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="Product Name"
              name="name"
              value={product.name || ''}
              onChange={handleChange}
            />

            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="Category"
              name="category"
              value={product.category || ''}
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
              value={product.unitCost || ''}
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
              value={product.reorderPoint || ''}
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
                Update Product
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

// ─────────────────────────────── SSR
export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products/${id}`);

    if (!res.ok) throw new Error('Product not found.');

    const product = await res.json();
    return { props: { product } };
  } catch (err) {
    console.error('SSR Error [edit/[id]]:', err);
    return {
      props: {
        product: null,
        error: err.message || 'Failed to load product data.',
      },
    };
  }
}
