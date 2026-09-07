"use strict";

const crypto = require("crypto");

function validateAutentiqueWebhook(rawBody, signature) {
  const secret = process.env.AUTENTIQUE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("AUTENTIQUE_WEBHOOK_SECRET não configurado.");
  }

  if (!rawBody || !Buffer.isBuffer(rawBody)) {
    return false;
  }

  if (!signature) {
    return false;
  }

  const receivedSignature = String(signature).trim().toLowerCase();

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  console.log("[HMAC] RECEIVED:", receivedSignature);
  console.log("[HMAC] EXPECTED:", expectedSignature);

  console.log("[SECRET] LENGTH:", secret.length);

  console.log(
    "[SECRET] FINGERPRINT:",
    crypto.createHash("sha256").update(secret, "utf8").digest("hex"),
  );

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

module.exports = {
  validateAutentiqueWebhook,
};
