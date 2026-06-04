import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelGeneratorService {
  async generateTable(
    sheetName: string,
    headers: string[],
    rows: (string | number)[][],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'UrbanRush';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(sheetName);

    // Header row
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2D3748' },
    };
    headerRow.alignment = { horizontal: 'center' };

    // Data rows
    for (const row of rows) {
      sheet.addRow(row);
    }

    // Auto-fit columns
    sheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = String(cell.value ?? '').length;
        if (len > maxLength) maxLength = len;
      });
      column.width = Math.min(maxLength + 2, 40);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
