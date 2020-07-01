import { Effect, ManagedPolicy, PolicyStatement } from '@aws-cdk/aws-iam'
import { Bucket, HttpMethods } from '@aws-cdk/aws-s3'
import { NestedStack, NestedStackProps, RemovalPolicy, Stack } from '@aws-cdk/core'
import { namespaced, namespacedBucket } from '../../../../utils/cdk-identity-utils'

export interface DataBucketPersistentStackProps extends NestedStackProps {
}

export class DataBucketPersistentStack extends NestedStack {
	readonly dataBucket: Bucket
	readonly dataBucketAccessPolicy: ManagedPolicy

	get dataBucketArn (): string {
		return this.dataBucket.bucketArn
	}

	get dataBucketAccessPolicyArn (): string {
		return this.dataBucketAccessPolicy.managedPolicyArn
	}

	constructor (scope: Stack, id: string, props?: DataBucketPersistentStackProps) {
		super(scope, id, props)

		this.dataBucket = new Bucket(this, 'Bucket', {
			bucketName: namespacedBucket(this, 'data-bucket'),
			cors: [
				{
					allowedOrigins: ['*'],
					allowedMethods: [HttpMethods.HEAD, HttpMethods.GET],
					allowedHeaders: ['*'],
				},
			],
			removalPolicy: RemovalPolicy.RETAIN,
		})

		this.dataBucketAccessPolicy = new ManagedPolicy(this, 'AccessPolicy', {
			description: 'Sputnik policy to access the Data Bucket',
			statements: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						's3:ListBucket',
						's3:GetObject',
						's3:ListObjects',
					],
					resources: [
						this.dataBucket.bucketArn,
						this.dataBucket.arnForObjects('*'),
					],
				}),
			],
		})
	}
}
