"use strict";

const DocumentService = require("./document-service");
const FolderService = require("../folders/folder-service");
const autentique = require("../../index");

// Monta os signatários do documento
function buildSigners(
  signers = {},
  signaturePositions = {},
  signerConfig = {},
) {
  const result = [];

  // DIRECTOR
  if (signerConfig.director) {
    const directorName = process.env.AUTENTIQUE_DIRECTOR_NAME;
    const directorEmail = process.env.AUTENTIQUE_DIRECTOR_EMAIL;

    if (signerConfig.director.required && (!directorName || !directorEmail)) {
      throw new Error("Diretor não configurado no ambiente.");
    }

    if (directorName && directorEmail) {
      result.push({
        role: "director",

        signer: {
          name: directorName,
          email: directorEmail,
          action: "SIGN",
          delivery_method: "DELIVERY_METHOD_LINK",
          positions: signaturePositions.director || [],
        },
      });
    }
  }

  // CONTRACTOR 1
  if (signerConfig.contractor1) {
    const name = signers.contractor1?.name;
    const cpfRaw = signers.contractor1?.cpf;

    if (signerConfig.contractor1.required && (!name || !cpfRaw)) {
      throw new Error("Contratante 1 não informado.");
    }

    if (name) {
      if (!cpfRaw) {
        throw new Error("CPF do contratante 1 não informado.");
      }

      const cpf = normalizeCpf(cpfRaw);

      if (cpf.length !== 11) {
        throw new Error("CPF do contratante 1 inválido.");
      }

      result.push({
        role: "contractor1",

        signer: {
          name,
          action: "SIGN",
          delivery_method: "DELIVERY_METHOD_LINK",

          configs: {
            cpf,
          },

          positions: signaturePositions.contractor1 || [],
        },
      });
    }
  }

  // CONTRACTOR 2
  if (signerConfig.contractor2) {
    const name = signers.contractor2?.name;
    const cpfRaw = signers.contractor2?.cpf;

    if (signerConfig.contractor2.required && (!name || !cpfRaw)) {
      throw new Error("Contratante 2 não informado.");
    }

    if (name) {
      if (!cpfRaw) {
        throw new Error("CPF do contratante 2 não informado.");
      }

      const cpf = normalizeCpf(cpfRaw);

      if (cpf.length !== 11) {
        throw new Error("CPF do contratante 2 inválido.");
      }

      result.push({
        role: "contractor2",

        signer: {
          name,
          action: "SIGN",
          delivery_method: "DELIVERY_METHOD_LINK",

          configs: {
            cpf,
          },

          positions: signaturePositions.contractor2 || [],
        },
      });
    }
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

    // 1. Gera PDF e carrega configurações do template.
    const generated = await DocumentService.generate(type, data);

    console.log(
      "[GENERATED SIGNERS CONFIG]",
      JSON.stringify(generated.signers, null, 2),
    );

    console.log(
      "[SIGNATURE POSITIONS]",
      JSON.stringify(generated.signaturePositions, null, 2),
    );

    // 2. Monta os signatários conforme o template.
    const builtSigners = buildSigners(
      signers,
      generated.signaturePositions,
      generated.signers,
    );

    const autentiqueSigners = builtSigners.map((item) => item.signer);

    console.log("[BUILT SIGNERS]", JSON.stringify(builtSigners, null, 2));

    console.log(
      "[AUTENTIQUE SIGNERS]",
      JSON.stringify(autentiqueSigners, null, 2),
    );

    const filename = `${type}-${Date.now()}.pdf`;

    // 3. Descobre o ano.
    const year = data.contrato?.ano || data.ano;

    if (!year) {
      throw new Error("Ano do contrato não informado.");
    }

    // 4. Pasta.
    const folderName = `contratos_${year}`;
    const folder = await FolderService.ensureFolder(folderName);

    // 5. Cria documento.
    const result = await autentique.document.create({
      document: {
        name: generated.documentName,
      },
      signers: autentiqueSigners,
      filename,
      file: generated.buffer,
    });

    console.log("[AUTENTIQUE CREATE RESULT]", JSON.stringify(result, null, 2));

    if (result?.errors?.length) {
      console.error(
        "[AUTENTIQUE CREATE ERRORS]",
        JSON.stringify(result.errors, null, 2),
      );

      throw new Error(
        result.errors[0]?.message ||
          "Erro retornado pela Autentique ao criar documento.",
      );
    }

    const document = result?.data?.createDocument;

    if (!document?.id) {
      console.error(
        "[AUTENTIQUE CREATE INVALID RESPONSE]",
        JSON.stringify(result, null, 2),
      );

      throw new Error("Autentique não retornou o documento criado.");
    }

    // 6. Assinatura automática somente se o template definir.
    if (generated.signers?.director?.autoSign) {
      await autentique.document.signById({
        documentId: document.id,
      });
    }

    // 7. Move para pasta.
    await autentique.folder.moveDocumentById({
      folderId: folder.id,
      documentId: document.id,
    });

    // 8. Normaliza os signatários.
    const signatures = document.signatures || [];

    function findSignature(signatures = [], builtSigner) {
      const signer = builtSigner?.signer;

      if (!signer) {
        return null;
      }

      // Se o signatário possui e-mail, prioriza o e-mail.
      if (signer.email) {
        const email = signer.email.toLowerCase();

        const foundByEmail = signatures.find((signature) => {
          const signatureEmail =
            signature?.email || signature?.user?.email || "";

          return signatureEmail.toLowerCase() === email;
        });

        if (foundByEmail) {
          return foundByEmail;
        }
      }

      // Contratantes normalmente não possuem e-mail.
      // Localiza pelo nome enviado ao Autentique.
      if (signer.name) {
        const name = signer.name.trim().toLowerCase();

        const foundByName = signatures.find((signature) => {
          const signatureName = signature?.name || signature?.user?.name || "";

          return signatureName.trim().toLowerCase() === name;
        });

        if (foundByName) {
          return foundByName;
        }
      }

      return null;
    }

    const normalizedSigners = {
      director: null,
      contractor1: null,
      contractor2: null,
    };

    builtSigners.forEach((item) => {
      const signature = findSignature(signatures, item);

      normalizedSigners[item.role] = normalizeSigner(signature);
    });

    // 9. Resposta para ASP.
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
    const { folderId } = req.query;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "documentId é obrigatório",
      });
    }

    if (!folderId) {
      return res.status(400).json({
        success: false,
        error: "folderId é obrigatório",
      });
    }

    // ======================================================
    // 1. BLOQUEIA O DOCUMENTO
    // ======================================================

    const deadlineAt = new Date().toISOString();

    const updateResult = await autentique.document.updateById({
      documentId,
      deadlineAt,
    });

    if (updateResult?.errors?.length) {
      return res.status(400).json({
        success: false,
        error: updateResult.errors[0]?.message || "Erro ao bloquear documento",
        errors: updateResult.errors,
      });
    }

    const updatedDocument = updateResult?.data?.updateDocument;

    if (!updatedDocument?.id) {
      return res.status(400).json({
        success: false,
        error: "Autentique não confirmou o bloqueio do documento",
      });
    }

    // ======================================================
    // 2. EXCLUI O DOCUMENTO
    // ======================================================

    const deleteResult = await autentique.document.deleteById({
      documentId,
      folderId,
    });

    if (deleteResult?.errors?.length) {
      return res.status(400).json({
        success: false,
        error:
          deleteResult.errors[0]?.message ||
          "Documento bloqueado, mas houve erro ao excluir",
        errors: deleteResult.errors,
        blocked: true,
      });
    }

    const deleted = deleteResult?.data?.deleteDocument === true;

    if (!deleted) {
      return res.status(400).json({
        success: false,
        error: "Documento bloqueado, mas Autentique não confirmou a exclusão",
        blocked: true,
      });
    }

    // ======================================================
    // 3. SUCESSO
    // ======================================================

    return res.status(200).json({
      success: true,
      blocked: true,
      deleted: true,
      documentId,
      deadlineAt: updatedDocument.deadline_at,
      data: deleteResult,
    });
  } catch (error) {
    console.error("[DOCUMENT DELETE]", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: error.message || "Erro ao bloquear/excluir documento",
    });
  }
}

module.exports = {
  sandbox,
  create,
  deleteById,
};
