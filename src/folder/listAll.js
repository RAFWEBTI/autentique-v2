"use strict";

const fs = require("fs");
const Api = require("../common/Api");
const utils = require("../common/utils");

const listAll = async ({ token, sandbox = false }, { page = 1 }) => {
  try {
    const filename = `${__dirname}/../resources/folders/listAll.graphql`;

    const operations = fs
      .readFileSync(filename)
      .toString()
      .replace(/[\n\r]/gi, "")
      .replace("$page", page)
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
  listAll,
};
