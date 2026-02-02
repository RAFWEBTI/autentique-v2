"use strict";
const { create } = require("./create");
const { listAll } = require("./listAll");
const { listById } = require("./listById");
const { deleteById } = require("./deleteById");
const { signById } = require("./signById");

const document = (def) => ({
  create: (args) => create(def, args),
  listAll: (args) => listAll(def, args),
  listById: (args) => listById(def, args),
  deleteById: (args) => deleteById(def, args),
  signById: (args) => signById(def, args),
});

module.exports = document;
