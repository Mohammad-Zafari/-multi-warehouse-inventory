// File: /components/GreenAppBar.js
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SpaIcon from "@mui/icons-material/Spa";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Link from "next/link";
import { useRouter } from "next/router";

const menuItems = [
  { label: "Dashboard", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Warehouses", href: "/warehouses" },
  { label: "Stock", href: "/stock" },
  { label: "Transfer", href: "/stock-transfer" },
  { label: "Alerts", href: "/alerts" },
];

export default function GreenAppBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const toggleDrawer = (open) => () => setMobileOpen(open);

  const handleNav = (href) => {
    setMobileOpen(false); // فوراً Drawer بسته شود
    // در فریم بعد Router را اجرا کن تا DOM پاک شده باشد
    setTimeout(() => router.push(href), 0);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          bgcolor: "#4CAF50",
          boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1.5, sm: 3 },
          }}
        >
          <SpaIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.4rem" },
              letterSpacing: "0.5px",
            }}
          >
            GreenSupply Co.
          </Typography>

          {/* Buttons (Desktop) */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1.5 }}>
            {menuItems.map((item) => (
              <Button
                key={item.href}
                color="inherit"
                component={Link}
                href={item.href}
                sx={{
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: { md: "1rem" },
                  px: 1.2,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Burger (Mobile) */}
          <IconButton
            color="inherit"
            edge="end"
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: "flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer with no animation */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleDrawer(false)}
        transitionDuration={0} // انیمیشن صفر
        PaperProps={{
          sx: {
            width: 250,
            background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
            boxShadow: "-2px 0 10px rgba(0,0,0,0.15)",
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            overflow: "hidden",
          },
        }}
      >
        <Box
          role="presentation"
          sx={{
            py: 2,
            px: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="success.main"
              sx={{ mb: 1.5, textAlign: "center", letterSpacing: "0.3px" }}
            >
              GreenSupply Co.
            </Typography>
            <Divider sx={{ mb: 2, bgcolor: "rgba(76,175,80,0.3)" }} />

            <List>
              {menuItems.map((item) => (
                <ListItem key={item.href} disablePadding>
                  <ListItemButton
                    onClick={() => handleNav(item.href)} // ناوبری فوری
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      "&:hover": {
                        backgroundColor: "#A5D6A7",
                        transform: "translateX(-4px)",
                        transition: "all 0.1s ease-in-out",
                      },
                    }}
                  >
                    <ArrowForwardIosIcon
                      sx={{ fontSize: 14, color: "success.main", mr: 1 }}
                    />
                    <ListItemText
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: "text.primary",
                      }}
                      primary={item.label}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: "center",
              py: 1,
              fontSize: "0.75rem",
              opacity: 0.8,
            }}
          >
            © {new Date().getFullYear()} GreenSupply – All Rights Reserved
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}
