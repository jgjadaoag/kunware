let express = require('express');
let swaggerMiddleware = require('swagger-express-middleware');
let swaggerMerge = require('../swaggerMerge');
let swaggerMin = require('../swaggerMin');
let chokidar = require('chokidar');

module.exports = swagger;

// set up swagger-express-middleware, kunware-style
function swagger(apis, app) {
  if (!Array.isArray(apis)) apis = [apis];

  let swaggerRouterReady = createSwaggerRouter(apis, app);
  let watcherReady = new Promise(function(resolve, reject) {
    let watcher = chokidar.watch(apis);

    watcher.on('ready', () => resolve());
    watcher.on('error', (error) => reject(error));
    watcher.on('all', () => swaggerRouterReady = createSwaggerRouter(apis, app));
  });

  return function(req, res, next) {
    watcherReady.then(() => swaggerRouterReady).then(function(router) {
      router.handle(req, res, next);
    }).catch(next);
  };
}

function createSwaggerRouter(apis, app) {
  return swaggerMerge(apis).then(swaggerMin).then(function(api) {
    return new Promise(function(resolve, reject) {
      swaggerMiddleware(api, app, function(err, middleware) {
        if (err) reject(err);

        resolve(express.Router().use(
          middleware.metadata(),
          middleware.CORS(),
          middleware.files(),
          middleware.parseRequest(),
          middleware.validateRequest(),
          function(err, req, res, next) {
            next(err.stack.match(/Maximum call stack size exceeded/) ? null : err);
          }
        ));
      });
    });
  });
}
