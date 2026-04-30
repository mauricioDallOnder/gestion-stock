"use client";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import { Sidebar } from "./SideBar";
import { Topbar } from "./TopBar";

const drawerWidth = 260;

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Topbar drawerWidth={drawerWidth} />
      <Sidebar drawerWidth={drawerWidth} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Toolbar />

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}