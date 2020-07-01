/* eslint-disable no-template-curly-in-string */
import * as s3 from '@aws-cdk/aws-s3'
import * as sns from '@aws-cdk/aws-sns'
import * as snsSub from '@aws-cdk/aws-sns-subscriptions'
import * as cdk from '@aws-cdk/core'
import { CreateBucketIfNotExists } from '../../../../extensions/s3/CreateBucketIfNotExists'
import { namespaced, namespacedBucket } from '../../../../utils/cdk-identity-utils'

export interface DataProcessingPersistentStackProps extends cdk.NestedStackProps {
	readonly administratorName: string
	readonly administratorEmail: string
}

export class DataProcessingPersistentStack extends cdk.NestedStack {
	readonly snsAlertsTopic: sns.Topic
	readonly iotEventBucket: s3.IBucket
	readonly iotErrorsBucket: s3.IBucket

	constructor (
		scope: cdk.Construct,
		id: string,
		props: DataProcessingPersistentStackProps,
	) {
		super(scope, id)

		const { administratorEmail } = props

		const snsAlertsTopic = new sns.Topic(
			this,
			'SnsAlertTopic',
			{
				displayName: 'IoT Alerts Topic',
				topicName: namespaced(this, 'IoTAlertsTopic'),
			},
		)

		snsAlertsTopic.addSubscription(
			new snsSub.EmailSubscription(administratorEmail),
		)

		const iotEventBucket = CreateBucketIfNotExists(
			this,
			'IoTEventBucket',
			{
				bucketName: namespacedBucket(this, 'iot-events'),
				removalPolicy: cdk.RemovalPolicy.RETAIN,
			},
		)

		const iotErrorsBucket = CreateBucketIfNotExists(
			this,
			'IoTErrorsBucket',
			{
				bucketName: namespacedBucket(this, 'iot-rule-errors'),
				removalPolicy: cdk.RemovalPolicy.RETAIN,
			},
		)

		Object.assign(this, {
			snsAlertsTopic,
			iotEventBucket,
			iotErrorsBucket,
		})
	}
}
