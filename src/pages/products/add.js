
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

    if (!product.sku || !product.name || !product.category || !product.unitCost) {
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
          reorderPoint: parseInt(product.reorderPoint, 10) || 10,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add the product.');
      }

      router.push('/products');
    } catch (err) {
      setError(err.message);
      console.error('Submission error:', err);
    }
  };

  return (
    <>
      <GreenAppBar />

      <Container
        maxWidth="sm"
        sx={{
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: '12px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'success.dark',
              mb: 3,
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
            }}
          >
            Add New Product
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="SKU"
              name="sku"
              value={product.sku}
              onChange={handleChange}
              autoFocus
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
              label="Unit Cost ($)"
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
              label="Reorder Point (e.g., 10)"
              name="reorderPoint"
              inputProps={{ min: '0' }}
              value={product.reorderPoint}
              onChange={handleChange}
            />

            <Box
              sx={{
                mt: 3,
                display: 'flex',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                gap: 2,
              }}
            >
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
                    backgroundColor: 'rgba(76, 175, 80, 0.04)',
                    borderColor: '#43A047',
                  },
                }}
              >
                Cancel
              </Button>
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
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
