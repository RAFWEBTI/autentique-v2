"use strict";

function fill(form, data) {
  form.getTextField("aluno_nome").setText(data.aluno?.nome || "");

  form.getTextField("responsavel_nome").setText(data.responsavel?.nome || "");
}

module.exports = {
  file: "contrato_principal_2026_v1.pdf",
  version: "contrato_principal_2026_v1",
  fill,
};
