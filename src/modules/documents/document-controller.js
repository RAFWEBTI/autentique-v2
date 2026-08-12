"use strict";

const DocumentService = require("./document-service");

async function sandbox(req, res) {
  try {
    const { type, data } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Tipo do documento não informado.",
      });
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        error: "Dados do documento não informados.",
      });
    }

    const document = await DocumentService.generate(type, data);

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${type}-sandbox.pdf"`,
    );

    return res.send(document.buffer);
  } catch (error) {
    console.error("Erro ao gerar documento:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  sandbox,
};
