module.exports = createMiddlewareBasedOn;

function featureDecisionsFrom(options) {
  return {
    adaptSwaggerUIOnChange() {
      return options['watch-adapt'] !== false;
    },
    adaptSwaggerOnChange() {
      return options['watch-adapt'] !== false;
    },
  };
}

function createMiddlewareBasedOn(options) {
  options = options || {};

  featureDecisions = featureDecisionsFrom(options);

  return {
    apiDocs(apis) {
      const apiDocs = require('./lib/middleware/apiDocs');
      if (featureDecisions.adaptSwaggerUIOnChange()) {
        return apiDocs.middleware(apis, apiDocs.watchingStrategy);
      }
      return apiDocs.middleware(apis, apiDocs.naiveStrategy);
    },
    ui: require('./lib/middleware/ui'),
    kill: require('./lib/middleware/kill'),
    swagger(apis) {
      const swagger = require('./lib/middleware/swagger');
      if (featureDecisions.adaptSwaggerOnChange()) {
        return swagger.middleware(apis, swagger.watchingStrategy);
      }
      return swagger.middleware(apis, swagger.naiveStrategy);
    },
    replay: require('./lib/middleware/replay'),
    chance: require('./lib/middleware/chance'),
    classify: require('./lib/middleware/classify'),
    memory: require('./lib/middleware/memory'),
    status: require('./lib/middleware/status'),
    time: require('./lib/middleware/time'),
    mock: require('./lib/middleware/mock'),
    override: require('./lib/middleware/override'),
    notFound: require('./lib/middleware/notFound'),
    sendError: require('./lib/middleware/sendError'),
    send: require('./lib/middleware/send'),
    config: require('./lib/middleware/config'),
  };
}
