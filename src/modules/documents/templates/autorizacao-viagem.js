"use strict";

function fill(form, data) {
  form.getTextField("A_nome").setText(data.aluno?.nome || "");

  form.getTextField("C_nome").setText(data.contratante?.nome || "");

  form.getTextField("C_cpf").setText(data.contratante?.cpf || "");

  form.getTextField("V_destino").setText(data.viagem?.destino || "");

  form.getTextField("V_data").setText(data.viagem?.data || "");

  form.getTextField("V_responsavel").setText(data.viagem?.responsavel || "");
}

function getDocumentName(data) {
  return `Autorização de Viagem - ${data.aluno?.nome || "Aluno"}`;
}

module.exports = {
  file: "autorizacao_viagem_v1.pdf",
  version: "autorizacao_viagem_v1",
  getDocumentName,
  fill,
};
