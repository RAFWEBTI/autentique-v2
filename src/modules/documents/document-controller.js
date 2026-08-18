"use strict";

const DocumentService = require("./document-service");
const FolderService = require("../folders/folder-service");
const autentique = require("../../index");

// Monta os signatários do documento
function buildSigners(signers = {}) {
  const directorName = process.env.AUTENTIQUE_DIRECTOR_NAME;
  const directorEmail = process.env.AUTENTIQUE_DIRECTOR_EMAIL;

  if (!directorName || !directorEmail) {
    throw new Error("Diretor não configurado no ambiente.");
  }

  if (!signers.contractor1?.name || !signers.contractor1?.email) {
    throw new Error("Contratante 1 não informado.");
  }

  const result = [
    {
      name: directorName,
      email: directorEmail,
      action: "SIGN",
      delivery_method: "DELIVERY_METHOD_LINK",
    },
    {
      name: signers.contractor1.name,
      email: signers.contractor1.email,
      action: "SIGN",
      delivery_method: "DELIVERY_METHOD_LINK",
    },
  ];

  // Contratante 2 é opcional
  if (signers.contractor2?.email) {
    if (!signers.contractor2.name) {
      throw new Error("Nome do contratante 2 não informado.");
    }

    result.push({
      name: signers.contractor2.name,
      email: signers.contractor2.email,
      action: "SIGN",
      delivery_method: "DELIVERY_METHOD_LINK",
    });
  }

  return result;
}

// Normaliza uma assinatura retornada pelo Autentique
function normalizeSigner(signature) {
  if (!signature) {
    return null;
  }

  return {
    publicId: signature.public_id,
    name: signature.name,
    email: signature.email,
    link: signature.link?.short_link || null,
  };
}

// SANDBOX .........................................................
async function sandbox(req, res) {
  try {
    const { type, data } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Tipo do documento não informado.",
      });
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        error: "Dados do documento não informados.",
      });
    }

    const generated = await DocumentService.generate(type, data);

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${type}-sandbox.pdf"`,
    );

    return res.send(generated.buffer);
  } catch (error) {
    console.error("Erro ao gerar documento:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// CREATE .........................................................
async function create(req, res) {
  try {
    const { type, data, signers } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Tipo do documento não informado.",
      });
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        error: "Dados do documento não informados.",
      });
    }

    if (!signers) {
      return res.status(400).json({
        success: false,
        error: "Signatários não informados.",
      });
    }

    // 1. Monta os signatários.
    const autentiqueSigners = buildSigners(signers);

    // 2. Gera o PDF.
    const generated = await DocumentService.generate(type, data);

    const filename = `${type}-${Date.now()}.pdf`;

    // 3. Descobre o ano do contrato.
    const year = data.contrato?.ano || data.ano;

    if (!year) {
      throw new Error("Ano do contrato não informado.");
    }

    // 4. Garante a pasta contratos_ANO.
    const folderName = `contratos_${year}`;

    const folder = await FolderService.ensureFolder(folderName);

    // 5. Cria o documento no Autentique.
    const result = await autentique.document.create({
      document: {
        name: generated.documentName,
      },
      signers: autentiqueSigners,
      filename,
      file: generated.buffer,
    });

    const document = result?.data?.createDocument;

    if (!document?.id) {
      throw new Error("Autentique não retornou o documento criado.");
    }

    // 6. Move o documento para a pasta.
    await autentique.folder.moveDocumentById({
      folderId: folder.id,
      documentId: document.id,
    });

    // 7. Normaliza os signatários.
    const signatures = document.signatures || [];

    const normalizedSigners = {
      director: normalizeSigner(signatures[0]),
      contractor1: normalizeSigner(signatures[1]),
      contractor2: normalizeSigner(signatures[2]),
    };

    // 8. Retorna resposta normalizada para o ASP.
    return res.status(201).json({
      success: true,

      type,
      documentId: document.id,
      documentName: generated.documentName,
      templateVersion: generated.templateVersion,

      folder: {
        id: folder.id,
        name: folder.name,
      },

      signers: normalizedSigners,

      createdAt: document.created_at,
    });
  } catch (error) {
    console.error(
      "Erro ao criar documento:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      success: false,
      error: error.message || "Erro ao criar documento no Autentique.",
    });
  }
}

module.exports = {
  sandbox,
  create,
};
