// TODO: separate logic in handler so is defined here but all logic
// still lives in sputnik-lib layer
const { handler } = require('@lambda/sputnik-lib/lib/cognito/pre-token-generation/handler')

exports.handler = handler
