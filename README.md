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

O proprietário indicou a Vercel como ambiente temporário de desenvolvimento e validação. Ainda não há projeto Vercel, configuração de build no painel nem deploy configurado neste repositório. Para qualquer publicação após autorização:

1. Execute `npm ci` e `npm test` em um ambiente com Node.js 18 ou superior.
2. Execute `npm run build` e envie todos os arquivos e subpastas de `_site/` para a raiz pública de um host estático.
3. Configure `guiadonomelimpo.com.br` como domínio personalizado no painel do provedor e aplique no registrador somente os registros DNS informados por esse provedor. Se usar `www`, configure o redirecionamento para uma única versão canônica.
4. Ative HTTPS no provedor e confirme que HTTP redireciona para HTTPS e que o domínio personalizado serve o build esperado, inclusive `/404.html`, `/robots.txt` e `/sitemap.xml`.
5. Para atualizações, repita `npm ci`, `npm test`, `npm run build` e envie o novo conteúdo de `_site/`. Automatização de build e deploy requer decisão posterior sobre o provedor e suas credenciais; não está configurada aqui.

O proprietário informou que o domínio usa `ns1.vercel-dns.com` e `ns2.vercel-dns.com`; isso não confirma que o projeto do site esteja hospedado na Vercel. Não altere os nameservers nem outros registros DNS sem uma migração aprovada e uma cópia de todos os registros atuais.

## Configurar na Vercel (quando o deploy estiver autorizado)

Não é necessário criar `vercel.json`: os parâmetros abaixo podem ser preenchidos no painel do projeto e não prendem o build ao runtime da Vercel. O site é estático e o deploy contém somente o diretório gerado. A existência de `404.html` permite que a hospedagem use a página 404 estática; confirme o comportamento no domínio de preview antes do lançamento.

Em **Add New Project → Import Git Repository**, selecione `kennidyroger04-wq/guia-do-nome-limpo` e use a branch `work` para validar esta versão. Como importar/conectar GitHub pode iniciar um build e criar uma URL acessível, não conclua essa ação nem clique em **Deploy** sem autorização para a publicação correspondente.

Valores do painel **Build and Development Settings**:

| Campo | Valor |
| --- | --- |
| Framework Preset | Eleventy, se disponível; caso contrário, Other |
| Root Directory | `./` (raiz do repositório) |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `_site` |
| Node.js Version | 22.x (Eleventy requer Node.js 18 ou superior) |
| Environment Variables | Nenhuma necessária |

Não associe o domínio personalizado durante uma validação temporária. Antes do lançamento, confirme domínio, branch de produção, redirecionamentos entre apex e `www`, HTTPS e a configuração da zona DNS no painel. O projeto define o apex `https://guiadonomelimpo.com.br` como URL canônica e sitemap.

## Candidato para migração: Cloudflare Pages

O build atual já é portável: integração GitHub opcional, comando `npm run build`, pasta de saída `_site`, Node.js 18+ e nenhum Worker ou função. Os valores de build se mantêm iguais aos da Vercel. Preserve o domínio canônico, os caminhos `.html`, `robots.txt` e o sitemap; compare todos os caminhos gerados antes de trocar o host.

Antes de escolher o plano gratuito, confirme nas políticas vigentes se o uso comercial e os anúncios planejados são permitidos, e verifique os limites atuais de arquivos por site, tamanho máximo de arquivo, builds mensais, concorrência/tempo de build, tráfego, regras de uso e recursos de funções. Este projeto é somente estático e não precisa de funções no momento. Esses limites e a política comercial não foram confirmados nesta tarefa: o acesso às páginas oficiais foi bloqueado pelo proxy de rede (HTTP 403). Consulte [limites do Pages](https://developers.cloudflare.com/pages/platform/limits/), [builds](https://developers.cloudflare.com/pages/configuration/build-configuration/), [integração Git](https://developers.cloudflare.com/pages/get-started/git-integration/) e [domínios personalizados](https://developers.cloudflare.com/pages/configuration/custom-domains/) antes de decidir.

O proprietário informou nameservers da Vercel. Para apontar o domínio apex para outro provedor que exija a zona DNS sob sua gestão, planeje uma migração de DNS: exporte/copie todos os registros atuais (incluindo MX, TXT e verificações de serviços), configure e valide a zona no novo provedor, confira o requisito de nameservers para domínio apex e só então altere a delegação no registrador. Faça a mudança em janela controlada, mantenha acesso à zona anterior e verifique NS, registros, HTTPS, apex/`www` e redirecionamentos após a propagação. Não execute nenhuma dessas etapas nesta missão.

Depois de escolher um destino, conecte o repositório e a branch de publicação por integração GitHub ou publique manualmente `_site/`, conforme suporte do provedor. A integração Git automatiza builds e publicações a cada atualização; só a habilite depois de decidir qual branch deve publicar e autorizar deploy automático. A arquitetura não requer mudanças no código para trocar de host.

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
