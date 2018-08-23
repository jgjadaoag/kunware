let _ = require('lodash');
let chokidar = require('chokidar');
let swaggerMerge = require('../swaggerMerge');
let swaggerMin = require('../swaggerMin');

module.exports = {
  closeWatcher,
  middleware,
  naiveStrategy,
  watchingStrategy,
};

let watcher;

function middleware(apis, middlewareEnhancer) {
  if (!Array.isArray(apis)) apis = [apis];
  let ready = createSwaggerMerge(apis);

  return middlewareEnhancer(ready, apis);
}

function naiveStrategy(swaggerMergeReady) {
  return function(req, res, next) {
    swaggerMergeReady.then(function(api) {
      res.json(api);
    }).catch(next);
  };
}

function watchingStrategy(swaggerMergeReady, apis) {
  let watcherReady = new Promise(function(resolve, reject) {
    watcher = chokidar.watch(apis);

    watcher.on('ready', () => resolve());
    watcher.on('error', (error) => reject(error));
    watcher.on('all', () => swaggerMergeReady = createSwaggerMerge(apis));
  });

  return function(req, res, next) {
    watcherReady.then(() => swaggerMergeReady).then(function(api) {
      res.json(api);
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
function createSwaggerMerge(apis) {
  return swaggerMerge(apis).then(swaggerMin).then(function(api) {
    // copy api for api-docs
    // swaggerMiddleware inserts circular refs
    api = _.cloneDeep(api);

    // cannot mock APIs with a specified host, remove it
    delete api.host;

    return api;
  });
}
