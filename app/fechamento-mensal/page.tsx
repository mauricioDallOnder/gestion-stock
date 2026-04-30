import { AppShell } from "@/components/layout/AppShell";
import { ClotureMensuellePage } from "@/features/fechamento/FechamentoMensalPage";

export default function FechamentoMensalRoutePage() {
  return (
    <AppShell>
      <ClotureMensuellePage />
    </AppShell>
  );
}