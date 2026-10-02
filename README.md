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
npm run build
npm test
```

O build define `ELEVENTY_ENV=production`, remove e recria `_site/`. Os testes verificam páginas, links locais, artigo, sitemap, canonical, favicon e robots.txt. O endereço canônico está em `src/_data/site.json` (`https://guiadonomelimpo.com.br`), definido a partir do domínio informado pelo proprietário.

## Publicar

Este repositório não contém configuração de hospedagem, integração contínua ou implantação automática. Nenhum provedor foi confirmado. Para publicar após escolher/confirmar o provedor:

1. Execute `npm ci` e `npm test` em um ambiente com Node.js 18 ou superior.
2. Execute `npm run build` e envie todos os arquivos e subpastas de `_site/` para a raiz pública de um host estático.
3. Configure `guiadonomelimpo.com.br` como domínio personalizado no painel do provedor e aplique no registrador somente os registros DNS informados por esse provedor. Se usar `www`, configure o redirecionamento para uma única versão canônica.
4. Ative HTTPS no provedor e confirme que HTTP redireciona para HTTPS e que o domínio personalizado serve o build esperado, inclusive `/404.html`, `/robots.txt` e `/sitemap.xml`.
5. Para atualizações, repita `npm ci`, `npm test`, `npm run build` e envie o novo conteúdo de `_site/`. Automatização de build e deploy requer decisão posterior sobre o provedor e suas credenciais; não está configurada aqui.

Antes do lançamento, confirme no registrador quem controla a zona DNS e no provedor qual destino e configuração de domínio devem ser usados. Os valores de DNS variam entre provedores e não estão registrados neste repositório. Verifique externamente DNS, HTTPS, redirecionamentos e status de publicação após configurar o host.

## Informações que faltam para transparência

As páginas Sobre, Política de Privacidade e Termos deixam explícito que não há formulário, newsletter, analytics, anúncios ou links de afiliados ativos. Antes de publicação, o responsável ainda precisa decidir e preencher: identificação do operador e canal de contato; provedor de hospedagem e tratamento de logs/cookies; prazos aplicáveis de retenção e resposta a solicitações; e, se forem ativados, serviços de publicidade/afiliados, tecnologias de rastreamento e respectivos avisos. Não foram inseridos dados pessoais ou empresariais sem confirmação.

## Estrutura

- `src/articles/`: artigos em Markdown e metadados.
- `src/_includes/layouts/article.njk`: template reutilizável dos artigos.
- `src/_includes/partials/navigation.njk`: menu comum.
- `src/categories.njk`: páginas de categoria geradas da coleção.
- `src/todos-os-artigos.njk`: pesquisa e filtros alimentados pela coleção.
- `src/sitemap.njk`: sitemap gerado no build.
- `src/robots.njk`, `src/404.njk` e `src/favicon.svg`: recursos técnicos da publicação.
- `src/assets/`: CSS responsivo e comportamento acessível do menu.
- `src/*.njk`: templates e páginas estáticas ainda mantidas manualmente.

Na migração futura para uma arquitetura editorial mais automatizada, revisar os links relativos ainda presentes nas páginas estáticas, a configuração do domínio base e o caminho de saída `/_site`; o artigo em Markdown e os templates já fornecem uma base reaproveitável.
