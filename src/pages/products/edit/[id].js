
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
  TextField,
} from '@mui/material';
import GreenAppBar from '@/components/GreenAppBar';
import { getBaseUrl } from '@/lib/getBaseUrl';

export default function EditProduct({ product, error }) {
  const router = useRouter();
  const [formData, setFormData] = useState(product || { name: '', code: '', price: '' });
  const [formError, setFormError] = useState(error || null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = (data) => {
    if (!data.name?.trim() || !data.code?.trim() || !data.price) {
      return 'All fields are required.';
    }
    if (isNaN(data.price) || Number(data.price) <= 0) {
      return 'Price must be a positive number.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validate(formData);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.trim(),
          name: formData.name.trim(),
          price: Number(formData.price),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update product.');
      router.push('/products');
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
        <Container sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="contained"
            color="success"
            component={Link}
            href="/products"
            sx={{ mt: 2 }}
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
            Edit Product
          </Typography>

          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Product Code"
              name="code"
              value={formData.code || ''}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Product Name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Price"
              name="price"
              type="number"
              value={formData.price || ''}
              onChange={handleChange}
              required
              fullWidth
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
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Product'}
              </Button>

              <Button
                variant="outlined"
                component={Link}
                href="/products"
                sx={{
                  borderColor: '#4CAF50',
                  color: '#4CAF50',
                  fontWeight: 600,
                  '&:hover': { borderColor: '#43A047', color: '#43A047' },
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

export async function getServerSideProps(context) {
  const { id } = context.params;
  const baseUrl = getBaseUrl(context.req);

  try {
    const res = await fetch(`${baseUrl}/api/products/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch product with id: ${id}`);

    const product = await res.json();
    return { props: { product, error: null } };
  } catch (err) {
    return { props: { product: null, error: err.message } };
  }
}
