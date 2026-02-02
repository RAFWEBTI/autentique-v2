"use strict";
module.exports = async (autentique) => {
  const attributes = {
    document: { name: "Modelo teste de contrato" },
    signers: [
      {
        email: "rafael@rafweb.com.br",
        action: "SIGN",
      },
    ],
    filename: "modelo-teste-contrato.pdf",
    fileUrl: "https://rafweb.com.br/rafweb-modelo-contrato.pdf",
  };

  const response = await autentique.document.create(attributes);
  if (response) console.log(response);
};
