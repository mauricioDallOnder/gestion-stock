"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ClotureMensuelle } from "@/types/fechamento";
import {
  calculerTotauxCloture,
  formaterDate,
  formaterNombre,
  moisLabels,
  statutClotureLabels,
  statutLigneLabels,
} from "@/features/fechamento/fechamentoUtils";

/**
 * Génère et télécharge le rapport PDF d'une clôture mensuelle.
 * Layout paysage, en-tête coloré, tableau avec totaux.
 */
export function exporterRapportPDF(cloture: ClotureMensuelle): void {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const totaux = calculerTotauxCloture(cloture.lignes);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // ─── En-tête ────────────────────────────────────────────────
  doc.setFillColor(31, 111, 74); // vert primaire
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Rapport de Clôture Mensuelle", margin, 13);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${moisLabels[cloture.mois]} ${cloture.annee}  ·  Statut : ${statutClotureLabels[cloture.statut]}`,
    margin,
    21
  );

  if (cloture.dateCloture) {
    doc.setFontSize(9);
    doc.text(
      `Clôturé le ${new Date(cloture.dateCloture).toLocaleDateString("fr-FR")}`,
      margin,
      27
    );
  }

  // ─── Cartes de résumé ───────────────────────────────────────
  doc.setTextColor(50, 50, 50);
  const yResume = 38;
  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cards = [
    { label: "Produits", valeur: totaux.totalProduits.toString() },
    { label: "Total reçu", valeur: formaterNombre(totaux.totalRecu) },
    { label: "Total consommé", valeur: formaterNombre(totaux.totalConsomme) },
    { label: "Stock final", valeur: formaterNombre(totaux.totalStockActuel) },
  ];

  cards.forEach((card, i) => {
    const x = margin + i * (cardWidth + 3);
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 250, 247);
    doc.roundedRect(x, yResume, cardWidth, 18, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(card.label.toUpperCase(), x + 3, yResume + 6);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(card.valeur, x + 3, yResume + 14);
    doc.setFont("helvetica", "normal");
  });

  // ─── Alertes ────────────────────────────────────────────────
  let yAlertes = yResume + 24;
  if (totaux.totalIncoherences > 0 || totaux.totalStockFaible > 0) {
    doc.setFontSize(9);
    if (totaux.totalIncoherences > 0) {
      doc.setTextColor(211, 47, 47);
      doc.text(
        `⚠ ${totaux.totalIncoherences} incohérence(s) détectée(s)`,
        margin,
        yAlertes
      );
      yAlertes += 5;
    }
    if (totaux.totalStockFaible > 0) {
      doc.setTextColor(230, 168, 23);
      doc.text(
        `⚠ ${totaux.totalStockFaible} produit(s) à stock faible`,
        margin,
        yAlertes
      );
      yAlertes += 5;
    }
    doc.setTextColor(50, 50, 50);
  }

  // ─── Tableau principal ──────────────────────────────────────
  autoTable(doc, {
    startY: yAlertes + 3,
    head: [
      [
        "Produit",
        "Un.",
        "Stock préc.",
        "Reçu",
        "Stock compté",
        "Consommé",
        "Péremption",
        "Statut",
        "Observation",
      ],
    ],
    body: cloture.lignes.map((ligne) => [
      ligne.produitNom,
      ligne.unite,
      formaterNombre(ligne.stockAnterieur),
      formaterNombre(ligne.quantiteRecue),
      formaterNombre(ligne.stockActuelCompte),
      formaterNombre(ligne.quantiteConsommee),
      formaterDate(ligne.validitePlusProche),
      statutLigneLabels[ligne.statut],
      ligne.observation || "—",
    ]),
    foot: [
      [
        { content: "Totaux", colSpan: 2, styles: { halign: "right" } },
        formaterNombre(totaux.totalStockAnterieur),
        formaterNombre(totaux.totalRecu),
        formaterNombre(totaux.totalStockActuel),
        formaterNombre(totaux.totalConsomme),
        "",
        "",
        "",
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [31, 111, 74],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: 40,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 12, halign: "center" },
      2: { cellWidth: 22, halign: "right" },
      3: { cellWidth: 18, halign: "right" },
      4: { cellWidth: 24, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 25 },
      7: { cellWidth: 25 },
      8: { cellWidth: "auto" },
    },
    didParseCell: (data) => {
      // Surligne les lignes incohérentes
      if (data.section === "body" && data.row.index < cloture.lignes.length) {
        const ligne = cloture.lignes[data.row.index];
        if (ligne.statut === "incoherent") {
          data.cell.styles.fillColor = [253, 235, 235];
        }
      }
    },
  });

  // ─── Pied de page ───────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    `Généré le ${new Date().toLocaleString("fr-FR")} · Système de Contrôle de la Restauration Scolaire`,
    margin,
    pageHeight - 8
  );

  // Numéro de page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} / ${totalPages}`, pageWidth - margin - 20, pageHeight - 8);
  }

  // Téléchargement
  const fileName = `cloture_${moisLabels[cloture.mois].toLowerCase()}_${cloture.annee}.pdf`;
  doc.save(fileName);
}