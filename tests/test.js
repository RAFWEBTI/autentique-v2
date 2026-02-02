"use strict";

require("dotenv").config();

const autentique = require("../src");
const createDocument = require("./document/create");

const { AUTENTIQUE_TOKEN, AUTENTIQUE_DEV_MODE } = process.env;

(async () => {
  autentique.token = AUTENTIQUE_TOKEN;
  autentique.sandbox = AUTENTIQUE_DEV_MODE === "true";

  await createDocument(autentique);
})();
