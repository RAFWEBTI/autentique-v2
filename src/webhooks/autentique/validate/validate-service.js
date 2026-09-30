"use strict";

const crypto = require("crypto");

function isValidWithSecret(rawBody, signature, secret) {
  if (!secret) {
    return false;
  }

  const receivedSignature = String(signature).trim().toLowerCase();

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const receivedBuffer = Buffer.from(receivedSignature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    receivedBuffer.length === 0 ||
    receivedBuffer.length !== expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function validateAutentiqueWebhook(rawBody, signature) {
  const secrets = [
    process.env.AUTENTIQUE_WEBHOOK_SECRET_ORG1,
    process.env.AUTENTIQUE_WEBHOOK_SECRET_ORG2,
  ].filter(Boolean);

  if (!secrets.length) {
    throw new Error("Nenhum AUTENTIQUE_WEBHOOK_SECRET configurado.");
  }

  if (!rawBody || !Buffer.isBuffer(rawBody)) {
    return false;
  }

  if (!signature) {
    return false;
  }

  return secrets.some((secret) =>
    isValidWithSecret(rawBody, signature, secret),
  );
}

module.exports = {
  validateAutentiqueWebhook,
};
