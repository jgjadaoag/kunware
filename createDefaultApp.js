let express = require('express');
let createMiddlewareBasedOn = require('./');
let generate = require('./lib/generate');
let generate2 = require('./lib/generate2');

module.exports = createDefaultApp;

function createDefaultApp(apis, options) {
  options = options || {};
  kunware = createMiddlewareBasedOn(options);
  let app = express();

  app.get('/api-docs', kunware.apiDocs(apis));
  if (options.ui !== false) app.use('/ui', kunware.ui);

  if (options['config-back'] !== false) app.use(kunware.config(options));

  if (options.killable || options.k) app.use('/kill', kunware.kill);

  app.use(
    kunware.swagger(apis, app),
    kunware.replay(),
    kunware.chance,
    kunware.time,
    kunware.status,
    kunware.mock([
      generate.id,
      generate2.birthday,
      generate2.email,
      generate2.url,
      generate2.phone,
      generate2.city,
      generate2.country,
      generate2.street,
      generate2.zip,
      generate2.houseNo,
      generate2.prefix,
      generate2.first,
      generate2.last,
      generate2.description,
      generate2.summary,
      generate2.label,
      generate2.price,
      generate.string,
      generate.number,
      generate.integer,
      generate.boolean,
      generate.array,
      generate.object,
    ], options),
    kunware.override
  );

  if (options.memory) {
    app.use(
      kunware.classify,
      kunware.memory(options)
    );
  }

  app.use(
    kunware.send,
    kunware.notFound,
    kunware.sendError
  );

  return app;
}
