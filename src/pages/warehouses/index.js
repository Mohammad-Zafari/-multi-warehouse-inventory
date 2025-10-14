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
import { useState, useEffect } from 'react';

export default function Warehouses({ warehouses: initialWarehouses, error }) {
  const [warehouses, setWarehouses] = useState(initialWarehouses || []);
  const [open, setOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // ──────────────────────────────── Auto Re-fetch (5s) ────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const fetchWarehouses = async () => {
      try {
        const res = await fetch('/api/warehouses');
        if (!res.ok) throw new Error('Failed to re-fetch warehouses.');
        const data = await res.json();
        if (isMounted) setWarehouses(data);
      } catch (err) {
        console.error('Re-fetch error:', err);
      }
    };

    const interval = setInterval(fetchWarehouses, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ──────────────────────────────── Delete Logic ────────────────────────────────
  const handleClickOpen = (id) => {
    setSelectedWarehouseId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedWarehouseId(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/warehouses/${selectedWarehouseId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete warehouse.');
      setWarehouses((prev) => prev.filter((w) => w.id !== selectedWarehouseId));
      handleClose();
    } catch (err) {
      console.error('Delete error:', err);
      setActionError(err.message);
    }
  };

  // ──────────────────────────────── UI ────────────────────────────────
  return (
    <>
      <GreenAppBar />
      <Container sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" color="success.main" fontWeight={700}>
            Warehouses
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href="/warehouses/add"
            sx={{
              bgcolor: '#4CAF50',
              fontWeight: 600,
              '&:hover': { bgcolor: '#45a049' },
            }}
          >
            Add Warehouse
          </Button>
        </Box>

        {/* Error Messages */}
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

        {/* Table Display */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
                <TableCell><strong>Code</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.id} hover>
                  <TableCell>{warehouse.code}</TableCell>
                  <TableCell>{warehouse.name}</TableCell>
                  <TableCell>{warehouse.location}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      component={Link}
                      href={`/warehouses/edit/${warehouse.id}`}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleClickOpen(warehouse.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {warehouses.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No warehouses available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete confirmation dialog */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Delete Warehouse</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this warehouse? This action cannot be undone.
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

// ──────────────────────────────── SSR ────────────────────────────────
export async function getServerSideProps() {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/warehouses`);
    if (!res.ok) throw new Error('Failed to fetch warehouses.');
    const warehouses = await res.json();
    return { props: { warehouses } };
  } catch (err) {
    console.error('SSR Error loading warehouses:', err);
    return {
      props: {
        warehouses: [],
        error: err.message || 'Unexpected error while loading warehouses.',
      },
    };
  }
}
