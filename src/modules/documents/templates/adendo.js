"use strict";

function fill(form, data) {
  // Mantenedora
  form.getTextField("C_manten").setText(data.mantenedora?.nome || "");
  form.getTextField("C_manten_cnpj").setText(data.mantenedora?.cnpj || "");
  form
    .getTextField("C_manten_endereco")
    .setText(data.mantenedora?.endereco || "");

  // Turma
  form.getTextField("T_ensino").setText(data.turma?.ensino || "");
  form.getTextField("T_serie").setText(data.turma?.serie || "");
  form.getTextField("T_periodo").setText(data.turma?.periodo || "");

  // Contrato
  form.getTextField("C_ano").setText(data.contrato?.ano || "");
  form.getTextField("deferido").setText(data.contrato?.deferido || "");

  // Financeiro
  form.getTextField("mensalidade").setText(data.financeiro?.mensalidade || "");
  form.getTextField("desconto").setText(data.financeiro?.desconto || "");
  form.getTextField("material").setText(data.financeiro?.material || "");
  form.getTextField("papelaria").setText(data.financeiro?.papelaria || "");

  // Aluno
  form.getTextField("A_nome").setText(data.aluno?.nome || "");

  // Contratante
  form.getTextField("C_nome").setText(data.contratante?.nome || "");
  form.getTextField("C_rg").setText(data.contratante?.rg || "");
  form.getTextField("C_cpf").setText(data.contratante?.cpf || "");
  form
    .getTextField("C_endereco_completo")
    .setText(data.contratante?.enderecoCompleto || "");
}

function getDocumentName(data) {
  const ano = data.contrato?.ano || "";
  const aluno = data.aluno?.nome || "Aluno";

  return `Contrato Escolar ${ano} - ${aluno}`.trim();
}

const signers = {
  director: {
    required: true,
    autoSign: true,
  },

  contractor1: {
    required: true,
  },

  contractor2: {
    required: false,
  },
};

const signaturePositions = {
  contractor1: [
    {
      element: "SIGNATURE",
      x: "65.743073047859",
      y: "71.12299465240642",
      z: 4,
    },
  ],

  contractor2: [
    {
      element: "SIGNATURE",
      x: "65.743073047859",
      y: "61.12299465240642",
      z: 4,
    },
  ],

  director: [
    {
      element: "SIGNATURE",
      x: "65.743073047859",
      y: "82.62032085561496",
      z: 4,
    },
  ],
};

module.exports = {
  file: "adendo_2027_v1.pdf",
  version: "adendo_2027_v1",
  signers,
  signaturePositions,
  getDocumentName,
  fill,
};
