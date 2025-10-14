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

export default function EditWarehouse({ initialWarehouse, error }) {
  const router = useRouter();
  const [warehouse, setWarehouse] = useState(initialWarehouse || {});
  const [actionError, setActionError] = useState(null);

  const handleChange = (e) => {
    setWarehouse({ ...warehouse, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);

    try {
      const res = await fetch(`/api/warehouses/${warehouse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouse),
      });

      if (!res.ok) throw new Error('Failed to update warehouse record.');
      router.push('/warehouses');
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (error) {
    return (
      <>
        <GreenAppBar />
        <Container sx={{ mt: 10 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            color="success"
            component={Link}
            href="/warehouses"
          >
            Back to Warehouses
          </Button>
        </Container>
      </>
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
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight={700}
            color="success.main"
          >
            Edit Warehouse
          </Typography>

          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="Warehouse Code"
              name="code"
              value={warehouse.code || ''}
              onChange={handleChange}
            />
            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="Warehouse Name"
              name="name"
              value={warehouse.name || ''}
              onChange={handleChange}
            />
            <NeutralInput
              margin="normal"
              required
              fullWidth
              label="Location"
              name="location"
              value={warehouse.location || ''}
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
                  fontWeight: 600,
                  '&:hover': {
                    color: '#43A047',
                    borderColor: '#43A047',
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

// ─────────────────────────────── SSR
export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/warehouses/${id}`);

    if (!res.ok) {
      throw new Error('Failed to fetch warehouse data.');
    }

    const initialWarehouse = await res.json();

    return { props: { initialWarehouse } };
  } catch (err) {
    console.error('SSR Error [warehouses/edit/[id]]:', err);
    return {
      props: {
        initialWarehouse: null,
        error: err.message || 'Server failed to load warehouse data.',
      },
    };
  }
}
