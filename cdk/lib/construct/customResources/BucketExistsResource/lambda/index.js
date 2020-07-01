const { S3 } = require('aws-sdk')

const handler = async function (event, context) {
	console.log('Received Event: ', event)

	const s3Client = new S3()
	const options = {
		Bucket: event.ResourceProperties.bucketName,
	}

	try {
		await s3Client.headBucket(options).promise()
		console.log('bucket exists')

		return {
			Data: { Response: 'true' },
		}
	} catch (error) {
		if (error.statusCode === 404) {
			console.log('bucket does not exists')

			return {
				Data: { Response: 'false' },
			}
		}

		throw error
	}
}

exports.handler = handler
