import * as AWS from 'aws-sdk'
import * as fs from 'fs'
import * as moment from 'moment'

/**
 *
 * @class greengrassHelper
 */
export class greengrassHelper {
	/**
     * @class greengrassHelper
     * @constructor
     */
	constructor () {
		this.creds = new AWS.EnvironmentCredentials('AWS') // Lambda provided credentials
	}

	associateServiceRoleToAccount () {
		const gg = new AWS.Greengrass()

		return gg
			.associateServiceRoleToAccount({
				RoleArn: process.env.GREENGRASS_SERVICE_ROLE_ARN,
			})
			.promise()
			.then(data => {
				return data
			})
	}
}

export default greengrassHelper
