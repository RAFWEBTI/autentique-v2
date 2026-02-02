"use strict";

require("dotenv").config();

const { AUTENTIQUE_TOKEN, AUTENTIQUE_DEV_MODE } = process.env;
const document = require("./document");
const folder = require("./folder");
const pjson = require("../package.json");

const instance = {
  version: pjson.version,
  token: AUTENTIQUE_TOKEN || null,
  sandbox: String(AUTENTIQUE_DEV_MODE || "").toLowerCase() === "true",
};

instance.document = document(instance);
instance.folder = folder(instance);

module.exports = instance;
