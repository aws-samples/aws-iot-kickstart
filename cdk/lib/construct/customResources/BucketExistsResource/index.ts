import * as iam from '@aws-cdk/aws-iam'
import * as lambda from '@aws-cdk/aws-lambda'
import * as cdk from '@aws-cdk/core'
import * as cr from '@aws-cdk/custom-resources'
import * as fs from 'fs'
import * as path from 'path'

export interface BucketExistsResourceProps {
	bucketName: string
}

export class BucketExistsResource extends cdk.Construct {
	public readonly response: string

	constructor (
		scope: cdk.Construct,
		id: string,
		props: BucketExistsResourceProps,
	) {
		super(scope, id)

		const lambdaProvider = new lambda.SingletonFunction(this, 'BucketExistsResourceLambda', {
			uuid: 'f7d4f730-4ee1-11e8-9c2d-fa7ae01bbebc',
			code: new lambda.InlineCode(
				fs.readFileSync(path.join(__dirname, '/lambda/index.js'), {
					encoding: 'utf-8',
				}),
			),
			handler: 'index.handler',
			timeout: cdk.Duration.seconds(120),
			runtime: lambda.Runtime.NODEJS_12_X,
			initialPolicy: [
				new iam.PolicyStatement({
					actions: ['s3:Get*', 's3:List*'],
					resources: ['*'],
					effect: iam.Effect.ALLOW,
				}),
			],
		})

		const provider = new cr.Provider(this, 'BucketExistsResourcelambdaProvider', {
			onEventHandler: lambdaProvider,
		})
		const resource = new cdk.CustomResource(this, 'BucketExistsResource', {
			resourceType: 'Custom::BucketExists',
			serviceToken: provider.serviceToken,
			properties: props,
		})

		this.response = resource.getAtt('Response').toString()
	}
}
