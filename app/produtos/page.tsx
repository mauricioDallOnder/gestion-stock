import { AppShell } from "@/components/layout/AppShell";
import { ProduitsPage } from "../../features/produtos/ProdutosPage"

export default function ProdutosRoutePage() {
  return (
    <AppShell>
      <ProduitsPage />
    </AppShell>
  );
}