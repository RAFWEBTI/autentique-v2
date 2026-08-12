"use strict";

const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const contratoPrincipal = require("./templates/contrato-principal");

const templates = {
  contrato_principal: contratoPrincipal,
};

async function generate(documentType, data) {
  const templateConfig = templates[documentType];

  if (!templateConfig) {
    throw new Error(`Tipo de documento inválido: ${documentType}`);
  }

  const templatePath = path.join(
    __dirname,
    "../../resources/templates/documents",
    templateConfig.file,
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template PDF não encontrado: ${templateConfig.file}`);
  }

  const templateBytes = fs.readFileSync(templatePath);

  const pdfDoc = await PDFDocument.load(templateBytes);

  const form = pdfDoc.getForm();

  templateConfig.fill(form, data);

  form.flatten();

  const pdfBytes = await pdfDoc.save();

  return {
    buffer: Buffer.from(pdfBytes),
    templateVersion: templateConfig.version,
  };
}

module.exports = {
  generate,
};
