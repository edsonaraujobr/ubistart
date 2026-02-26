# 🧠 Executando o projeto

## 📥 Clonando o Repositório

Para clonar o repositório, siga os passos abaixo:

1. Crie uma pasta no seu computador.
2. Abra o VS Code dentro dessa pasta.
3. Execute o seguinte comando no terminal:

```bash
git clone https://github.com/edsonaraujobr/server
```

## 📦 Instalando as Dependências

Depois de clonar o projeto, instale todos os pacotes necessários com o comando:

```bash
npm i
```

## Adicione os arquivos .env

1. Faça uma pesquisa global buscando "test.env"
2. Na mesma pasta adicione um ".env" copiando todo o conteudo de test.env

## Rodando o banco

1. Para executar o banco, na pasta raiz execute no terminal: "docker compose up -d"

## Rodando o servidor

1. Execute o comando "npm run dev"
2. Você pode visualizar a documentação swagger através do navegador pesquisando: "localhost:4001/docs"

# 🧠 Fluxo de Trabalho com Git e Pull Request

## 🌱 Criando uma Nova Feature

Para iniciar uma nova funcionalidade, crie uma branch de feature com o comando:

```bash
git checkout -b feature/nome-da-feature
```
> Substitua `nome-da-feature` por algo que represente a funcionalidade que você irá desenvolver.

## ✅ Comitando Alterações

Após realizar as mudanças, siga os passos abaixo para versionar seu código:

```bash
git add .
git commit -m "descrição clara do que foi feito"
git push origin nome-da-branch
```

## 🚀 Criando um Pull Request (PR)

1. Acesse o GitHub.
2. Crie um **Pull Request** (PR).
3. Selecione a branch `develop` como destino (base).
4. Adicione outros desenvolvedores como revisores para fazerem o **code review (CR)**.

## 🔄 Continuar Trabalhando Enquanto o PR Está Aberto

Se você ainda está aguardando o CR de uma PR aberta mas deseja continuar codando:

1. Crie uma nova branch **a partir da sua feature atual**:

```bash
git checkout -b feature/nova-feature
```

2. Isso evita conflitos e repetições de alterações.
3. No novo PR, selecione como base a feature anterior que ainda está em revisão.

> 💡 Dica: mantenha o nome das branches e commits claros e padronizados para facilitar a colaboração entre os membros da equipe.

## Recomendação de leitura

Recomendo fortemente as seguintes leituras:

[Padrões para o nome do commit](https://github.com/iuricode/padroes-de-commits)
