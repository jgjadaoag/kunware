let express = require('express');
let swaggerMiddleware = require('swagger-express-middleware');
let swaggerMerge = require('../swaggerMerge');
let swaggerMin = require('../swaggerMin');
let chokidar = require('chokidar');

module.exports = {
  closeWatcher,
  middleware,
  naiveStrategy,
  watchingStrategy,
};

let watcher;

// set up swagger-express-middleware, kunware-style
function middleware(apis, middlewareEnhancer) {
  if (!Array.isArray(apis)) apis = [apis];

  let swaggerRouterReady = createSwaggerRouter(apis);
  return middlewareEnhancer(swaggerRouterReady, apis);
}

function naiveStrategy(swaggerRouterReady) {
  return function(req, res, next) {
    swaggerRouterReady.then(function(router) {
      router.handle(req, res, next);
    }).catch(next);
  };
}

function watchingStrategy(swaggerRouterReady, apis) {
  let watcherReady = new Promise(function(resolve, reject) {
    watcher = chokidar.watch(apis, {persistent: true});

    watcher.on('ready', () => resolve());
    watcher.on('error', (error) => reject(error));
    watcher.on('change', () => swaggerRouterReady = createSwaggerRouter(apis));
  });

  return function(req, res, next) {
    watcherReady.then(() => swaggerRouterReady).then(function(router) {
      router.handle(req, res, next);
    }).catch(next);
  };
}

function closeWatcher() {
  watcher.close();
}

/**
 * Generate a swagger merge promise
 * @param {Array} apis list of apis to use
 * @return {Promise} Promise that resolves when swaggger merge is ready
 */
function createSwaggerRouter(apis) {
  return swaggerMerge(apis).then(swaggerMin).then(function(api) {
    return new Promise(function(resolve, reject) {
      swaggerMiddleware(api, function(err, middleware) {
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
