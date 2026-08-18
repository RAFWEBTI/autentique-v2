"use strict";

function fill(form, data) {
  // Mantenedora
  form.getTextField("C_manten").setText(data.mantenedora?.nome || "");
  form.getTextField("C_manten2").setText(data.mantenedora?.nome || "");
  form.getTextField("C_manten3").setText(data.mantenedora?.nome || "");

  form.getTextField("C_manten_cnpj").setText(data.mantenedora?.cnpj || "");
  form.getTextField("C_manten_cnpj2").setText(data.mantenedora?.cnpj || "");
  form.getTextField("C_manten_cnpj3").setText(data.mantenedora?.cnpj || "");

  form
    .getTextField("C_manten_endereco")
    .setText(data.mantenedora?.endereco || "");
  form
    .getTextField("C_manten_endereco2")
    .setText(data.mantenedora?.endereco || "");

  // Turma
  form.getTextField("T_ensino").setText(data.turma?.ensino || "");
  form.getTextField("T_ensino2").setText(data.turma?.ensino || "");

  form.getTextField("T_serie").setText(data.turma?.serie || "");
  form.getTextField("T_serie2").setText(data.turma?.serie || "");

  form.getTextField("T_periodo").setText(data.turma?.periodo || "");
  form.getTextField("T_periodo2").setText(data.turma?.periodo || "");

  // Contrato
  form.getTextField("C_ano").setText(data.contrato?.ano || "");
  form.getTextField("C_ano2").setText(data.contrato?.ano || "");

  form.getTextField("C_deferido").setText(data.contrato?.deferido || "");

  // Financeiro
  form.getTextField("C_total").setText(data.financeiro?.total || "");

  form
    .getTextField("C_total_extenso")
    .setText(data.financeiro?.totalExtenso || "");

  form.getTextField("C_parcelas").setText(data.financeiro?.parcelas || "");

  form
    .getTextField("C_parcelas_valor")
    .setText(data.financeiro?.parcelas_valor || "");

  form
    .getTextField("C_parcelas_valor_extenso")
    .setText(data.financeiro?.parcelas_valor_extenso || "");

  form
    .getTextField("C_parcelas_vence")
    .setText(data.financeiro?.parcelas_vence || "");

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
  const ano = data.contrato?.ano || "";
  const aluno = data.aluno?.nome || "Aluno";

  return `Contrato Escolar ${ano} - ${aluno}`.trim();
}

module.exports = {
  file: "contrato_principal_2026_v1.pdf",
  version: "contrato_principal_2026_v1",
  getDocumentName,
  fill,
};
