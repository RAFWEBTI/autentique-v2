"use strict";

const fs = require("fs");
const Api = require("../common/Api");
const utils = require("../common/utils");

const updateById = async (
  { token, sandbox = false },
  { documentId, deadlineAt },
) => {
  try {
    const variables = {
      sandbox,
    };

    const filename = `${__dirname}/../resources/documents/updateById.graphql`;

    const operations = fs
      .readFileSync(filename)
      .toString()
      .replace(/[\n\r]/gi, "")
      .replace("$documentId", documentId)
      .replace("$deadlineAt", deadlineAt)
      .replace("$variables", JSON.stringify(variables));

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
      "Erro ao atualizar documento no Autentique:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

module.exports = {
  updateById,
};
