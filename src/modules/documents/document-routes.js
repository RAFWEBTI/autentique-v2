"use strict";

const express = require("express");
const controller = require("./document-controller");

const router = express.Router();

router.post("/sandbox", controller.sandbox);
router.post("/create", controller.create);
router.delete("/:documentId", controller.deleteById);

module.exports = router;
