const AWS = require('aws-sdk')
const appsync = require('aws-appsync')
const gql = require('graphql-tag')
const config = require('./config').default

require('cross-fetch/polyfill')

const {
	region,
	accessKeyId,
	secretAccessKey,
	sessionToken,
	graphQlEndpoint: url,
} = config

const graphqlClient = new appsync.AWSAppSyncClient({
	url,
	region,
	auth: {
		type: 'AWS_IAM',
		credentials: {
			accessKeyId,
			secretAccessKey,
			sessionToken,
		},
	},
	disableOffline: true,
})

const addDeploymentMutation = gql`
	mutation AddDeployment($thingId: String!) {
		addDeployment(thingId: $thingId) {
			thingId
			deploymentId
			type
			spec
			greengrassGroup
			createdAt
			updatedAt
		}
	}
`

async function getIoTData () {
	const iot = new AWS.Iot()
	const endpoint = await iot
		.describeEndpoint({
			endpointType: 'iot:Data-ATS',
		})
		.promise()
	console.log('endpoint')
	console.log(endpoint)

	return new AWS.IotData({ endpoint: endpoint.endpointAddress })
}

function computeMessage (namespace) {
	return {
		command: {
			type: 'system',
			payload: {
				namespace,
			},
		},
	}
}

exports.deploy = async function (thingId) {
	try {
		console.log(`deploying bp for the following thing ${thingId}`)

		const result = await graphqlClient.mutate({
			mutation: addDeploymentMutation,
			variables: {
				thingId,
			},
		})

		console.log('deploy result:', result)

		return result.data
	} catch (err) {
		console.log('Error during deployment')
		console.log(err)
	}

	return null
}

exports.publishNamespace = async function (thingName, namespace) {
	const iotData = await getIoTData()

	return iotData
		.publish({
			topic: `${thingName}/command`,
			payload: JSON.stringify(computeMessage(namespace)),
			qos: 1,
		})
		.promise()
}
