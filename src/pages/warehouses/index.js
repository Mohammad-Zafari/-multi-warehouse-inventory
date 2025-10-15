// File: /pages/warehouses/index.js
// Fully Responsive Warehouses Management Page

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
import AddIcon from '@mui/icons-material/Add';
import GreenAppBar from '@/components/GreenAppBar';
import { useState, useEffect } from 'react';
import { getBaseUrl } from '@/lib/getBaseUrl';

export default function Warehouses({ warehouses: initialWarehouses, error }) {
  const [warehouses, setWarehouses] = useState(initialWarehouses || []);
  const [open, setOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Auto-refresh (5s)
  useEffect(() => {
    let isMounted = true;
    const fetchWarehouses = async () => {
      try {
        const res = await fetch('/api/warehouses', { cache: 'no-store' });
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

  const handleClickOpen = (id) => {
    setSelectedWarehouseId(id);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedWarehouseId(null);
  };
  const handleDelete = async () => {
    setActionError(null);
    try {
      const res = await fetch(`/api/warehouses/${selectedWarehouseId}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to delete warehouse.');
      setWarehouses((prev) => prev.filter((w) => w.id !== selectedWarehouseId));
      handleClose();
    } catch (err) {
      console.error('Delete error:', err);
      setActionError(err.message);
    }
  };

  return (
    <>
      <GreenAppBar />
      <Container sx={{ py: { xs: 3, sm: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { sm: 'center' },
            mb: { xs: 3, sm: 4 },
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            color="success.dark"
            fontWeight={700}
            sx={{ fontSize: { xs: '1.8rem', sm: '2.25rem' } }}
          >
            Warehouses
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href="/warehouses/add"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: '#4CAF50',
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { bgcolor: '#43A047' },
            }}
          >
            Add Warehouse
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Failed to load data:</strong> {error}
          </Alert>
        )}
        {actionError && (
          <Alert
            severity="warning"
            onClose={() => setActionError(null)}
            sx={{ mb: 2 }}
          >
            {actionError}
          </Alert>
        )}

        <Paper sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="warehouses table">
              <TableHead>
                <TableRow
                  sx={{
                    '& th': { fontWeight: '600', backgroundColor: 'action.hover' },
                  }}
                >
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {warehouses.map((warehouse) => (
                  <TableRow
                    key={warehouse.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{warehouse.code}</TableCell>
                    <TableCell>{warehouse.name}</TableCell>
                    <TableCell>{warehouse.location}</TableCell>
                    <TableCell align="right">
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
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ py: 5, color: 'text.secondary' }}
                    >
                      No warehouses available. Please add one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle fontWeight={600}>Delete Warehouse</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this warehouse? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

// --- SSR ---
export async function getServerSideProps(context) {
  const baseUrl =
    getBaseUrl(context.req) ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${baseUrl}/api/warehouses`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to fetch warehouses (status ${res.status})`
      );
    }

    const warehouses = await res.json();
    return { props: { warehouses, error: null } };
  } catch (err) {
    console.error('SSR Error [warehouses/index]:', err);
    return {
      props: {
        warehouses: [],
        error: err.message || 'SSR data fetch failed',
      },
    };
  }
}
