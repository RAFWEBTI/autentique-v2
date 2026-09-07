"use strict";

const fs = require("fs");
const Api = require("../common/Api");
const utils = require("../common/utils");

const signById = async ({ token }, { documentId }) => {
  try {
    const filename = `${__dirname}/../resources/documents/signById.graphql`;

    const operations = fs
      .readFileSync(filename)
      .toString()
      .replace(/[\n\r]/gi, "")
      .replace("$documentId", documentId);

    const formData = utils.query(operations);

    const response = await Api(token).post("/graphql", formData, {
      processData: false,
      withCredentials: true,
      cache: false,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response?.data;
  } catch (error) {
    console.error(
      "Erro ao assinar documento no Autentique:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

module.exports = {
  signById,
};
