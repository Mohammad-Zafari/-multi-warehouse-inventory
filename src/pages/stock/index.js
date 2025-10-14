import { useState } from 'react';
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
import GreenAppBar from '@/components/GreenAppBar';

// Threshold for highlighting low-stock items
const LOW_STOCK_THRESHOLD = 10;

export default function Stock({ stock: initialStock, products, warehouses, error }) {
  const [stock, setStock] = useState(initialStock || []);
  const [open, setOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? `${product.name} (${product.sku})` : `Unknown (${productId})`;
  };

  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    return warehouse ? `${warehouse.name} (${warehouse.code})` : `Unknown (${warehouseId})`;
  };

  const handleClickOpen = (id) => {
    setSelectedStockId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStockId(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/stock/${selectedStockId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete stock record.');

      setStock(stock.filter((i) => i.id !== selectedStockId));
      handleClose();
    } catch (err) {
      console.error('Delete error:', err);
      setActionError(err.message);
    }
  };

  // ───────────────────────────── UI ─────────────────────────────
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
          >
            Stock Levels
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href="/stock/add"
            sx={{
              bgcolor: '#4CAF50',
              fontWeight: 600,
              '&:hover': { bgcolor: '#45a049' },
            }}
          >
            Add Stock Record
          </Button>
        </Box>

        {/* Error Handling */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load data: {error}</Alert>}
        {actionError && <Alert severity="warning" sx={{ mb: 2 }}>{actionError}</Alert>}

        {/* Stock Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Warehouse</strong></TableCell>
                <TableCell align="right"><strong>Quantity</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stock.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(76,175,80,0.05)' },
                  }}
                >
                  <TableCell>{getProductName(item.productId)}</TableCell>
                  <TableCell>{getWarehouseName(item.warehouseId)}</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: item.quantity <= LOW_STOCK_THRESHOLD ? '#F57C00' : 'inherit',
                      fontWeight: item.quantity <= LOW_STOCK_THRESHOLD ? 'bold' : 'normal',
                    }}
                  >
                    {item.quantity}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      component={Link}
                      href={`/stock/edit/${item.id}`}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleClickOpen(item.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {stock.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No stock records available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Delete Stock Record</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this stock record? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

// ───────────────────────────── SSR ─────────────────────────────
export async function getServerSideProps() {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const [stockRes, productsRes, warehousesRes] = await Promise.all([
      fetch(`${baseUrl}/api/stock`),
      fetch(`${baseUrl}/api/products`),
      fetch(`${baseUrl}/api/warehouses`),
    ]);

    if (!stockRes.ok || !productsRes.ok || !warehousesRes.ok) {
      throw new Error('Failed to fetch one or more resources.');
    }

    const [stock, products, warehouses] = await Promise.all([
      stockRes.json(),
      productsRes.json(),
      warehousesRes.json(),
    ]);

    return { props: { stock, products, warehouses } };
  } catch (err) {
    console.error('SSR Error loading stock data:', err);
    return {
      props: {
        stock: [],
        products: [],
        warehouses: [],
        error: err.message || 'Unexpected error while fetching stock data.',
      },
    };
  }
}
