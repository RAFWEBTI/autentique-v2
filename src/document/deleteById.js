"use strict";

const fs = require("fs");
const Api = require("../common/Api");
const utils = require("../common/utils");

const deleteById = async (
  { token, sandbox = false },
  { documentId, folderId },
) => {
  try {
    const variables = {
      sandbox,
    };

    const filename = `${__dirname}/../resources/documents/deleteById.graphql`;

    const operations = fs
      .readFileSync(filename)
      .toString()
      .replace(/[\n\r]/gi, "")
      .replace("$documentId", documentId)
      .replace("$folderId", folderId)
      .replace("$variables", JSON.stringify(variables));

    console.log("[DELETE GRAPHQL]", operations);

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
      "Erro ao excluir documento no Autentique:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

module.exports = {
  deleteById,
};
