"use strict";

function fill(form, data) {
  form.getTextField("C_manten").setText(data.mantenedora?.nome || "");

  form.getTextField("C_manten_cnpj").setText(data.mantenedora?.cnpj || "");

  form
    .getTextField("C_manten_endereco")
    .setText(data.mantenedora?.endereco || "");

  form.getTextField("T_ensino").setText(data.turma?.ensino || "");

  form.getTextField("T_serie").setText(data.turma?.serie || "");

  form.getTextField("T_periodo").setText(data.turma?.periodo || "");

  form.getTextField("C_ano").setText(data.contrato?.ano || "");

  form.getTextField("C_total").setText(data.financeiro?.total || "");

  form
    .getTextField("C_total_extenso")
    .setText(data.financeiro?.totalExtenso || "");

  form.getTextField("C_parcelas").setText(data.financeiro?.parcelas || "");

  form.getTextField("C_valor_serie").setText(data.financeiro?.valorSerie || "");

  form
    .getTextField("C_valor_serie_extenso")
    .setText(data.financeiro?.valorSerieExtenso || "");

  form.getTextField("A_nome").setText(data.aluno?.nome || "");

  form.getTextField("C_nome").setText(data.contratante?.nome || "");

  form.getTextField("C_rg").setText(data.contratante?.rg || "");

  form.getTextField("C_cpf").setText(data.contratante?.cpf || "");

  form
    .getTextField("C_endereco_completo")
    .setText(data.contratante?.enderecoCompleto || "");

  form
    .getTextField("A_nome_contato1")
    .setText(data.aluno?.contato1?.nome || "");

  form.getTextField("A_cpf_contato1").setText(data.aluno?.contato1?.cpf || "");

  form.getTextField("C_deferido").setText(data.contrato?.deferido || "");
}

module.exports = {
  file: "contrato_principal_2026_v1.pdf",
  version: "contrato_principal_2026_v1",
  fill,
};
