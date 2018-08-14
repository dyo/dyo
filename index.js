'use strict'

if (process.env.NODE_ENV === 'development') {
  module.exports = require('./dist/dio.umd.development.min.js')
} else {
  module.exports = require('./dist/dio.umd.production.min.js')
}
