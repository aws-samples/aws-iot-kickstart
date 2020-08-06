/* eslint-disable no-template-curly-in-string */
import * as firehose from '@aws-cdk/aws-kinesisfirehose'
import * as iam from '@aws-cdk/aws-iam'
import * as iot from '@aws-cdk/aws-iot'
import * as s3 from '@aws-cdk/aws-s3'
import * as sns from '@aws-cdk/aws-sns'
import * as cdk from '@aws-cdk/core'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'

export interface DataProcessingStackProps extends cdk.NestedStackProps {
	readonly snsAlertsTopic: sns.Topic
	readonly iotEventBucket: s3.IBucket
	readonly iotErrorsBucket: s3.IBucket
}

export class DataProcessingStack extends cdk.NestedStack {
	constructor (
		scope: cdk.Construct,
		id: string,
		props: DataProcessingStackProps,
	) {
		super(scope, id)

		const {
			snsAlertsTopic,
			iotEventBucket,
			iotErrorsBucket,
		} = props

		const iotToS3ErrorsRole = new iam.Role(this, 'IoTToS3ErrorsRole', {
			assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
		})
		iotToS3ErrorsRole.addToPolicy(
			new iam.PolicyStatement({
				resources: [iotErrorsBucket.bucketArn + '/*'],
				actions: ['s3:PutObject'],
				effect: iam.Effect.ALLOW,
			}),
		)

		const iotToSnsRole = new iam.Role(this, 'IoTToSNSRole', {
			assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
		})
		iotToSnsRole.addToPolicy(
			new iam.PolicyStatement({
				resources: [snsAlertsTopic.topicArn],
				actions: ['sns:Publish'],
				effect: iam.Effect.ALLOW,
			}),
		)

		const errorAction = {
			s3: {
				bucketName: iotErrorsBucket.bucketName,
				roleArn: iotToS3ErrorsRole.roleArn,
				key: 'iot-rule-errors/${topic()}/${timestamp()}.json',
			},
		}

		new iot.CfnTopicRule(this, 'IoTAlertsTopicRule', {
			ruleName: namespaced(this, 'IoTAlertsRule', { delimiter: '_' }),
			topicRulePayload: {
				ruleDisabled: false,
				sql: 'SELECT * FROM \'+/data/alert\'',
				description: 'Submit all incoming alert to SNS',
				actions: [
					{
						sns: {
							targetArn: snsAlertsTopic.topicArn,
							roleArn: iotToSnsRole.roleArn,
						},
					},
				],
				errorAction,
			},
		})

		const firehoseToS3Role = new iam.Role(this, 'FirehoseToS3Role', {
			assumedBy: new iam.ServicePrincipal('firehose.amazonaws.com'),
		})
		firehoseToS3Role.addToPolicy(
			new iam.PolicyStatement({
				resources: [iotEventBucket.bucketArn + '/*'],
				actions: [
					's3:AbortMultipartUpload',
					's3:GetBucketLocation',
					's3:GetObject',
					's3:ListBucket',
					's3:ListBucketMultipartUploads',
					's3:PutObject',
				],
				effect: iam.Effect.ALLOW,
			}),
		)

		const deliveryStream = new firehose.CfnDeliveryStream(this, 'IoTEventsDeliveryStream', {
			deliveryStreamType: 'DirectPut',
			deliveryStreamName: namespaced(this, 'IoTEventsDeliveryStream'),
			s3DestinationConfiguration: {
				bucketArn: iotEventBucket.bucketArn,
				bufferingHints: {
					intervalInSeconds: 900,
					sizeInMBs: 128,
				},
				compressionFormat: 'GZIP',
				prefix: 'firehose/',
				errorOutputPrefix: 'firehose-errors/',
				roleArn: firehoseToS3Role.roleArn,
			},
		})

		const iotToFirehose = new iam.Role(this, 'IoTToFirehose', {
			assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
		})
		iotToFirehose.addToPolicy(
			new iam.PolicyStatement({
				resources: [deliveryStream.attrArn],
				actions: ['firehose:PutRecord'],
				effect: iam.Effect.ALLOW,
			}),
		)

		new iot.CfnTopicRule(this, 'IoTDataTopicRule', {
			ruleName: namespaced(this, 'IoTDataRule', { delimiter: '_' }),
			topicRulePayload: {
				ruleDisabled: false,
				sql: 'SELECT * FROM \'+/data/#\'',
				description: 'Send all incoming data to Kinesis Firehose',
				actions: [
					{
						firehose: {
							deliveryStreamName: deliveryStream.deliveryStreamName as string,
							separator: '\n',
							roleArn: iotToFirehose.roleArn,
						},
					},
				],
				errorAction,
			},
		})
	}
}
