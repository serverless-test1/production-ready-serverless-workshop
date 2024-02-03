const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge')
const eventBridge = new EventBridgeClient()
const chance = require('chance').Chance()
const { Logger } = require('@aws-lambda-powertools/logger')
const logger = new Logger({ serviceName: process.env.serviceName })

const busName = process.env.bus_name

module.exports.handler = async (event) => {
  const restaurantName = JSON.parse(event.body).restaurantName

  const orderId = chance.guid()
  // console.log(`placing order ID [${orderId}] to [${restaurantName}]`)
  logger.debug('placing order...', { orderId, restaurantName })

  const putEvent = new PutEventsCommand({
    Entries: [{
      Source: 'big-mouth',
      DetailType: 'order_placed',
      Detail: JSON.stringify({
        orderId,
        restaurantName,
      }),
      EventBusName: busName
    }]
  })
  await eventBridge.send(putEvent)

  // console.log(`published 'order_placed' event into EventBridge`)
  logger.debug(`published event into EventBridge`, {
    eventType: 'order_placed',
    busName
  })

  const response = {
    statusCode: 200,
    body: JSON.stringify({ orderId })
  }

  return response
}