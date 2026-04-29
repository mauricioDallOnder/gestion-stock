import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeRegistry } from "@/theme/ThemeRegistry";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Controle de Alimentação Escolar",
  description: "Sistema de controle de estoque da alimentação escolar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <CssBaseline />
            {children}
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}