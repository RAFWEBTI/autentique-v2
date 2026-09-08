"use strict";

const DocumentService = require("./document-service");
const FolderService = require("../folders/folder-service");
const autentique = require("../../index");

// Monta os signatários do documento
function buildSigners(signers = {}, signaturePositions = {}) {
  const directorName = process.env.AUTENTIQUE_DIRECTOR_NAME;
  const directorEmail = process.env.AUTENTIQUE_DIRECTOR_EMAIL;

  if (!directorName || !directorEmail) {
    throw new Error("Diretor não configurado no ambiente.");
  }

  if (!signers.contractor1?.name || !signers.contractor1?.cpf) {
    throw new Error("Contratante 1 não informado.");
  }

  const contractor1Cpf = normalizeCpf(signers.contractor1?.cpf);

  if (!signers.contractor1?.name || contractor1Cpf.length !== 11) {
    throw new Error("Contratante 1 ou CPF inválido.");
  }

  const contractor2Cpf = normalizeCpf(signers.contractor2?.cpf);

  if (!signers.contractor2?.name || contractor2Cpf.length !== 11) {
    throw new Error("Contratante 2 ou CPF inválido.");
  }

  const result = [
    {
      name: directorName,
      email: directorEmail,
      action: "SIGN",
      delivery_method: "DELIVERY_METHOD_LINK",
      positions: signaturePositions.director || [],
    },

    {
      name: signers.contractor1.name,
      action: "SIGN",
      delivery_method: "DELIVERY_METHOD_LINK",

      configs: {
        cpf: contractor1Cpf,
      },

      positions: signaturePositions.contractor1 || [],
    },
  ];

  if (signers.contractor2?.name) {
    if (!signers.contractor2.cpf) {
      throw new Error("CPF do contratante 2 não informado.");
    }

    result.push({
      name: signers.contractor2.name,
      action: "SIGN",
      delivery_method: "DELIVERY_METHOD_LINK",

      configs: {
        cpf: contractor2Cpf,
      },

      positions: signaturePositions.contractor2 || [],
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

function normalizeCpf(cpf) {
  return String(cpf || "").replace(/\D/g, "");
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

    // 1. Gera o PDF e carrega as configurações do template.
    const generated = await DocumentService.generate(type, data);

    // 2. Monta os signatários com as posições do template.
    const autentiqueSigners = buildSigners(
      signers,
      generated.signaturePositions,
    );

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

    // Assina automaticamente com o usuário titular do token.
    await autentique.document.signById({
      documentId: document.id,
    });

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

// DELETE .................................................
async function deleteById(req, res) {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "documentId é obrigatório",
      });
    }

    console.log("DELETE DOCUMENT ID:", documentId);

    const result = await autentique.document.deleteById(
      {
        token: process.env.AUTENTIQUE_TOKEN,
      },
      {
        documentId,
      },
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[DOCUMENT DELETE]", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Erro ao excluir documento",
    });
  }
}

module.exports = {
  sandbox,
  create,
  deleteById,
};
