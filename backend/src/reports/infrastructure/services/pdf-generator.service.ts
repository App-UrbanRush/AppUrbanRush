import { Injectable } from '@nestjs/common';
import * as path from 'path';

const PdfPrinter = require('pdfmake');

@Injectable()
export class PdfGeneratorService {
  private readonly printer: any;

  constructor() {
    const fontsDir = path.resolve('./node_modules/pdfmake/fonts/Roboto');
    this.printer = new PdfPrinter({
      Roboto: {
        normal: path.join(fontsDir, 'Roboto-Regular.ttf'),
        bold: path.join(fontsDir, 'Roboto-Medium.ttf'),
        italics: path.join(fontsDir, 'Roboto-Italic.ttf'),
        bolditalics: path.join(fontsDir, 'Roboto-MediumItalic.ttf'),
      },
    });
  }

  generateTable(
    title: string,
    headers: string[],
    rows: (string | number)[][],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const tableBody = [
        headers.map((h) => ({ text: h, bold: true, fillColor: '#2D3748', color: '#FFFFFF', fontSize: 9 })),
        ...rows.map((row) => row.map((cell) => ({ text: String(cell ?? ''), fontSize: 8 }))),
      ];

      const docDefinition = {
        defaultStyle: { font: 'Roboto' },
        pageOrientation: (rows[0]?.length > 6 ? 'landscape' : 'portrait') as string,
        content: [
          { text: title, fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
          { text: `Generado: ${new Date().toLocaleString('es-CO')}`, fontSize: 9, color: '#666', margin: [0, 0, 0, 15] },
          {
            table: {
              headerRows: 1,
              widths: headers.map(() => '*'),
              body: tableBody,
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#E2E8F0',
              vLineColor: () => '#E2E8F0',
            },
          },
          { text: `Total registros: ${rows.length}`, fontSize: 9, margin: [0, 10, 0, 0], color: '#666' },
        ],
      };

      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', (err: Error) => reject(err));
      pdfDoc.end();
    });
  }
}
