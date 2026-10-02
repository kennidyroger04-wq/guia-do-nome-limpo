# guia-do-nome-limpo

## Desenvolvimento

Requer Node.js 18 ou superior.

```sh
npm ci
npm run dev
```

O servidor de desenvolvimento usa Eleventy. O site gerado fica em `_site/`.

## Adicionar um artigo

Crie `src/articles/<slug>.md` com os metadados e o conteúdo em Markdown. Exemplo de cabeçalho:

```yaml
---
layout: layouts/article.njk
permalink: /meu-artigo.html
title: "Título revisado do artigo"
description: "Resumo claro do conteúdo."
category: "Renegociação"
tag: "Guia"
excerpt: "Resumo usado nos cartões da página inicial e das listagens."
readTime: "6 min"
image: "/assets/imagem-artigo.jpg"
imageAlt: "Descrição objetiva da imagem"
iconPath: "M4 19h16M6 15l3-4 3 2 5-7"
tags:
  - article
---
```

Depois, escreva o artigo em Markdown no mesmo arquivo. Não informe uma data de revisão até a revisão acontecer; para mostrar uma data após uma revisão real, adicione `lastReviewed: YYYY-MM-DD`. Os metadados alimentam a página do artigo, a página inicial, a pesquisa, os filtros, a categoria e o sitemap. Categorias existentes aparecem nas suas URLs atuais; uma categoria nova recebe uma página em `/categorias/<slug>.html` automaticamente.

Use fontes verificáveis para afirmações financeiras e legais. Confira links, metadados, categoria, imagens e conteúdo antes de publicar. Não cadastre artigo que ainda não exista.

## Gerar e validar

```sh
npm ci
npm test
```

O comando de build remove e recria `_site/`. Publique o conteúdo dessa pasta pelo provedor de hospedagem escolhido. Este repositório não configura domínio nem implantação automática. O endereço de produção usado no sitemap está em `src/_data/site.json` e precisa ser confirmado antes do lançamento.

## Estrutura

- `src/articles/`: artigos em Markdown e metadados.
- `src/_includes/layouts/article.njk`: template reutilizável dos artigos.
- `src/_includes/partials/navigation.njk`: menu comum.
- `src/categories.njk`: páginas de categoria geradas da coleção.
- `src/todos-os-artigos.njk`: pesquisa e filtros alimentados pela coleção.
- `src/sitemap.njk`: sitemap gerado no build.
- `src/assets/`: CSS responsivo e comportamento acessível do menu.
- `src/*.njk`: templates e páginas estáticas ainda mantidas manualmente.
