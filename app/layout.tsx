import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeRegistry } from "@/theme/ThemeRegistry";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Contrôle de l'Alimentation Scolaire",
  description: "Système de contrôle de stock de l'alimentation scolaire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-FR" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <CssBaseline />
            <AppProvider>
              {children}
            </AppProvider>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
