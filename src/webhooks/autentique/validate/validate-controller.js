"use strict";

const { validateAutentiqueWebhook } = require("./validate-service");

async function validate(req, res) {
  try {
    const { bodyBase64, signature } = req.body || {};

    if (!bodyBase64 || !signature) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: "Body ou assinatura não informados.",
      });
    }

    const rawBody = Buffer.from(bodyBase64, "base64");

    console.log("======================================");
    console.log("[VALIDATE] BASE64:", bodyBase64);
    console.log("[VALIDATE] BASE64_LENGTH:", bodyBase64.length);
    console.log("[VALIDATE] SIGNATURE:", signature);
    console.log("[VALIDATE] SIGNATURE_LENGTH:", signature.length);
    console.log("[VALIDATE] RAW_LENGTH:", rawBody.length);

    const valid = validateAutentiqueWebhook(rawBody, signature);

    console.log("[VALIDATE] VALID:", valid);

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
