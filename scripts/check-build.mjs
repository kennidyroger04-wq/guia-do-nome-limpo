import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '_site');
function listHtmlFiles(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path.join(directory, entry.name), relative);
    return entry.isFile() && entry.name.endsWith('.html') ? [relative] : [];
  });
}

const pages = listHtmlFiles(root).sort();
assert.ok(pages.length >= 12, `Expected the 12 existing HTML pages, received ${pages.length}`);
assert.ok(existsSync(path.join(root, '404.html')), '404 page was not generated');
assert.ok(existsSync(path.join(root, 'robots.txt')), 'robots.txt was not generated');
assert.ok(existsSync(path.join(root, 'favicon.svg')), 'favicon was not generated');

const read = (name) => readFileSync(path.join(root, name), 'utf8');
const allPages = pages.map((name) => [name, read(name)]);
const brokenLinks = [];

for (const [source, html] of allPages) {
  for (const match of html.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)) {
    const href = match[2].trim();
    if (!href || href === '#' || href.includes('${') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) continue;
    const [pathname, fragment] = href.split('#', 2);
    const targetPath = pathname
      ? path.resolve(root, pathname.startsWith('/') ? `.${pathname}` : path.join(path.dirname(source), pathname))
      : path.join(root, source);
    const resolvedPath = existsSync(targetPath) && statSync(targetPath).isDirectory()
      ? path.join(targetPath, 'index.html')
      : targetPath;
    if (!existsSync(resolvedPath)) {
      brokenLinks.push(`${source} -> ${href}`);
      continue;
    }
    if (fragment) {
      const targetHtml = readFileSync(resolvedPath, 'utf8');
      const idExists = [...targetHtml.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)].some((id) => id[2] === decodeURIComponent(fragment));
      if (!idExists) brokenLinks.push(`${source} -> ${href} (missing fragment)`);
    }
  }
}
assert.deepEqual(brokenLinks, [], `Broken local links found:\n${brokenLinks.join('\n')}`);

const articlePath = 'limpa-nome-guia-consultar-cpf-negociar-dividas.html';
assert.ok(existsSync(path.join(root, articlePath)), 'Markdown article was not generated');
assert.match(read('todos-os-artigos.html'), new RegExp(`href="/${articlePath}"`));
assert.match(read('index.html'), new RegExp(`href="/${articlePath}"`));
assert.match(read('guias-de-renegociacao.html'), new RegExp(`href="/${articlePath}"`));
assert.match(read(articlePath), /Súmula 548/);
assert.match(read(articlePath), /Serasa Limpa Nome/);
assert.match(read('index.html'), /id="discountCalculator"/);
assert.match(read('todos-os-artigos.html'), /id="searchInput"/);
assert.match(read('todos-os-artigos.html'), /id="categoryFilter"/);
assert.match(read('todos-os-artigos.html'), /<option value="Score">Score &amp; CPF<\/option>/);
assert.match(read('todos-os-artigos.html'), /<option value="Renegociação">Renegociação<\/option>/);
assert.ok(existsSync(path.join(root, 'assets/responsive.css')));
assert.ok(existsSync(path.join(root, 'assets/navigation.js')));
assert.ok(existsSync(path.join(root, 'assets/financial-tools.js')));
const calculatorPage = read('calculadoras.html');
const financialScript = read('assets/financial-tools.js');
assert.match(calculatorPage, /id="discountCalculator"/);
assert.match(calculatorPage, /id="budgetCalculator"/);
assert.match(calculatorPage, /id="installmentCalculator"/);
assert.match(calculatorPage, /sistema Price/);
assert.match(calculatorPage, /não representa o CET/);
assert.match(calculatorPage, /aria-live="polite"/);
assert.doesNotMatch(financialScript, /\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie/);
assert.match(read('index.html'), /id="discountCalculator"/);
assert.match(read('sobre.html'), /calculadoras de desconto, orçamento e parcelas/);
assert.match(read('termos-de-uso.html'), /não representam o Custo Efetivo Total/);
assert.match(read('politica-de-privacidade.html'), /Google Fonts/);
assert.match(read('politica-de-privacidade.html'), /não os enviam nem salvam/);

const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]));
assert.equal(sitemapUrls.length, pages.length - 1, `Expected every indexable HTML page except the 404 in the sitemap; received ${sitemapUrls.length} entries for ${pages.length} pages`);
for (const url of sitemapUrls) {
  const pathname = decodeURIComponent(url.pathname.replace(/^\//, ''));
  const targetPath = path.join(root, pathname);
  const target = pathname && !pathname.endsWith('/')
    ? targetPath
    : path.join(targetPath, 'index.html');
  assert.ok(existsSync(target), `Sitemap URL has no generated file: ${url.href}`);
  assert.notEqual(url.pathname, '/404.html', '404 page must not appear in the sitemap');
}

const siteUrl = 'https://guiadonomelimpo.com.br';
assert.ok(read('robots.txt').includes(`Sitemap: ${siteUrl}/sitemap.xml`), 'robots.txt must point at the configured sitemap');
for (const [name, html] of allPages) {
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)">/g)].map((match) => match[1]);
  if (name === '404.html') {
    assert.equal(canonicals.length, 0, '404 page must not have a canonical URL');
    assert.match(html, /name="robots" content="noindex, follow"/);
  } else {
    assert.equal(canonicals.length, 1, `${name} must have exactly one canonical URL`);
    assert.ok(canonicals[0].startsWith(`${siteUrl}/`), `${name} canonical must use the configured site URL`);
    if (name === 'index.html') assert.equal(canonicals[0], `${siteUrl}/`, 'homepage canonical must use the domain root');
  }
}
assert.ok(sitemapUrls.some((url) => url.href === `${siteUrl}/`), 'sitemap must use the domain root for the homepage');
assert.match(read('index.html'), /rel="icon" type="image\/svg\+xml" href="\/favicon\.svg"/);

console.log(`Build check passed: ${pages.length} pages, ${sitemapUrls.length} sitemap entries, no broken local links.`);
