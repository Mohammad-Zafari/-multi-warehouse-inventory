import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SpaIcon from '@mui/icons-material/Spa';
import GreenAppBar from '@/components/GreenAppBar';
import { getBaseUrl } from '@/lib/getBaseUrl'; // ✅ اضافه شد

export default function Products({ products: initialProducts, error }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleClickOpen = (id) => {
    setSelectedProductId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProductId(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${selectedProductId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product.');
      setProducts((prev) => prev.filter((p) => p.id !== selectedProductId));
      handleClose();
    } catch (err) {
      console.error('Delete error:', err);
      setActionError(err.message);
    }
  };

  // ──────────────── Auto refresh ────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch updated products.');
        const updatedProducts = await res.json();
        setProducts(updatedProducts);
      } catch (err) {
        console.error('Auto refresh error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ──────────────── UI ────────────────
  return (
    <>
      <GreenAppBar />

      <Container sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            color="success.main"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <SpaIcon color="success" />
            Products
          </Typography>

          <Button
            variant="contained"
            component={Link}
            href="/products/add"
            sx={{
              bgcolor: '#4CAF50',
              fontWeight: 600,
              '&:hover': { bgcolor: '#388E3C' },
              color: '#fff',
            }}
          >
            + Add Product
          </Button>
        </Box>

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

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(76,175,80,0.1)' }}>
              <TableRow>
                <TableCell><strong>SKU</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell align="right"><strong>Unit Cost</strong></TableCell>
                <TableCell align="right"><strong>Reorder Point</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  hover
                  sx={{ '&:hover': { backgroundColor: 'rgba(76,175,80,0.05)' } }}
                >
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">${product.unitCost.toFixed(2)}</TableCell>
                  <TableCell align="right">{product.reorderPoint}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      component={Link}
                      href={`/products/edit/${product.id}`}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleClickOpen(product.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No products available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete confirmation */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
            Delete Product
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose}
              sx={{ color: '#388E3C', fontWeight: 'bold' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              autoFocus
              sx={{
                color: '#fff',
                bgcolor: '#E53935',
                '&:hover': { bgcolor: '#C62828' },
                fontWeight: 'bold',
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

// ─────────────────────────────── SSR ───────────────────────────────
export async function getServerSideProps(context) {
  try {
    const baseUrl = getBaseUrl(context.req); // ✅ به‌جای process.env
    const res = await fetch(`${baseUrl}/api/products`);

    if (!res.ok) {
      throw new Error(`SSR error fetching products (status ${res.status})`);
    }

    const products = await res.json();

    return { props: { products, error: null } };
  } catch (err) {
    console.error('SSR Error [products/index]:', err);
    return {
      props: {
        products: [],
        error: err.message || 'Unexpected error while loading products.',
      },
    };
  }
}
