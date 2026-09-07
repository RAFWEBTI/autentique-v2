"use strict";

const { validateAutentiqueWebhook } = require("./validate-service");

async function validate(req, res) {
  try {
    const signature = req.headers["x-autentique-signature"];

    const valid = validateAutentiqueWebhook(req.rawBody, signature);

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
