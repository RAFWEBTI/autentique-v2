"use strict";

const fs = require("fs");
const path = require("path");

module.exports = async (autentique) => {
  const filePath = path.resolve(
    __dirname,
    "../../private-files/modelo-teste-contrato.pdf",
  );

  const attributes = {
    document: {
      name: "Modelo teste de contrato",
    },
    signers: [
      {
        email: "rafael@rafweb.com.br",
        action: "SIGN",
      },
    ],
    file: fs.createReadStream(filePath),
    filename: "modelo-teste-contrato.pdf",
  };

  const response = await autentique.document.create(attributes);

  if (response) {
    console.log(response);
  }
};
