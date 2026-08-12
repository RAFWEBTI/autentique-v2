"use strict";

function fill(form, data) {
  form.getTextField("aluno_nome").setText(data.aluno.nome || "");

  form.getTextField("serie").setText(data.aluno.serie || "");

  form.getTextField("responsavel_nome").setText(data.responsavel.nome || "");

  form.getTextField("responsavel_cpf").setText(data.responsavel.cpf || "");

  form.getTextField("valor_total").setText(data.financeiro.valorTotal || "");
}

module.exports = {
  template: "contrato_principal_2026_v1.pdf",
  version: "contrato_principal_2026_v1",
  fill,
};
