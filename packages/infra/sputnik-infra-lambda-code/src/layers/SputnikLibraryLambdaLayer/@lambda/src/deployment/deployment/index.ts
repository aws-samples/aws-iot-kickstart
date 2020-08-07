import { DynamoDB } from 'aws-sdk'
import { SpecDefinition } from '@deathstar/sputnik-core-api'

const documentClient = new DynamoDB.DocumentClient()

export interface DeploymentItem {
	readonly thingId: string
	readonly deploymentId: string
	readonly spec: SpecDefinition
	readonly type: string
	readonly greengrassGroup?: {
		Id: string
		VersionId: string
	}
	readonly createdAt: string
	readonly updatedAt: string
}

export async function saveDeployment (table: string, deployment: DeploymentItem) {
	console.debug('[saveDeployment]', table, deployment)
	return documentClient.put({
		TableName: table,
		Item: deployment,
	}).promise()
}

export async function updateDeviceDeployment (table: string, thingId: string, deployment: DeploymentItem) {
	console.debug('[updateDeviceDeployment]', table, thingId, deployment)
	return documentClient.update({
			TableName: table,
			Key: {
				thingId,
			},
			UpdateExpression: 'set #ua = :ua, #l = :l',
			ExpressionAttributeNames: {
				'#ua': 'updatedAt',
				'#l': 'lastDeploymentId',
			},
			ExpressionAttributeValues: {
				':ua': deployment.updatedAt,
				':l': deployment.deploymentId,
			},
		}).promise()
}
