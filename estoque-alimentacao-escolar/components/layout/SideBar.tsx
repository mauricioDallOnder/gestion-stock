"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
  },
  {
    label: "Produits",
    path: "/produtos",
  },
  {
    label: "Stock",
    path: "/estoque",
  },
  {
    label: "clôture mensuelle",
    path: "/fechamento-mensal",
  },
  {
    label: "Rapports",
    path: "/relatorios",
  },
];

type SidebarProps = {
  drawerWidth: number;
};

export function Sidebar({ drawerWidth }: SidebarProps) {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Toolbar />

      <Box sx={{ p: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Menu principal
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const selected = pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              component={Link}
              href={item.path}
              selected={selected}
              sx={{
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}