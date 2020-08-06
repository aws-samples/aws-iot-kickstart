'use strict'

import * as AWS from 'aws-sdk'
import * as fs from 'fs'
import * as moment from 'moment'

/**
 *
 * @class iotHelper
 */
export class iotHelper {
	/**
     * @class iotHelper
     * @constructor
     */
	constructor () {
		this.creds = new AWS.EnvironmentCredentials('AWS') // Lambda provided credentials
	}

	describeEndpoint (endpointType = 'iot:Data') {
		const iot = new AWS.Iot()
		console.log('describeEndpoint:', endpointType)

		return iot.describeEndpoint({
			endpointType: endpointType,
		}).promise().then(data => {
			console.log('Returned endpoint', data)

			return data
		})
	}

	attachPrincipalPolicy (policyName, principal) {
		const iot = new AWS.Iot()

		return iot.attachPrincipalPolicy({
			policyName: policyName,
			principal: principal,
		}).promise().then(data => {
			console.log('attachPrincipalPolicy successful for', policyName, principal, data)

			return true
		}).catch(err => {
			console.error(err)

			return false
		})
	}

	iotdata (cmd, params) {
		cmd = cmd.split('.')[1]

		return this.describeEndpoint().then(endpoint => {
			const iotdata = new AWS.IotData({
				endpoint: endpoint.endpointAddress,
			})

			return iotdata[cmd](params).promise()
		}).then(result => {
			console.log('Result:', result)

			return result
		})
	}
}

export default iotHelper
