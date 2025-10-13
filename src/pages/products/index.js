// pages/products/index.js
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SpaIcon from '@mui/icons-material/Spa';
import GreenAppBar from '../../components/GreenAppBar'; // reusable Eco AppBar

export default function Products() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

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
      const res = await fetch(`/api/products/${selectedProductId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter((product) => product.id !== selectedProductId));
        handleClose();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <>
      {/* Green AppBar shared across app */}
      <GreenAppBar />

      <Container sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: '#2E7D32', fontWeight: 'bold' }}
          >
            Products
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': { bgcolor: '#388E3C' },
              color: '#fff',
              textTransform: 'none',
              fontWeight: 'bold',
            }}
            component={Link}
            href="/products/add"
          >
            + Add Product
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
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
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(76,175,80,0.05)' },
                  }}
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
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No products available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Dialog */}
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
              sx={{
                color: '#388E3C',
                fontWeight: 'bold',
              }}
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
