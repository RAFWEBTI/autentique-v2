"use strict";

require("dotenv").config();

const express = require("express");
const documentRoutes = require("./src/modules/documents/document-routes");
const autentiqueWebhookValidateRoutes = require("./src/webhooks/autentique/validate/validate-routes");

const app = express();

app.use(
  express.json({
    limit: "2mb",

    verify: (req, res, buf) => {
      req.rawBody = Buffer.from(buf);
    },
  }),
);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "autentique-gateway",
  });
});

app.use("/documents", documentRoutes);

app.use("/webhooks/autentique", autentiqueWebhookValidateRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Autentique Gateway iniciado na porta ${PORT}`);
});
