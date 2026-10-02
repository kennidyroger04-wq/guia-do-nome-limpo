# guia-do-nome-limpo

## Publicação atual de artigos

O site ainda usa páginas HTML estáticas. Para publicar um artigo, crie primeiro uma página HTML real no diretório raiz e então inclua seus metadados e o caminho existente em `todos-os-artigos.html` (`articlesDB`). Não cadastre cartões para páginas que ainda não existem. A listagem permite campos de data opcionais; omita a data até haver uma revisão confirmada.

## Próxima arquitetura

A futura migração para Markdown deve usar um único registro por artigo para gerar a página, o cartão da listagem, as categorias e o sitemap. Nessa migração, substitua a lista manual `articlesDB` e os cartões repetidos da página inicial/categorias por saídas geradas a partir da mesma fonte. Não há CMS ou gerador configurado atualmente.
