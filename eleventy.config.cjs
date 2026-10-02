const categories = require('./src/_data/categories.json');
const site = require('./src/_data/site.json');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });

  eleventyConfig.addCollection('articles', (collectionApi) =>
    collectionApi.getFilteredByTag('article').sort((a, b) => {
      const aDate = a.date ? a.date.getTime() : 0;
      const bDate = b.date ? b.date.getTime() : 0;
      return bDate - aDate || a.data.title.localeCompare(b.data.title, 'pt-BR');
    })
  );

  eleventyConfig.addCollection('siteCategories', (collectionApi) => {
    const byName = new Map(categories.map((category) => [category.name, category]));
    for (const article of collectionApi.getFilteredByTag('article')) {
      const name = article.data.category;
      if (!name || byName.has(name)) continue;
      const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      byName.set(name, {
        name,
        title: name,
        description: `Artigos publicados na categoria ${name}.`,
        permalink: `/categorias/${slug}.html`,
        slug,
      });
    }
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  });

  eleventyConfig.addCollection('articleFilterCategories', (collectionApi) => {
    const byValue = new Map(site.filterCategories.map((category) => [category.value, category]));
    for (const article of collectionApi.getFilteredByTag('article')) {
      const name = article.data.category;
      if (name && !byValue.has(name)) byValue.set(name, { value: name, label: name });
    }
    return [...byValue.values()];
  });

  eleventyConfig.addCollection('sitePages', (collectionApi) =>
    collectionApi.getAll()
      .filter((item) => item.url && item.url !== '/sitemap.xml' && !item.data.excludeFromSitemap && !item.inputPath.replace(/\\/g, '/').endsWith('/src/categories.njk'))
      .sort((a, b) => a.url.localeCompare(b.url))
  );

  eleventyConfig.addFilter('articlesJson', (articles) => JSON.stringify(articles.map((article) => ({
    title: article.data.title,
    excerpt: article.data.excerpt,
    category: article.data.category,
    tag: article.data.tag || 'Artigo',
    readTime: article.data.readTime || '',
    link: article.url,
    iconPath: article.data.iconPath || 'M4 19h16M6 15l3-4 3 2 5-7',
    date: article.data.lastReviewed
      ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${article.data.lastReviewed}T12:00:00Z`))
      : '',
    dateRaw: article.data.lastReviewed || '',
  }))).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'));

  eleventyConfig.addFilter('articlesByCategory', (articles, category) =>
    articles.filter((article) => article.data.category === category)
  );

  eleventyConfig.addFilter('take', (items, count) => items.slice(0, count));

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    templateFormats: ['html', 'njk', 'md'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
};
