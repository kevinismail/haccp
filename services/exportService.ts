
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DailyLog, Recipe, TraceabilityRecord } from '../types';
import { CATEGORY_LABELS, RESTAURANT_NAME } from '../constants';

// Helper pour convertir une image URL en Base64 pour jsPDF
const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg', 0.7);
      resolve(dataURL);
    };
    img.onerror = error => reject(error);
    img.src = url;
  });
};

export const exportDailyLogToPDF = (log: DailyLog, restaurantName: string = RESTAURANT_NAME) => {
  const doc = new jsPDF() as any;
  const dateStr = new Date(log.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  doc.setFontSize(22);
  doc.setTextColor(44, 62, 80);
  doc.text("REGISTRE SANITAIRE HACCP", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Établissement : ${restaurantName}`, 14, 32);
  doc.text(`Date du relevé : ${dateStr}`, 14, 37);

  // SECTION 1: TEMPERATURES
  doc.setFontSize(14);
  doc.setTextColor(67, 56, 202);
  doc.text("1. Relevés de Températures Enceintes Froides", 14, 52);

  const tempItems = log.items.filter(i => i.category === 'temperature');
  const fridgeData: Record<string, { morning: string, evening: string }> = {};
  tempItems.forEach(item => {
    const fridgeName = item.label.split(' - ')[0];
    const isMatin = item.label.toLowerCase().includes('matin');
    if (!fridgeData[fridgeName]) fridgeData[fridgeName] = { morning: '-', evening: '-' };
    if (isMatin) fridgeData[fridgeName].morning = item.value ? `${item.value}°C` : 'N/C';
    else fridgeData[fridgeName].evening = item.value ? `${item.value}°C` : 'N/C';
  });

  doc.autoTable({
    startY: 57,
    head: [['Enceinte Froide', 'Temp. Matin', 'Temp. Soir', 'Norme']],
    body: Object.entries(fridgeData).map(([name, vals]) => [name, vals.morning, vals.evening, "OK (+2/+4°C)"]),
    headStyles: { fillColor: [67, 56, 202] }
  });

  // SECTION 2: AUTRES CONTROLES
  const nextY = doc.lastAutoTable.finalY + 15;
  doc.text("2. Contrôles Opérationnels & Hygiène", 14, nextY);
  const otherRows = log.items.filter(i => i.category !== 'temperature').map(item => [
    CATEGORY_LABELS[item.category] || item.category,
    item.label,
    item.completed ? "VALIDE" : "NON FAIT",
    item.timestamp ? new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : "-"
  ]);

  doc.autoTable({
    startY: nextY + 5,
    head: [['Catégorie', 'Détail', 'Statut', 'Heure']],
    body: otherRows,
    headStyles: { fillColor: [67, 56, 202] }
  });

  doc.save(`HACCP_${log.date}.pdf`);
};

export const exportTraceabilityToPDF = async (records: TraceabilityRecord[], periodLabel: string = "Archives") => {
  const doc = new jsPDF() as any;
  doc.setFontSize(22);
  doc.text("REGISTRE DE TRAÇABILITÉ", 14, 22);
  doc.setFontSize(10);
  doc.text(`Période : ${periodLabel}`, 14, 30);
  doc.text(`Généré le : ${new Date().toLocaleString()}`, 14, 35);

  const tableData = records.map(r => [
    new Date(r.date).toLocaleDateString('fr-FR'),
    r.itemName,
    r.lotNumber || '-',
    new Date(r.expiryDate).toLocaleDateString('fr-FR')
  ]);

  doc.autoTable({
    startY: 45,
    head: [['Date Réception', 'Produit', 'N° Lot', 'DLC / DDM']],
    body: tableData,
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Ajout des photos sur des pages suivantes
  if (records.some(r => r.photoUrl)) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text("ANNEXE : PREUVES PHOTOS (ÉTIQUETTES)", 14, 20);
    
    let x = 14;
    let y = 30;
    const imgWidth = 85;
    const imgHeight = 60;
    const padding = 10;

    for (const record of records) {
      if (record.photoUrl) {
        if (y + imgHeight > 270) {
          doc.addPage();
          y = 20;
        }

        try {
          // Si c'est une URL externe (Supabase), on doit la convertir
          // Si c'est déjà du Base64 (local), on l'utilise directement
          const imgData = record.photoUrl.startsWith('http') 
            ? await getBase64ImageFromURL(record.photoUrl)
            : record.photoUrl;

          doc.rect(x, y, imgWidth, imgHeight + 10); // Cadre
          doc.addImage(imgData, 'JPEG', x + 2, y + 2, imgWidth - 4, imgHeight - 4);
          doc.setFontSize(8);
          doc.text(`${record.itemName} - DLC: ${new Date(record.expiryDate).toLocaleDateString()}`, x + 5, y + imgHeight + 5);
          
          x += imgWidth + padding;
          if (x > 150) {
            x = 14;
            y += imgHeight + padding + 5;
          }
        } catch (e) {
          console.error("Erreur chargement image pour PDF", e);
        }
      }
    }
  }

  doc.save(`Tracabilite_${periodLabel.replace(/\s+/g, '_')}.pdf`);
};

export const exportHistoryToPDF = (logs: DailyLog[], restaurantName: string = RESTAURANT_NAME) => {
  const doc = new jsPDF() as any;
  const sortedLogs = [...logs].sort((a,b) => b.date.localeCompare(a.date));
  doc.setFontSize(20);
  doc.text("HISTORIQUE DES CONTRÔLES HACCP", 14, 22);
  
  const tableRows = sortedLogs.map(log => [
    new Date(log.date).toLocaleDateString('fr-FR'),
    `${log.items.filter(i => i.completed).length} / ${log.items.length}`,
    log.items.every(i => i.completed) ? "CONFORME" : "INCOMPLET"
  ]);

  doc.autoTable({
    startY: 40,
    head: [['Date', 'Points vérifiés', 'Statut Global']],
    body: tableRows,
    headStyles: { fillColor: [67, 56, 202] }
  });

  doc.save(`HACCP_Historique.pdf`);
};

export const exportProductionLabel = (recipe: Recipe, restaurantName: string = RESTAURANT_NAME) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [60, 40] });
  const now = new Date();
  const dlc = new Date();
  dlc.setDate(now.getDate() + recipe.shelfLifeDays);
  const formatDate = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(restaurantName.toUpperCase(), 30, 5, { align: 'center' });
  doc.line(5, 6, 55, 6);
  doc.setFontSize(10);
  doc.text(recipe.name, 30, 12, { align: 'center', maxWidth: 50 });
  doc.setFontSize(9);
  doc.text(`DLC : ${formatDate(dlc)}`, 5, 26);
  doc.save(`Etiquette_${recipe.name}.pdf`);
};
