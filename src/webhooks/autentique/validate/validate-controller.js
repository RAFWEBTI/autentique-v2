"use strict";

const { validateAutentiqueWebhook } = require("./validate-service");

async function validate(req, res) {
  try {
    const { body, signature } = req.body;

    if (!body || !signature) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: "Body ou assinatura não informados.",
      });
    }

    const valid = validateAutentiqueWebhook(body, signature);

    return res.status(200).json({
      success: true,
      valid,
    });
  } catch (error) {
    console.error("Erro ao validar webhook Autentique:", error.message);

    return res.status(500).json({
      success: false,
      valid: false,
      error: error.message,
    });
  }
}

module.exports = {
  validate,
};
