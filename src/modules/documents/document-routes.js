"use strict";

const express = require("express");
const controller = require("./document-controller");

const router = express.Router();

router.post("/sandbox", controller.sandbox);

router.post("/create", controller.create);

module.exports = router;
