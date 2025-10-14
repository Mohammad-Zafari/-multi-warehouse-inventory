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

export default function AddWarehouse() {
  const [warehouse, setWarehouse] = useState({
    name: '',
    location: '',
    code: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setWarehouse({ ...warehouse, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!warehouse.name || !warehouse.location || !warehouse.code) {
      setError('All fields are required.');
      return;
    }

    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouse),
      });

      if (!res.ok) throw new Error('Failed to add warehouse.');

      setSuccess(true);
      setTimeout(() => router.push('/warehouses'), 600); // ✅ short redirect delay for UX feedback
    } catch (err) {
      setError(err.message);
    }
  };

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
            Add New Warehouse
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Warehouse added successfully!
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
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#43A047' },
                }}
              >
                Add Warehouse
              </Button>

              <Button
                fullWidth
                variant="outlined"
                component={Link}
                href="/warehouses"
                sx={{
                  color: '#4CAF50',
                  borderColor: '#4CAF50',
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
