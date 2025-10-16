import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import InventoryIcon from "@mui/icons-material/Inventory";
import GreenAppBar from "@/components/GreenAppBar";

const statusColors = {
  critical: "#D32F2F",
  low: "#FBC02D",
  adequate: "#388E3C",
  overstocked: "#1976D2",
  resolved: "#9E9E9E",
  reordered: "#80CBC4",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: "" }); // 🔹 برای اعلان

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error("Error fetching alerts:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, actionType) => {
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, actionType }),
      });
      await fetchAlerts();
      setToast({
        show: true,
        msg:
          actionType === "reordered"
            ? "Reorder placed ✅"
            : "Alert marked as resolved ✔",
      });
    } catch (err) {
      console.error("Action failed:", err.message);
      setToast({ show: true, msg: "Action failed ❌" });
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <Container sx={{ mt: 8 }}>
        <Typography variant="h6" align="center" color="text.secondary">
          Loading alerts...
        </Typography>
      </Container>
    );

  if (!alerts.length)
    return (
      <Box sx={{ backgroundColor: "#f9fafc", minHeight: "100vh" }}>
        <GreenAppBar />
        <Container maxWidth="md" sx={{ mt: 10, textAlign: "center" }}>
          <AssignmentTurnedInIcon
            sx={{ fontSize: 70, color: "#66BB6A", mb: 2 }}
          />
          <Typography variant="h5" sx={{ color: "#2E7D32", fontWeight: 600 }}>
            All stock levels are sufficient ✔
          </Typography>
        </Container>
      </Box>
    );

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", pb: 8 }}>
      <GreenAppBar />
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontWeight: 600, color: "#2E7D32" }}
        >
          Inventory Alerts
        </Typography>

        <Grid container spacing={3}>
          {alerts.map((alert) => (
            <Grid item xs={12} md={6} lg={4} key={alert.id}>
              <Card
                elevation={3}
                sx={{
                  borderLeft: `5px solid ${
                    statusColors[alert.status] || "#999"
                  }`,
                  borderRadius: 3,
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "translateY(-2px)" },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <InventoryIcon
                      sx={{ color: statusColors[alert.status], mr: 1 }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      {alert.productName}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Warehouse: <strong>{alert.warehouseName}</strong>
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Current Qty: <strong>{alert.quantity}</strong>
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Status:{" "}
                    <strong style={{ color: statusColors[alert.status] }}>
                      {alert.status.toUpperCase()}
                    </strong>
                  </Typography>

                  {(alert.status === "critical" ||
                    alert.status === "low") && (
                    <Alert
                      severity="warning"
                      sx={{
                        mb: 1.5,
                        backgroundColor: "#FFF8E1",
                        borderRadius: 2,
                        "& .MuiAlert-icon": { color: "#F9A825" },
                      }}
                    >
                      Recommended reorder quantity:{" "}
                      <b>{alert.reorderQty} units</b>
                    </Alert>
                  )}

                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: "#2E7D32",
                        color: "white",
                        textTransform: "none",
                        "&:hover": { backgroundColor: "#1B5E20" },
                      }}
                      onClick={() => handleAction(alert.id, "resolved")}
                      disabled={
                        alert.action === "resolved" ||
                        alert.action === "reordered"
                      }
                    >
                      Mark Resolved
                    </Button>

                    {(alert.status === "critical" ||
                      alert.status === "low") && (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          textTransform: "none",
                          borderColor: "#81C784",
                          color: "#2E7D32",
                          "&:hover": { backgroundColor: "#E8F5E9" },
                        }}
                        onClick={() => handleAction(alert.id, "reordered")}
                        disabled={alert.action === "reordered"}
                      >
                        {alert.action === "reordered"
                          ? "Reordered ✓"
                          : `Order ${alert.reorderQty}`}
                      </Button>
                    )}
                  </Box>

                  {alert.action === "resolved" && (
                    <Box
                      mt={1}
                      color="#9E9E9E"
                      fontSize={13}
                      display="flex"
                      alignItems="center"
                      gap={0.5}
                    >
                      <DoneAllIcon sx={{ fontSize: 18 }} /> Marked as resolved
                    </Box>
                  )}

                  {alert.action === "reordered" && (
                    <Box
                      mt={1}
                      color="#4DB6AC"
                      fontSize={13}
                      display="flex"
                      alignItems="center"
                      gap={0.5}
                    >
                      <DoneAllIcon sx={{ fontSize: 18 }} /> Reorder placed
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Snackbar
        open={toast.show}
        onClose={() => setToast({ show: false, msg: "" })}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={toast.msg}
      />
    </Box>
  );
}
