"use strict";

const { Readable } = require("stream");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const Api = require("../common/Api");
const utils = require("../common/utils");

function createReadStreamFromBuffer(buffer, filename) {
  let done = false;

  const stream = new Readable({
    read() {
      if (!done) {
        this.push(buffer);
        done = true;
      } else {
        this.push(null);
      }
    },
  });

  stream.path = filename;
  stream.filename = filename;

  return stream;
}

const create = async (
  { token, sandbox = false },
  { document, signers, filename: originalFilename, file, fileUrl },
) => {
  try {
    const variables = {
      sandbox,
      document: {
        ...document,
        name: document.name.substring(0, 199),
      },
      signers,
      file: null,
    };

    const graphqlPath = `${__dirname}/../resources/documents/create.graphql`;

    const operations = fs
      .readFileSync(graphqlPath)
      .toString()
      .replace(/[\n\r]/gi, "")
      .replace("$variables", JSON.stringify(variables));

    let buffer = file;

    // Mantemos por compatibilidade com o cliente original.
    if (fileUrl) {
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });

      buffer = Buffer.from(response.data);
    }

    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error(
        "Arquivo não informado ou formato inválido para envio ao Autentique.",
      );
    }

    if (!originalFilename) {
      throw new Error("Nome do arquivo não informado.");
    }

    const formData = new FormData();

    formData.append("operations", utils.query(operations));

    formData.append(
      "map",
      JSON.stringify({
        file: ["variables.file"],
      }),
    );

    const fileStream = createReadStreamFromBuffer(buffer, originalFilename);

    formData.append("file", fileStream, {
      filename: originalFilename,
      contentType: "application/pdf",
      knownLength: buffer.length,
    });

    const response = await Api(token).post("/graphql", formData, {
      timeout: 180000,
      headers: formData.getHeaders(),
    });

    return response?.data;
  } catch (error) {
    console.error(
      "Erro ao criar documento no Autentique:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

module.exports = {
  create,
};
