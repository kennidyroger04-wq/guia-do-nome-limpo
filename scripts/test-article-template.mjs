import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const nunjucks = require('nunjucks');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const layout = readFileSync(path.join(root, 'src/_includes/layouts/article.njk'), 'utf8');
const environment = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(path.join(root, 'src/_includes'))
);

const base = {
  title: 'Artigo de teste',
  description: 'Descrição de teste.',
  site: { name: 'Guia do Nome Limpo', url: 'https://guiadonomelimpo.com.br' },
  page: { url: '/artigo-de-teste.html' },
  category: 'Organização financeira',
  readTime: '5 min',
  content: '<p>Conteúdo do artigo.</p>',
  noCanonical: false,
};

const withoutCover = environment.renderString(layout, { ...base });
assert.doesNotMatch(withoutCover, /<img\b/);
assert.doesNotMatch(withoutCover, /src=""/);
assert.match(withoutCover, /Conteúdo do artigo/);

const withCover = environment.renderString(layout, {
  ...base,
  image: '/assets/test-cover.jpg',
  imageAlt: 'Pessoa organizando documentos financeiros',
});
assert.match(withCover, /src="\/assets\/test-cover\.jpg"/);
assert.match(withCover, /alt="Pessoa organizando documentos financeiros"/);

const withoutAlt = environment.renderString(layout, {
  ...base,
  image: '/assets/test-cover.jpg',
});
assert.doesNotMatch(withoutAlt, /<img\b/);

console.log('Article template checks passed: missing cover/alt omits image; complete image metadata renders accessibly.');
