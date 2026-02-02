"use strict";
const fs = require("fs");
const Api = require("../common/Api");
const utils = require("../common/utils");

const listById = async ({ token, sandbox = false }, { documentId }) => {
  try {
    const filename = `${__dirname}/../resources/documents/listById.graphql`;
    const operations = fs
      .readFileSync(filename)
      .toString()
      .replace(/[\n\r]/gi, "")
      .replace("$documentId", documentId)
      .replace("$sandbox", sandbox.toString());

    const formData = utils.query(operations);
    const response = await Api(token).post("/graphql", formData, {
      processData: false,
      withCredentials: true,
      cache: false,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response && response.data;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  listById,
};
