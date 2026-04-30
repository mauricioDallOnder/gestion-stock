import { AppShell } from "@/components/layout/AppShell";
import { StockPage } from "@/features/estoque/EstoquePage";

export default function EstoqueRoutePage() {
  return (
    <AppShell>
      <StockPage />
    </AppShell>
  );
}