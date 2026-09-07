#### <span style="text-align: center">AUTENTIQUE Api v2</span>

# 🚀 Usage

```shell
npm i @thiago.zampieri/autentique-v2-nodejs
```

**Set file .env**

```shell
AUTENTIQUE_URL=https://api.autentique.com.br/v2
AUTENTIQUE_TOKEN=YOURTOKEN
AUTENTIQUE_DEV_MODE=true || false
# IF TRUE, DOCUMENT CREATE IN MODE SANDBOX
```

**Import library** `import autentique from from '@thiago.zampieri/autentique-v2-nodejs`

**Instance**

```javascript
autentique.token = AUTENTIQUE_TOKEN;
```

#### 1 - Listar todos os Documentos

```javascript
autentique.document.listAll(page); // if not isset page is equal 1
```

#### 2 - Listar um Documento

```javascript
autentique.document.listById(documentId);
```

#### 3 - Criar um Documento

```javascript
attributes = {
  document: {
    name: "NOME DO DOCUMENTO",
  },
  signers: [
    {
      email: "EMAIL-QUEM-VAI-ASSINAR@gmail.com",
      action: "SIGN",
      positions: [
        {
          x: "50", // Posição do Eixo X da ASSINATURA (0 a 100)
          y: "80", // Posição do Eixo Y da ASSINATURA (0 a 100)
          z: "1", // Página da ASSINATURA
        },
        {
          x: "50", // Posição do Eixo X da ASSINATURA (0 a 100)
          y: "50", // Posição do Eixo Y da ASSINATURA (0 a 100)
          z: "2", // Página da ASSINATURA
        },
      ],
    },
    {
      email: "thiago.zampieri@gmail.com",
      action: "SIGN",
    },
    {
      name: "thiago zampieri",
      action: "SIGN",
    },
  ],
  file: "https://www.documento.com.br/Arquivo.pdf",
};

autentique.document.create(attributes);
```

#### 4 - Assinar um Documento

```javascript
autentique.document.signById(documentId);
```

#### 5 - Deletar um Documento

```javascript
autentique.document.deleteById(documentId);


Este projeto utiliza código derivado de:
https://github.com/thiagozampieri/autentique-v2-nodejs
Licenciado sob MIT.
```

## Fase III — Posicionamento de Assinaturas + Webhook

### 1. Posicionamento das assinaturas

Foi implementado o posicionamento automático das assinaturas no PDF enviado ao Autentique.

As coordenadas foram obtidas criando um documento manualmente no painel do Autentique e consultando posteriormente:

```graphql
signatures {
  public_id
  positions {
    element
    x
    y
    z
  }
}
```

No `contrato-principal.js`, as posições passaram a fazer parte da configuração do próprio template:

```js
signaturePositions: {
  director: [
    {
      element: "SIGNATURE",
      x: "70.0372",
      y: "52.5210",
      z: 4,
    },
  ],

  contractor1: [
    {
      element: "SIGNATURE",
      x: "69.8992",
      y: "42.1569",
      z: 4,
    },
  ],

  contractor2: [
    {
      element: "SIGNATURE",
      x: "69.5214",
      y: "30.8378",
      z: 4,
    },
  ],
}
```

O `document-service.js` passou a retornar:

```js
signaturePositions: templateConfig.signaturePositions || {};
```

E o `document-controller.js` passou a montar os signatários somente depois da geração do documento:

```js
const generated = await DocumentService.generate(type, data);

const autentiqueSigners = buildSigners(signers, generated.signaturePositions);
```

O `buildSigners()` recebe:

```js
function buildSigners(signers = {}, signaturePositions = {})
```

e adiciona `positions` individualmente em:

```text
director
contractor1
contractor2
```

Resultado validado no sandbox: todas as assinaturas aparecem corretamente posicionadas na página definida.

---

## 2. Assinatura automática do diretor

O usuário titular do token da API é o diretor da escola e também consta como signatário do documento.

Foi utilizada a operação já existente:

```js
autentique.document.signById({
  documentId: document.id,
});
```

baseada na mutation:

```graphql
mutation {
  signDocument(id: "$documentId")
}
```

Após a criação do documento, o diretor é automaticamente assinado pelo usuário titular do token.

Fluxo validado:

```text
createDocument
      ↓
document.id
      ↓
signDocument
      ↓
diretor assinado automaticamente
```

O teste foi realizado com sucesso.

---

## 3. Notificações

Os signatários continuam configurados com:

```js
delivery_method: "DELIVERY_METHOD_LINK";
```

O Autentique não realiza o envio do link de assinatura.

O sistema legado ASP será responsável por:

```text
avisar o contratante
+
entregar o link exclusivo assina.ae
```

Isso permite integrar posteriormente o envio por área do aluno, WhatsApp, e-mail próprio etc.

---

# Webhook de documentos

Foi criado o endpoint público:

