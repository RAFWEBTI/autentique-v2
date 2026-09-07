"use strict";

const crypto = require("crypto");

function validateAutentiqueWebhook(rawBody, signature) {
  const secret = process.env.AUTENTIQUE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("AUTENTIQUE_WEBHOOK_SECRET não configurado.");
  }

  if (!rawBody || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const receivedBuffer = Buffer.from(signature.trim(), "hex");

  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

module.exports = {
  validateAutentiqueWebhook,
};
