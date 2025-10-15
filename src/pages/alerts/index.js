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
      const res = await fetch('/api/alerts');
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data = await res.json();
      setAlerts(data);
      setError(null);
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError('Cannot load alerts at the moment.');
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      {/* ✅ Header bar */}
      <GreenAppBar />

      {/* ✅ Main content area */}
      <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
        {/* --- Page title centered horizontally --- */}
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            color: '#2E7D32',
            mb: 3,
            letterSpacing: 0.4,
          }}
        >
          Low Stock Alerts
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* ✅ When there are no alerts */}
        {alerts.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              mt: 6,
            }}
          >
            <Card
              elevation={2}
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 3,
                background:
                  'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
              }}
            >
              <CheckCircleOutlineIcon
                sx={{ fontSize: 60, color: '#43A047', mb: 1 }}
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
          /* ✅ Alerts grid centered under the title */
          <Grid
            container
            spacing={3}
            justifyContent="center"  // horizontally center the grid 
          >
            {alerts.map((a) => (
              <Grid
                key={`${a.warehouseId}-${a.productId}`}
                item
                xs={12}
                sm={6}
              >
                <Card
                  elevation={3}
                  sx={{
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
                    }}
                  >
                    <WarningAmberIcon
                      sx={{ fontSize: 40, color: '#E65100', mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {a.productName || 'Unknown Product'} (ID: {a.productId})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {a.warehouseName || 'Unknown Warehouse'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        Quantity remaining: {a.quantity}
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
