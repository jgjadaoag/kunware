const assert = require('assert');
const fs = require('fs');
const rewire = require('rewire');
const sinon = require('sinon');
const swagger = rewire('../../lib/middleware/swagger');

describe('The swagger middleware', function() {
  describe('watcher', function() {
    let creationSpy;
    let petstore;
    let petstoreBuffer;

    before(function() {
      createSwaggerRouter = swagger.__get__('createSwaggerRouter');
      creationSpy = sinon.spy(createSwaggerRouter);
      swagger.__set__('createSwaggerRouter', creationSpy);
      petstoreBuffer = fs.readFileSync('test/petstore.json');
      petstore = JSON.parse(petstoreBuffer.toString());
      fs.writeFileSync('test/petstore.copy.json', JSON.stringify(petstore));
    });

    afterEach(function() {
      swagger.closeWatcher();
      petstore = JSON.parse(petstoreBuffer.toString());
      fs.writeFileSync('test/petstore.copy.json', JSON.stringify(petstore));
      creationSpy.resetHistory();
    });

    after(function() {
      fs.unlinkSync('test/petstore.copy.json');
    });

    it('should create a new swagger router on file change', function(done) {
      function edit() {
        petstore.paths['/sample'] = {
          get: {summary: 'Example route', operationId: 'sample', produces: 'application/json', responses: {'200': {description: 'OK'}}},
        };
        fs.writeFileSync('test/petstore.copy.json', JSON.stringify(petstore));
        middleware(null, null, verify);
      }
      function verify() {
        assert.ok(creationSpy.calledTwice);
        done();
      }
      let middleware = swagger.middleware('test/petstore.copy.json', swagger.watchingStrategy);
      middleware(null, null, edit);
    });

    xit('should watch multiple files and directories', function(done) {
      function edit() {
        petstore.paths['/sample'] = {
          get: {summary: 'Example route', operationId: 'sample', produces: 'application/json', responses: {'200': {description: 'OK'}}},
        };
        fs.writeFileSync('test/petstore.copy.json', JSON.stringify(petstore));
        middleware(null, null, verify1);
      }
      function verify1() {
        assert.ok(creationSpy.calledTwice);
        fs.writeFileSync('test/petstore.copy.2.json', JSON.stringify(petstore));
        middleware(null, null, verify2);
      }
      function verify2() {
        assert.ok(creationSpy.calledThrice);
        fs.unlinkSync('test/petstore.copy.2.json');
        done();
      }
      fs.writeFileSync('test/petstore.copy.2.json', JSON.stringify(petstore));
      let middleware = swagger.middleware(['test/petstore.copy.json', 'test/petstore.copy.2.json'], swagger.watchingStrategy);
      middleware(null, null, edit);
    });

    it('should not create a new router on unmodified file', function(done) {
      function edit() {
        fs.writeFileSync('test/petstore.copy.json', JSON.stringify(petstore));
        middleware(null, null, verify);
      }
      function verify() {
        assert.ok(creationSpy.calledOnce);
        done();
      }
      let middleware = swagger.middleware('test/petstore.copy.json', swagger.watchingStrategy);
      middleware(null, null, edit);
    });
  });
});
