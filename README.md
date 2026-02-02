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
