"use strict";

const express = require("express");
const validateController = require("./validate-controller");

const router = express.Router();

router.post("/validate", validateController.validate);

module.exports = router;
