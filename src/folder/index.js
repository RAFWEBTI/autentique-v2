"use strict";

const { create } = require("./create");
const { listAll } = require("./listAll");
const { listById } = require("./listById");
const { deleteById } = require("./deleteById");
const { listDocumentsById } = require("./listDocumentsById");
const { moveDocumentById } = require("./moveDocumentById");

const folder = (def) => ({
  create: (args) => create(def, args),
  listAll: (args) => listAll(def, args),
  listById: (args) => listById(def, args),
  listDocumentsById: (args) => listDocumentsById(def, args),
  moveDocumentById: (args) => moveDocumentById(def, args),
  deleteById: (args) => deleteById(def, args),
});

module.exports = folder;
