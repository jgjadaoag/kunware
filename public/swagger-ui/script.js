$(function() {
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = '/api-docs';
  }

  hljs.configure({
    highlightSizeThreshold: 5000,
  });

  // Pre load translate...
  if (window.SwaggerTranslator) {
    window.SwaggerTranslator.translate();
  }
  window.swaggerUi = new SwaggerUi({
    url: url,
    dom_id: 'swagger-ui-container',
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    onComplete: function(swaggerApi, swaggerUi) {
      if (typeof initOAuth == 'function') {
        initOAuth({
          clientId: 'your-client-id',
          clientSecret: 'your-client-secret-if-required',
          realm: 'your-realms',
          appName: 'your-app-name',
          scopeSeparator: ' ',
          additionalQueryStringParams: {},
        });
      }

      if (window.SwaggerTranslator) {
        window.SwaggerTranslator.translate();
      }
    },
    onFailure: function(data) {
      log('Unable to Load SwaggerUI');
    },
    docExpansion: 'none',
    jsonEditor: false,
    defaultModelRendering: 'schema',
    showRequestHeaders: true,
    showOperationIds: true,
    validatorUrl: null,
  });

  window.swaggerUi.load();

  function log(...args) {
    if ('console' in window) {
      console.log(...args);
    }
  }
});
