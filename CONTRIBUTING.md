# Contributing to DIO

The following is a quick set of guidelines and details to maximise your understanding of the project. Hopefully this document makes the process of contributing clear and answers some questions that you may have.

## Semantic Versioning

DIO follows semantic versioning. Patch versions are released for bugfixes, minor versions for new features, and major versions for any breaking changes.

Every significant change is documented in the changelog file.

## Bugs

The best way to get your bug fixed is to provide a reduced test case / reproduction.

If you find a bug in the source code, you can help by
[submitting an issue](#submit-issue) or [submit a Pull Request](#submit-pr) with a failing test case / fix.

## Pull Requests

**Before submitting a pull request**, please make sure the following is done:

1. If you've added code that should be tested, add tests.
1. If you've changed APIs, add documentation.
1. Ensure the test suite passes (npm test).

## Code Conventions

- No semicolons `;`
- Commas last `,`
- 2 tabs for indentation
- Prefer `'` over `"`
- Write "descriptive" code


## Repository Layout

### Tests

Test make us of the [mocha](https://mochajs.org/) framework and [chai](chaijs.com) assertion library. 

The following command will run  the complete test suite.

```
npm test
```

The following runs an interactive test watcher.

```
npm test -- --watch
```

### Source

The distribution bundle is made of different sources that are separeted in terms of a separation of concerns.

```
- src/
  - Core/
  - DOM/
  - Server/
  - Native/
```

For example, eveything in `Core/` manages aspects related to creating snapshot elements, diffing and reconciling while everyhing in `DOM` is related only to the layer that touches the native document model. The same can be said for `Server/` in related to Node and server side rendering. On the other hand `Native/` is currently still an expiremental future layer meant to target other native stacks.

The distrution artifacts in `./dist/` are made of the bundle of the related sources mentioned above. You can create or update a build by running the following command.

```
npm run build
```

Alternatively you can run the following to generate a build everytime you make changes to `src/`.

```
npm run dev
```

### Documentation

The documentation site [dio.js.org](https://dio.js.org) is made of the following sources.

```
- docs/
  - introduction/
  - api/
  	- index
  	- top-level
  	- element
  	- component
  	- server
  - examples/
  - repl/
  - assets/
  	- javascript
  	- stylesheet
  	- images
```

There currently is no build step(.md to .html) for the docs, though this may change if the need presents itself.
