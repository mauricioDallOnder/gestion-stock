import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export default function RelatoriosPage() {
  return (
    <AppShell>
      <PageHeader
        title="Relatórios"
        description="Exportação de relatórios mensais em PDF, Excel ou CSV."
      />

      <Card>
        <CardContent>
          <Typography>
            Nesta tela será possível gerar o relatório oficial mensal.
          </Typography>
        </CardContent>
      </Card>
    </AppShell>
  );
}