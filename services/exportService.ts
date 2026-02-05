
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DailyLog, Recipe } from '../types';
import { CATEGORY_LABELS, RESTAURANT_NAME } from '../constants';

export const exportDailyLogToPDF = (log: DailyLog, restaurantName: string = RESTAURANT_NAME) => {
  const doc = new jsPDF() as any;
  const dateStr = new Date(log.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Header
  doc.setFontSize(22);
  doc.setTextColor(44, 62, 80);
  doc.text("REGISTRE SANITAIRE HACCP", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Établissement : ${restaurantName}`, 14, 32);
  doc.text(`Date du relevé : ${dateStr}`, 14, 37);
  doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 14, 42);

  // Table Data
  const tableRows = log.items.map(item => [
    CATEGORY_LABELS[item.category] || item.category,
    item.label,
    item.completed ? "VALIDE" : "NON FAIT",
    item.value ? `${item.value}${item.category === 'temperature' ? ' °C' : ''}` : "-",
    item.timestamp ? new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : "-"
  ]);

  doc.autoTable({
    startY: 50,
    head: [['Catégorie', 'Détail du Contrôle', 'Statut', 'Valeur', 'Heure']],
    body: tableRows,
    headStyles: { 
      fillColor: [67, 56, 202], 
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 20, halign: 'center' }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 50 },
    didDrawCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === "VALIDE") {
          doc.setTextColor(22, 101, 52); // Green
        } else {
          doc.setTextColor(185, 28, 28); // Red
        }
      } else {
        doc.setTextColor(44, 62, 80);
      }
    }
  });

  // Footer / Signature section
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(11);
  doc.setTextColor(44, 62, 80);
  doc.text("Observations éventuelles :", 14, finalY);
  doc.setDrawColor(200);
  doc.line(14, finalY + 5, 196, finalY + 5);
  doc.line(14, finalY + 15, 196, finalY + 15);

  doc.setFontSize(10);
  doc.text("Signature du responsable du contrôle :", 130, finalY + 30);
  doc.setDrawColor(100);
  doc.rect(130, finalY + 35, 60, 25);

  doc.save(`HACCP_${log.date}.pdf`);
};

export const exportHistoryToPDF = (logs: DailyLog[], restaurantName: string = RESTAURANT_NAME) => {
  const doc = new jsPDF() as any;

  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text("HISTORIQUE DES CONTRÔLES HACCP", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Établissement : ${restaurantName}`, 14, 30);
  doc.text(`Période : du ${logs[logs.length - 1].date} au ${logs[0].date}`, 14, 35);

  const tableRows = logs.map(log => [
    new Date(log.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    `${log.items.filter(i => i.completed).length} / ${log.items.length}`,
    log.items.every(i => i.completed) ? "CONFORME" : "INCOMPLET",
    log.items.filter(i => i.category === 'temperature' && i.completed).length === 6 ? "OK" : "MANQUANT"
  ]);

  doc.autoTable({
    startY: 45,
    head: [['Date', 'Contrôles effectués', 'Statut global', 'Temp. Matin/Soir']],
    body: tableRows,
    headStyles: { fillColor: [67, 56, 202] },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' }
    }
  });

  doc.save(`HACCP_Historique_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporte une étiquette de production au format 60x40mm (standard étiqueteuse)
 */
export const exportProductionLabel = (recipe: Recipe, restaurantName: string = RESTAURANT_NAME) => {
  // Format 60mm x 40mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [60, 40]
  });

  const now = new Date();
  const dlc = new Date();
  dlc.setDate(now.getDate() + recipe.shelfLifeDays);

  const formatDate = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const formatTime = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Style
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  
  // Nom Restaurant
  doc.setFont('helvetica', 'bold');
  doc.text(restaurantName.toUpperCase(), 30, 5, { align: 'center' });
  doc.line(5, 6, 55, 6);

  // Nom Produit
  doc.setFontSize(10);
  doc.text(recipe.name, 30, 12, { align: 'center', maxWidth: 50 });

  // Dates
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fabriqué le : ${formatDate(now)} à ${formatTime(now)}`, 5, 20);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`DLC : ${formatDate(dlc)}`, 5, 26);

  // Allergènes
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.text(`Allergènes: ${recipe.allergens.join(', ')}`, 5, 32, { maxWidth: 50 });

  // Footer / HACCP
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.text("À conserver entre 0°C et +4°C", 30, 37, { align: 'center' });

  // Simuler le téléchargement/impression
  doc.save(`Etiquette_${recipe.name.replace(/\s+/g, '_')}_${formatDate(now)}.pdf`);
};