```text
/sistema/contratos/contratos_webhook_doc.asp
```

Tipo configurado no Autentique:

```text
DOCUMENTOS
```

Eventos inicialmente registrados:

```text
document.updated
document.finished
document.deleted
```

O evento `document.created` não foi utilizado porque a criação já é processada sincronamente pelo ASP/Node.

---

## Payload real

Os testes mostraram que o webhook de documentos envia:

```text
event.type
event.data.id
event.data.signatures_count
event.data.signed_count
event.data.rejected_count
```

E para cada signatário:

```text
public_id
viewed
signed
rejected
reason
```

O relacionamento futuro será feito por:

```text
event.data.id
→ tb_contratos_assinatura.autentique_document_id
```

e:

```text
signature.public_id
→ tb_contratos_assinatura_signatarios.public_id
```

---

# Segurança do webhook

O Autentique envia:

```text
X-Autentique-Signature
```

A assinatura é HMAC-SHA256 calculada sobre o body bruto do webhook utilizando a chave configurada no painel.

Como o ASP Classic não possui uma implementação HMAC-SHA256 adequada no ambiente atual, a validação foi delegada ao Node Gateway.

A arquitetura ficou:

```text
Autentique
    ↓
ASP webhook
    ↓
Request.BinaryRead
    ↓
bytes originais
    ↓ Base64
Node Gateway
    ↓
HMAC-SHA256
    ↓
valid true/false
    ↓
ASP decide se processa
```

O Node NÃO acessa banco de dados.

---

## Endpoint Node

Criada estrutura:

```text
src/
└── webhooks/
    └── autentique/
        └── validate/
            ├── validate-controller.js
            ├── validate-routes.js
            └── validate-service.js
```

Endpoint:

```text
POST /webhooks/autentique/validate
```

Payload interno ASP → Node:

```json
{
  "bodyBase64": "...",
  "signature": "..."
}
```

O Node reconstrói:

```js
const rawBody = Buffer.from(bodyBase64, "base64");
```

e valida:

```js
crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
```

A comparação utiliza:

```js
crypto.timingSafeEqual();
```

Variável de ambiente:

```env
AUTENTIQUE_WEBHOOK_SECRET=
```

---

## Detalhe importante do ASP

`Request.BinaryRead()` deve ser executado somente uma vez.

Por isso o fluxo é:

```text
Request.BinaryRead
      ↓
binaryBody
 ┌────┴─────┐
 ↓          ↓
Base64      texto
 ↓          ↓
Node        aspJSON
HMAC        parser
```

A conversão Base64 utiliza:

```text
MSXML2.DOMDocument.6.0
bin.base64
```

Isso preserva os bytes originais necessários para a validação HMAC.

---

## Bug encontrado no aspJSON / VBScript

O Node retorna:

```json
{
  "success": true,
  "valid": true
}
```

Inicialmente o ASP comparava:

```asp
JsonValue(jsonResp.data, "valid") = "True"
```

Isso falhou porque o servidor está localizado em português e:

```text
True  → Verdadeiro
False → Falso
```

A solução foi comparar diretamente o boolean:

```asp
If jsonResp.data("success") = True And _
   jsonResp.data("valid") = True Then

    ValidateWebhookNode = True

End If
```

---

# Teste final validado

Evento real recebido:

```text
VALID_WEBHOOK: Verdadeiro
EVENT: document.updated
DOCUMENT_ID: d6a0eb499d244684e43f55a892e0cfd321fb531eff109b55e
SIGNATURES_COUNT: 3
SIGNED_COUNT: 2
REJECTED_COUNT: 0
```

Portanto está validado:

```text
Autentique
→ ASP público
→ captura body + assinatura
→ Base64
→ Node DigitalOcean
→ HMAC-SHA256
→ valid = true
→ aspJSON
→ evento interpretado corretamente
```

---

# Próxima etapa

Implementar a sincronização do webhook com o banco legado.

Tabelas:

```text
tb_contratos_assinatura
tb_contratos_assinatura_signatarios
```

Mapeamento pretendido:

```text
documentId
→ localizar tb_contratos_assinatura

public_id
→ localizar tb_contratos_assinatura_signatarios
```

Campos de signatário:

```text
viewed
→ visualizado_em

signed
→ assinado_em

rejected
→ recusado_em

reason
→ motivo_recusa
```

Estados principais do documento:

```text
aguardando_assinatura
assinado
cancelado
recusado
erro
```

Regras iniciais:

```text
document.updated + rejected_count > 0
→ recusado

document.finished
→ assinado

document.deleted
→ cancelado

demais casos
→ aguardando_assinatura
```

Antes da implementação dos UPDATEs, revisar a estrutura real das duas tabelas.

Regra arquitetural permanece:

```text
ASP Classic = único responsável pelo banco
Node Gateway = geração PDF + Autentique + validações técnicas
Node NÃO acessa MySQL/MariaDB
```
