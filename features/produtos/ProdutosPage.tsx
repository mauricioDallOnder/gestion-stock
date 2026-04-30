"use client";

import { useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { PageHeader } from "@/components/ui/PageHeader";
import { useAppContext } from "@/context/AppContext";

import type { Produit, ProduitFormValues } from "@/types/produto";

import { ProduitFormDialog } from "./ProdutoFormDialog";
import { ProduitsTable } from "./ProdutosTable";
import { produitVersFormValues } from "./produtoUtils";

type FiltreStatut = "tous" | "actifs" | "inactifs";

export function ProduitsPage() {
  const {
    produits,
    ajouterProduit,
    modifierProduit,
    basculerActifProduit,
    supprimerProduit,
  } = useAppContext();

  const [mounted, setMounted] = useState(false);

  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>("tous");
  const [dialogueOuvert, setDialogueOuvert] = useState(false);
  const [produitEnEdition, setProduitEnEdition] = useState<Produit | null>(
    null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const produitsFiltres = useMemo(() => {
    const rechercheNormalisee = recherche.trim().toLowerCase();

    return produits.filter((produit) => {
      const correspondRecherche = produit.nom
        .toLowerCase()
        .includes(rechercheNormalisee);

      const correspondStatut =
        filtreStatut === "tous" ||
        (filtreStatut === "actifs" && produit.actif) ||
        (filtreStatut === "inactifs" && !produit.actif);

      return correspondRecherche && correspondStatut;
    });
  }, [recherche, produits, filtreStatut]);

  const totalActifs = produits.filter((produit) => produit.actif).length;
  const totalInactifs = produits.filter((produit) => !produit.actif).length;

  function handleNouveauProduit() {
    setProduitEnEdition(null);
    setDialogueOuvert(true);
  }

  function handleModifierProduit(produit: Produit) {
    setProduitEnEdition(produit);
    setDialogueOuvert(true);
  }

  function handleFermerDialogue() {
    setDialogueOuvert(false);
    setProduitEnEdition(null);
  }

  function handleEnregistrerProduit(values: ProduitFormValues) {
    if (produitEnEdition) {
      modifierProduit(produitEnEdition.id, values);
    } else {
      ajouterProduit(values);
    }

    handleFermerDialogue();
  }

  function handleSupprimerProduit(produitId: string) {
    const produit = produits.find((item) => item.id === produitId);

    if (!produit) return;

    const confirme = window.confirm(
      `Voulez-vous vraiment supprimer le produit « ${produit.nom} » ?`
    );

    if (!confirme) return;

    supprimerProduit(produitId);
  }

  if (!mounted) {
    return (
      <>
        <PageHeader
          title="Produits"
          description="Catalogue des denrées alimentaires utilisées pour le suivi du stock, des réceptions et de la clôture mensuelle."
        />

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Chargement des produits...
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Produits"
        description="Catalogue des denrées alimentaires utilisées pour le suivi du stock, des réceptions et de la clôture mensuelle."
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Chip label={`${produits.length} produits`} />
          <Chip label={`${totalActifs} actifs`} color="success" />
          <Chip label={`${totalInactifs} inactifs`} variant="outlined" />
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNouveauProduit}
          sx={{
            alignSelf: { xs: "stretch", sm: "center" },
            whiteSpace: "nowrap",
          }}
        >
          Nouveau produit
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              label="Rechercher un produit"
              placeholder="Exemple : riz, haricots, lait..."
              value={recherche}
              onChange={(event) => setRecherche(event.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Statut"
              value={filtreStatut}
              onChange={(event) =>
                setFiltreStatut(event.target.value as FiltreStatut)
              }
              sx={{
                minWidth: { xs: "100%", md: 220 },
              }}
            >
              <MenuItem value="tous">Tous</MenuItem>
              <MenuItem value="actifs">Actifs uniquement</MenuItem>
              <MenuItem value="inactifs">Inactifs uniquement</MenuItem>
            </TextField>
          </Box>

          <ProduitsTable
            produits={produitsFiltres}
            onEdit={handleModifierProduit}
            onToggleActif={basculerActifProduit}
            onDelete={handleSupprimerProduit}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Les données sont enregistrées automatiquement dans le navigateur
              (localStorage). Elles persistent entre les sessions jusqu&apos;au
              vidage du cache.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <ProduitFormDialog
        open={dialogueOuvert}
        mode={produitEnEdition ? "edit" : "create"}
        initialValues={
          produitEnEdition ? produitVersFormValues(produitEnEdition) : undefined
        }
        onClose={handleFermerDialogue}
        onSubmit={handleEnregistrerProduit}
      />
    </>
  );
}