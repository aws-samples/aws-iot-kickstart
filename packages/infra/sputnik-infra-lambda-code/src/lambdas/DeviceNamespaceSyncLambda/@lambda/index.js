// TODO: separate logic in handler so is defined here but all logic
// still lives in sputnik-lib layer
const { handler, handleRecord } = require('@lambda/sputnik-lib/lib/device-namespace/handler')

exports.handler = handler
exports.handleRecord = handleRecord
