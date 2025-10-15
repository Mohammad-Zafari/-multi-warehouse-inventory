// File: /pages/alerts/index.js
import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GreenAppBar from '@/components/GreenAppBar';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load alerts (status ${res.status})`);
      const data = await res.json();
      setAlerts(data);
      setError(null);
    } catch (err) {
      console.error('Error while fetching alerts:', err);
      setError('Cannot load alerts at the moment. Please try again later.');
    }
  };

  // Initial load + auto-refresh every 5s
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => {
      fetchAlerts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <GreenAppBar />
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 3, sm: 4, md: 5 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            color: '#2E7D32',
            mb: { xs: 3, sm: 4 },
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
          }}
        >
          Low Stock Alerts
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {alerts.length === 0 && !error ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mt: { xs: 3, sm: 4 },
            }}
          >
            <Card
              elevation={2}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                textAlign: 'center',
                borderRadius: 3,
                background:
                  'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                maxWidth: 500,
                width: '100%',
              }}
            >
              <CheckCircleOutlineIcon
                sx={{
                  fontSize: { xs: 48, sm: 60 },
                  color: '#43A047',
                  mb: 1,
                }}
              />
              <Typography variant="h6" color="text.primary">
                No low-stock items 🎉
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inventory levels are healthy across all warehouses.
              </Typography>
            </Card>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
            {alerts.map((a) => (
              <Grid
                key={`${a.warehouseId}-${a.productId}`}
                item
                xs={12}
                sm={6}
                md={4}
              >
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    borderRadius: 3,
                    background:
                      'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                    boxShadow: '0 4px 8px rgba(255,152,0,0.25)',
                    transition:
                      'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 5px 12px rgba(255,152,0,0.35)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: { xs: 2, sm: 2.5 },
                    }}
                  >
                    <WarningAmberIcon
                      sx={{
                        fontSize: { xs: 36, sm: 40 },
                        color: '#E65100',
                        mr: 2,
                      }}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                      >
                        {a.productName || 'Unknown Product'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In: {a.warehouseName || 'Unknown Warehouse'}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="error"
                        sx={{ mt: 1, fontWeight: 'bold' }}
                      >
                        Stock: {a.quantity}
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          (Threshold: {a.reorderPoint})
                        </Typography>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
