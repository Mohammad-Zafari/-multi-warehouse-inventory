// File: /components/GreenAppBar.js

import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import SpaIcon from "@mui/icons-material/Spa";
import Link from "next/link";

export default function GreenAppBar() {
  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "#4CAF50",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
    >
      <Toolbar>
        <SpaIcon sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: "bold" }}
        >
          GreenSupply Co.
        </Typography>

        <Button color="inherit" component={Link} href="/">
          Dashboard
        </Button>
        <Button color="inherit" component={Link} href="/products">
          Products
        </Button>
        <Button color="inherit" component={Link} href="/warehouses">
          Warehouses
        </Button>
        <Button color="inherit" component={Link} href="/stock">
          Stock
        </Button>
        <Button color="inherit" component={Link} href="/stock-transfer">
          Transfer
        </Button>
        {/* ✅ Added alert link in same style */}
        <Button color="inherit" component={Link} href="/alerts">
          Alerts
        </Button>
      </Toolbar>
    </AppBar>
  );
}
