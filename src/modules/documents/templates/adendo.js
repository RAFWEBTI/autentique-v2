"use strict";

function fill(form, data) {
  // Mantenedora
  form.getTextField("C_manten").setText(data.mantenedora?.nome || "");
  form.getTextField("C_manten_cnpj").setText(data.mantenedora?.cnpj || "");

  // Turma
  form.getTextField("T_ensino").setText(data.turma?.ensino || "");
  form.getTextField("T_serie").setText(data.turma?.serie || "");
  form.getTextField("T_periodo").setText(data.turma?.periodo || "");

  // Contrato
  form.getTextField("C_ano").setText(data.contrato?.ano || "");
  form.getTextField("C_ano2").setText(data.contrato?.ano || "");
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

  // Contratante 2
  form.getTextField("C2_nome").setText(data.contratante2?.nome || "");
  form.getTextField("C2_rg").setText(data.contratante2?.rg || "");
  form.getTextField("C2_cpf").setText(data.contratante2?.cpf || "");
  form
    .getTextField("C2_endereco_completo")
    .setText(data.contratante2?.enderecoCompleto || "");
}

function getDocumentName(data) {
  return `Adendo Contratual ${data.contrato?.ano || ""} - ${
    data.aluno?.nome || "Aluno"
  }`;
}

const signers = {
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
      x: "66.62468513853909",
      y: "80.5704099821747",
      z: 1,
    },
  ],

  contractor2: [
    {
      element: "SIGNATURE",
      x: "66.49874055415621",
      y: "69.3404634581105",
      z: 1,
    },
  ],
};

module.exports = {
  file: "adendo_2026_v1.pdf",
  version: "adendo_2026_v1",
  signers,
  signaturePositions,
  getDocumentName,
  fill,
};
