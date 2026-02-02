"use strict";

require("dotenv").config();

const axios = require("axios");

const { AUTENTIQUE_URL, AUTENTIQUE_TOKEN } = process.env;

const Api = (token) =>
  axios.create({
    baseURL: AUTENTIQUE_URL,
    timeout: 1000,
    headers: {
      Authorization: `Bearer ${token || AUTENTIQUE_TOKEN}`,
    },
  });

module.exports = Api;
