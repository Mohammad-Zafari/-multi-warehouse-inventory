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

export default function EditWarehouse({ initialWarehouse, error }) {
  const router = useRouter();
  const [warehouse, setWarehouse] = useState(initialWarehouse || {});
  const [actionError, setActionError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setActionError(null);

    const validationError = validate(warehouse);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/warehouses/${warehouse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: warehouse.code.trim(),
          name: warehouse.name.trim(),
          location: warehouse.location.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message || 'Failed to update warehouse.');

      router.push('/warehouses');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <>
        <GreenAppBar />
        <Container sx={{ py: { xs: 3, sm: 5 }, textAlign: 'center' }}>
          <Alert severity="error">{error}</Alert>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            component={Link}
            href="/warehouses"
            color="success"
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
      <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 5 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: '12px',
            backgroundColor: '#fff',
            boxShadow:
              '0 0 8px 2px rgba(76,175,80,0.12), 0 4px 10px rgba(0,0,0,0.04)',
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            color="success.main"
            gutterBottom
          >
            Edit Warehouse
          </Typography>

          {actionError && <Alert severity="error">{actionError}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}
          >
            <NeutralInput
              label="Warehouse Code"
              name="code"
              value={warehouse.code || ''}
              onChange={handleChange}
              required
              fullWidth
            />
            <NeutralInput
              label="Warehouse Name"
              name="name"
              value={warehouse.name || ''}
              onChange={handleChange}
              required
              fullWidth
            />
            <NeutralInput
              label="Location"
              name="location"
              value={warehouse.location || ''}
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
                  'Update Warehouse'
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

export async function getServerSideProps(context) {
  const { id } = context.params;
  const baseUrl = getBaseUrl(context.req);

  try {
    const res = await fetch(`${baseUrl}/api/warehouses/${id}`);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Failed to fetch warehouse data.');
    }

    const initialWarehouse = await res.json();
    return { props: { initialWarehouse, error: null } };
  } catch (err) {
    return { props: { initialWarehouse: null, error: err.message } };
  }
}
