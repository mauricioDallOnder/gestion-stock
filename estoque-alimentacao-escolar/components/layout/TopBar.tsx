"use client";

import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

type TopbarProps = {
  drawerWidth: number;
};

export function Topbar({ drawerWidth }: TopbarProps) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "primary.main",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Controle de Alimentação Escolar
        </Typography>

        <Button color="inherit" variant="outlined">
          Ano letivo 2026
        </Button>
      </Toolbar>
    </AppBar>
  );
}