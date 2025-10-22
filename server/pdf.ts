import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export async function generateAstralMapPDF(
  name: string,
  birthDate: string,
  birthTime: string,
  birthLocation: string,
  packageType: 'basic' | 'premium',
  mapContent: string
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Configurar fonte
  const helveticaFont = await pdfDoc.embedFont('Helvetica');
  const helveticaBold = await pdfDoc.embedFont('Helvetica-Bold');

  // Página 1 - Capa
  let page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  // Fundo branco (sem cor)

  // Título
  page.drawText('MAPA ASTRAL PERSONALIZADO', {
    x: 50,
    y: height - 100,
    size: 28,
    font: helveticaBold,
    color: rgb(1, 0.8, 0.2), // Dourado
  });

  // Nome
  page.drawText(`Para: ${name}`, {
    x: 50,
    y: height - 150,
    size: 18,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  // Informações de nascimento
  page.drawText(`Data de Nascimento: ${birthDate}`, {
    x: 50,
    y: height - 180,
    size: 12,
    font: helveticaFont,
    color: rgb(0.9, 0.9, 0.9),
  });

  page.drawText(`Hora de Nascimento: ${birthTime}`, {
    x: 50,
    y: height - 200,
    size: 12,
    font: helveticaFont,
    color: rgb(0.9, 0.9, 0.9),
  });

  page.drawText(`Local de Nascimento: ${birthLocation}`, {
    x: 50,
    y: height - 220,
    size: 12,
    font: helveticaFont,
    color: rgb(0.9, 0.9, 0.9),
  });

  page.drawText(`Pacote: ${packageType === 'basic' ? 'Basico' : 'Premium'}`, {
    x: 50,
    y: height - 240,
    size: 12,
    font: helveticaBold,
    color: rgb(1, 0.8, 0.2),
  });

  page.drawText(`Data de Geracao: ${new Date().toLocaleDateString('pt-BR')}`, {
    x: 50,
    y: height - 260,
    size: 10,
    font: helveticaFont,
    color: rgb(0.7, 0.7, 0.7),
  });

  // Adicionar conteúdo do mapa em múltiplas páginas
  const lines = mapContent.split('\n');
  let currentY = height - 350;
  let pageNumber = 2;

  for (const line of lines) {
    if (currentY < 50) {
      // Nova página
      page = pdfDoc.addPage([595, 842]);
      currentY = height - 50;
      
      // Número da página
      page.drawText(`Pagina ${pageNumber}`, {
        x: width - 100,
        y: 30,
        size: 10,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      pageNumber++;
    }

    // Quebrar linhas longas
    const maxCharsPerLine = 90;
    if (line.length > maxCharsPerLine) {
      let remaining = line;
      while (remaining.length > 0) {
        const chunk = remaining.substring(0, maxCharsPerLine);
        remaining = remaining.substring(maxCharsPerLine);
        
        page.drawText(chunk, {
          x: 50,
          y: currentY,
          size: 11,
          font: helveticaFont,
          color: rgb(0.1, 0.1, 0.1),
        });
        currentY -= 15;

        if (currentY < 50) {
          page = pdfDoc.addPage([595, 842]);
          currentY = height - 50;
          page.drawText(`Pagina ${pageNumber}`, {
            x: width - 100,
            y: 30,
            size: 10,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
          });
          pageNumber++;
        }
      }
    } else {
      page.drawText(line || ' ', {
        x: 50,
        y: currentY,
        size: 11,
        font: helveticaFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      currentY -= 15;
    }
  }

  // Última página - Rodapé
  page = pdfDoc.addPage([595, 842]);
  // Fundo branco (sem cor)

  page.drawText('Consultas Esotéricas 2025', {
    x: 50,
    y: height - 100,
    size: 16,
    font: helveticaBold,
    color: rgb(1, 0.8, 0.2),
  });

  page.drawText('Sabedoria para sua jornada espiritual', {
    x: 50,
    y: height - 130,
    size: 12,
    font: helveticaFont,
    color: rgb(0.9, 0.9, 0.9),
  });

  page.drawText('Obrigado por confiar em nossas consultas.', {
    x: 50,
    y: height - 160,
    size: 11,
    font: helveticaFont,
    color: rgb(0.7, 0.7, 0.7),
  });

  page.drawText('Que a sabedoria ancestral ilumine seu caminho.', {
    x: 50,
    y: height - 180,
    size: 11,
    font: helveticaFont,
    color: rgb(0.7, 0.7, 0.7),
  });

  // Gerar PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

