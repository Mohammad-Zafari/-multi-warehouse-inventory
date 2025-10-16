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
import GreenAppBar from '@/components/GreenAppBar';
import { getBaseUrl } from '@/lib/getBaseUrl';

export default function Stock({ stock: initialStock, products, warehouses, error }) {
  const [stock, setStock] = useState(initialStock || []);
  const [open, setOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const getProductName = (id) => {
    const p = products.find((x) => x.id === id);
    return p ? `${p.name} (${p.sku})` : `Unknown (ID: ${id})`;
  };
  const getWarehouseName = (id) => {
    const w = warehouses.find((x) => x.id === id);
    return w ? w.name : `Unknown (ID: ${id})`;
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
      if (!res.ok) throw new Error('Failed to delete the stock record.');
      setStock((prev) => prev.filter((i) => i.id !== selectedStockId));
      handleClose();
    } catch (err) {
      console.error('Delete error:', err);
      setActionError(err.message);
      handleClose();
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/stock', { cache: 'no-store' });
        if (!res.ok) return;
        const updated = await res.json();
        setStock(updated);
      } catch (err) {
        console.error('auto-refresh err:', err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <GreenAppBar />
      <Container maxWidth="lg" sx={{ py: 4, px: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: { sm: 'space-between' },
            alignItems: { sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'success.dark',
              textAlign: { xs: 'center', sm: 'left' },
            }}
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
              '&:hover': { bgcolor: '#43A047' },
            }}
          >
            Add Stock Record
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {actionError && <Alert severity="warning" sx={{ mb: 2 }}>{actionError}</Alert>}

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(76,175,80,0.1)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Warehouse</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stock.map((i) => (
                <TableRow key={i.id} hover>
                  <TableCell>{getProductName(i.productId)}</TableCell>
                  <TableCell>{getWarehouseName(i.warehouseId)}</TableCell>
                  <TableCell align="right" sx={{
                    color: i.quantity <= i.reorderPoint ? '#F57C00' : 'inherit',
                    fontWeight: i.quantity <= i.reorderPoint ? 'bold' : 'normal',
                  }}>
                    {i.quantity}
                  </TableCell>
                  <TableCell>
                    <IconButton component={Link} href={`/stock/edit/${i.id}`} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleClickOpen(i.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {stock.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No stock records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Delete Stock Record</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure? This action is permanent.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDelete} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  const baseUrl =
    getBaseUrl(context.req) ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000';

  try {
    const controllers = [new AbortController(), new AbortController(), new AbortController()];
    const timeout = setTimeout(() => controllers.forEach(c => c.abort()), 5000);

    const [stockRes, productsRes, warehousesRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/stock`, { signal: controllers[0].signal }),
      fetch(`${baseUrl}/api/products`, { signal: controllers[1].signal }),
      fetch(`${baseUrl}/api/warehouses`, { signal: controllers[2].signal }),
    ]);

    clearTimeout(timeout);

    if (
      stockRes.status !== 'fulfilled' ||
      productsRes.status !== 'fulfilled' ||
      warehousesRes.status !== 'fulfilled'
    ) {
      throw new Error('One or more API requests failed or timed out.');
    }

    const [stock, products, warehouses] = await Promise.all([
      stockRes.value.json(),
      productsRes.value.json(),
      warehousesRes.value.json(),
    ]);

    return { props: { stock, products, warehouses, error: null } };
  } catch (err) {
    console.error('SSR Error [stock/index]:', err);
    return {
      props: {
        stock: [],
        products: [],
        warehouses: [],
        error: err.message || 'SSR data fetch failed.',
      },
    };
  }
}
