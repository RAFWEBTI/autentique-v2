"use strict";

const autentique = require("../../index");

async function ensureFolder(folderName) {
  if (!folderName) {
    throw new Error("Nome da pasta não informado.");
  }

  let page = 1;
  const limit = 60;

  while (true) {
    const result = await autentique.folder.listAll({
      page,
    });

    const folders = result?.data?.folders?.data || [];
    const total = result?.data?.folders?.total || 0;

    const existingFolder = folders.find((folder) => folder.name === folderName);

    if (existingFolder) {
      return existingFolder;
    }

    // Já percorremos todas as pastas
    if (page * limit >= total) {
      break;
    }

    page++;
  }

  // Pasta não existe: cria.
  const result = await autentique.folder.create({
    folder: {
      name: folderName,
    },
  });

  const createdFolder = result?.data?.createFolder;

  if (!createdFolder?.id) {
    throw new Error(`Erro ao criar pasta "${folderName}".`);
  }

  return createdFolder;
}

module.exports = {
  ensureFolder,
};
