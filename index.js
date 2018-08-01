'use strict'

if (process.env.NODE_ENV === 'development') {
  module.exports = require('./dist/dio.cjs.development.min.js')
} else {
  module.exports = require('./dist/dio.cjs.production.min.js')
}
