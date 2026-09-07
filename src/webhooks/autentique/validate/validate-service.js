"use strict";

const crypto = require("crypto");

function validateAutentiqueWebhook(body, signature) {
  const secret = process.env.AUTENTIQUE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("AUTENTIQUE_WEBHOOK_SECRET não configurado.");
  }

  if (!body || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("hex");

  const receivedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

module.exports = {
  validateAutentiqueWebhook,
};
