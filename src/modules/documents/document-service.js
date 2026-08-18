"use strict";

const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const contratoPrincipal = require("./templates/contrato-principal");
const adendo = require("./templates/adendo");
const autorizacaoViagem = require("./templates/autorizacao-viagem");

const templates = {
  contrato_principal: contratoPrincipal,
  adendo,
  autorizacao_viagem: autorizacaoViagem,
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

  // .................................................................
  // Tmp validate function to fill the PDF form fields with data
  //const fields = form.getFields();

  //console.log("Campos encontrados no PDF:");

  //fields.forEach((field) => {
  //  console.log("-", field.getName());
  //});

  // .................................................................

  templateConfig.fill(form, data);

  form.flatten();

  const pdfBytes = await pdfDoc.save();

  return {
    buffer: Buffer.from(pdfBytes),
    templateVersion: templateConfig.version,
    documentType,
    documentName: templateConfig.getDocumentName
      ? templateConfig.getDocumentName(data)
      : documentType,
  };
}

module.exports = {
  generate,
};
