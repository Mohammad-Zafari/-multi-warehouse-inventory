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
  CircularProgress,
} from '@mui/material';
import GreenAppBar from '@/components/GreenAppBar';
import NeutralInput from '@/components/NeutralInput';
import { getBaseUrl } from '@/lib/getBaseUrl'; 

export default function AddWarehouse() {
  const [warehouse, setWarehouse] = useState({
    name: '',
    location: '',
    code: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (event) => {
    setWarehouse({ ...warehouse, [event.target.name]: event.target.value });
  };

  const validate = (data) => {
    if (!data.code?.trim() || !data.name?.trim() || !data.location?.trim()) {
      return 'All fields are required.';
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate(warehouse);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: warehouse.code.trim(),
          name: warehouse.name.trim(),
          location: warehouse.location.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add warehouse.');
      }

      setSuccess(true);
      setTimeout(() => router.push('/warehouses'), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            boxShadow:
              '0 0 8px 2px rgba(76,175,80,0.12), 0 4px 10px rgba(0,0,0,0.04)',
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            fontWeight={700}
            color="success.main"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            Add New Warehouse
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">Warehouse added successfully!</Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 3,
            }}
          >
            <NeutralInput
              label="Warehouse Code"
              name="code"
              value={warehouse.code}
              onChange={handleChange}
              required
              fullWidth
            />
            <NeutralInput
              label="Warehouse Name"
              name="name"
              value={warehouse.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <NeutralInput
              label="Location"
              name="location"
              value={warehouse.location}
              onChange={handleChange}
              required
              fullWidth
            />

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column-reverse', sm: 'row' },
              }}
            >
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
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Add Warehouse'
                )}
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/warehouses"
                sx={{
                  borderColor: '#4CAF50',
                  color: '#4CAF50',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#43A047',
                    color: '#43A047',
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
