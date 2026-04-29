import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PageHeader } from "@/components/ui/PageHeader";

const indicadores = [
  {
    titulo: "Produtos cadastrados",
    valor: "42",
    descricao: "Gêneros alimentícios ativos",
  },
  {
    titulo: "Produtos com alerta",
    valor: "5",
    descricao: "Validade próxima ou estoque zerado",
  },
  {
    titulo: "Fechamento atual",
    valor: "Março/2026",
    descricao: "Status: rascunho",
  },
  {
    titulo: "Inconsistências",
    valor: "2",
    descricao: "Linhas precisam de conferência",
  },
];

const alertas = [
  {
    produto: "Leite em pó pct 1kg",
    mensagem: "Validade próxima em 28 dias",
    status: "atenção",
  },
  {
    produto: "Óleo de soja un",
    mensagem: "Estoque contado maior que saldo esperado",
    status: "erro",
  },
  {
    produto: "Feijão carioca pct 1kg",
    mensagem: "Estoque baixo",
    status: "atenção",
  },
];

export function DashboardPage() {
  return (
    <Box>
      <PageHeader
        title="Dashboard"
        description="Visão geral do estoque, vencimentos e fechamento mensal da alimentação escolar."
      />

      <Grid container spacing={3}>
        {indicadores.map((item) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.titulo}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {item.titulo}
                </Typography>

                <Typography variant="h4" sx={{ mt: 1 }}>
                  {item.valor}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {item.descricao}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alertas principais
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                {alertas.map((alerta) => (
                  <Box
                    key={alerta.produto}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                    }}
                  >
                    <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
                >
                <Box>
                    <Typography fontWeight={700}>{alerta.produto}</Typography>
                    <Typography variant="body2" color="text.secondary">
                    {alerta.mensagem}
                    </Typography>
                </Box>

                <Chip
                    label={alerta.status}
                    color={alerta.status === "erro" ? "error" : "warning"}
                    size="small"
                />
                </Box>
                                </Box>
                                ))}
                            </Stack>
                            </CardContent>
                        </Card>
                        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Próxima etapa
              </Typography>

              <Typography variant="body1" color="text.secondary">
                Depois da base em Next.js, recriaremos o módulo de produtos com
                formulário, tabela, validação e dados simulados.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}