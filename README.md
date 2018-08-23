# Kunware

[![npm version](https://badge.fury.io/js/kunware.svg)](https://badge.fury.io/js/kunware)
[![Build Status](https://travis-ci.org/kalibrr/kunware.svg?branch=master)](https://travis-ci.org/kalibrr/kunware)
[![Build status](https://ci.appveyor.com/api/projects/status/99t014h947hf4q5r/branch/master?svg=true)](https://ci.appveyor.com/project/jgjadaoag/kunware/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/kalibrr/kunware/badge.svg?branch=master)](https://coveralls.io/github/kalibrr/kunware?branch=master)
[![Dependency Status](https://david-dm.org/kalibrr/kunware.svg)](https://david-dm.org/kalibrr/kunware)
[![devDependency Status](https://david-dm.org/kalibrr/kunware/dev-status.svg)](https://david-dm.org/kalibrr/kunware?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/kalibrr/kunware/badge.svg)](https://snyk.io/test/github/kalibrr/kunware)

A fork of pokemock with options for developer convenience.
The Kunware package generates a mock server from one or more arbitrary
Swagger files with supports seeding, timeouts, response picking,
entity memory, semantic action inference, etc.

## Usage

```nil
Syntax:
  kunware <swagger-urls-or-files> ... [-h] [-v] [-w] [-p <port>]

Options:
  -h, --help                 Show help
  -v, --version              Show version
  -p, --port <port>          Set server port, default is 8000
  -w, --watch                Watch mode: Restart on Swagger changes (cluster stuff)
  -k, --killable             Publish /kill endpoint to stop the service
      --watch-adapt          Minimal watch mode: Adapt on swagger changes
      --no-ui                Disables the swagger ui from running
      --no-config-ui         Disables the configuration ui from running
      --no-config-back       Disables the configuration feature
      --config <config file> YAML file containing the configuration (default is config.yaml if it exists)
      --example <enabled|disabled|preferably>
                             Whether to use the examples or not or to use example if there is one
      --memory               Enable memory module (experimental)
```

## Server

The mock server listens to the specified port and
mocks endpoints defined in the provided Swagger document.
Additionally, it publishes a Swagger UI under `/ui`,
the Swagger API under `/api-docs` and a `/kill` endpoint for shutdown.

## Request Headers

Using optional headers, clients can control the server's behavior:

- __X-Mock-Status__
  - Specifies the response status code
  - The correct response is inferred from the API if possible
  - Defaults to the first response code specified in the API
- __X-Mock-Seed__
  - Specifies a seed for data generation
  - If omitted, a random seed is generated
  - The current seed is always returned in a X-Mock-Seed response header
- __X-Mock-Time__
  - Specifies the minimum response time (milliseconds)
- __X-Mock-Size__
  - Specifies array size(s) in the response
  - Must be a valid JSON object of
    `<definitionName|attributeName>: <size>` pairs
  - If omitted, array sizes are randomly between 1 and 5
- __X-Mock-Depth__
  - Specifies the maximum JSON data depth
  - Defaults to 5
- __X-Mock-Example__
  - Specifies if the response should use the example in the top level schema
  - Defaults to `disabled` and turned on with `enabled`
- __X-Mock-Override__
  - Specifies response data via [JSON Path](https://github.com/dchester/jsonpath)
  - Must be a valid JSON object of `<jsonPath>: <data>` pairs
  - `<data>` is arbitrary JSON
- __X-Mock-Replay__
  - Specifies the number of times the current X-Mock-* headers should be replayed
  - The next N requests to the requested URL will replay the current X-Mock-* headers
- __X-Mock-Replay-Pattern__
  - Specifies a regular expression to match for X-Mock-Replay
  - If omitted, the exact path is used for replaying

## Memory (experimental)

Use the `--memory` switch to enable the memory module.
When enabled, entities containing an ID are remembered by the server.
If the entity is requested again, the remembered data is returned.
This also applies to sub-entities across endpoints.

Additionally, the server tries to infer semantic actions from requests,
such as:

- Get by id
- Delete by id
- Update by id
- Create new entity

These actions are applied to known entities in memory.
For example, requesting a deleted entity will result in a 404 response.

## Customization

Kunware provides a set of [Express](http://expressjs.com/de/) middlewares
which you can use independently.
The default app defined in `createDefaultApp.js` is an opinionated stack of
middlewares which you're encouraged to hack on.
By re-arranging and adding middlewares (especially generators)
you can tailor Kunware to fit your APIs.
