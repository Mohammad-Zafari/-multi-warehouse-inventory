// pages/warehouses/edit/[id].js
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
import GreenAppBar from '@/components/GreenAppbar';  // ✅ unified eco-green AppBar
import NeutralInput from '@/components/NeutralInput'; // ✅ neutral-focus input

export default function EditWarehouse() {
  const [warehouse, setWarehouse] = useState({
    name: '',
    location: '',
    code: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchWarehouse = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/warehouses/${id}`);
        if (!res.ok) throw new Error('Failed to fetch warehouse data');
        const data = await res.json();
        setWarehouse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouse();
  }, [id]);

  const handleChange = (e) => {
    setWarehouse({ ...warehouse, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/warehouses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouse),
      });
      if (!res.ok) throw new Error('Failed to update warehouse');
      router.push('/warehouses');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
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
            Edit Warehouse
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
              label="Warehouse Code"
              name="code"
              value={warehouse.code}
              onChange={handleChange}
            />

            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="Warehouse Name"
              name="name"
              value={warehouse.name}
              onChange={handleChange}
            />

            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="Location"
              name="location"
              value={warehouse.location}
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
                Update Warehouse
              </Button>

              <Button
                fullWidth
                variant="outlined"
                component={Link}
                href="/warehouses"
                sx={{
                  color: '#4CAF50',
                  borderColor: '#4CAF50',
                  '&:hover': {
                    borderColor: '#43A047',
                    color: '#43A04',
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
