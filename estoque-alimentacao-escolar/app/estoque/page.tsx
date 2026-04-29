import { AppShell } from "@/components/layout/AppShell";
import { EstoquePage } from "@/features/estoque/EstoquePage";

export default function EstoqueRoutePage() {
  return (
    <AppShell>
      <EstoquePage />
    </AppShell>
  );
}