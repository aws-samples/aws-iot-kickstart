import * as fs from 'fs'
import * as path from 'path'
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment'
import { AutoDeleteBucket } from '@mobileposse/auto-delete-bucket'
import { Construct, CustomResource, NestedStack, NestedStackProps, RemovalPolicy, Duration } from '@aws-cdk/core'
import { namespaced } from '../../../../utils/cdk-identity-utils'
import { PersistentStack } from '../../../root/PersistentStack'
import { Role, ServicePrincipal, PolicyDocument, PolicyStatement, Effect, Policy } from '@aws-cdk/aws-iam'
import { ServicePrincipals } from 'cdk-constants'
import * as actions from 'cdk-iam-actions/lib/actions'
import { Function as LambdaFunction, Runtime, AssetCode, Version as LambdaVersion, Alias as LambdaAlias, IFunction, Code } from '@aws-cdk/aws-lambda'
import { bundleAsset } from '../../../../utils/asset-utils'

const ROOT_DIR = path.resolve(__dirname, '../../../../../../')
const DEFAULTS_DIR = path.join(ROOT_DIR, 'examples/defaults')
const CDK_OUTDIR = path.resolve(ROOT_DIR, 'cdk', process.env.CDK_OUTDIR as string)

export interface DefaultsStackProps extends NestedStackProps {
    readonly bucketName: string
	readonly persistent: PersistentStack
	readonly utilsFunction: IFunction
	readonly greengrassGroupsRole: Role
}

export class DefaultsStack extends NestedStack {
	readonly bucketName: string

	constructor (scope: Construct, id: string, props: DefaultsStackProps) {
		super(scope, id, props)

		const {
			bucketName,
			persistent,
			utilsFunction,
			greengrassGroupsRole,
		} = props

		this.bucketName = bucketName

		const defaultsBucket = new AutoDeleteBucket(this, 'DefaultsBucket', {
			bucketName: this.bucketName,
			removalPolicy: RemovalPolicy.DESTROY,
		})

		const DEFAULTS_TEMP_DIR = path.join(CDK_OUTDIR, 'defaults')

		// Copy defaults to cdk.out dir for processing
		bundleAsset(DEFAULTS_DIR, `mkdir -p ${DEFAULTS_TEMP_DIR} && rsync -av ./ ${DEFAULTS_TEMP_DIR}`)

		const bucketDeployment = new BucketDeployment(this, 'DefaultsBucketDeployment', {
			sources: [Source.asset(DEFAULTS_TEMP_DIR)],
			destinationBucket: defaultsBucket,
			// TODO: remove once https://github.com/aws/aws-cdk/issues/8541 is resolved
			role: new Role(this, 'DefaultsBucketDeployment-Role', {
				assumedBy: new ServicePrincipal(ServicePrincipals.LAMBDA),
				inlinePolicies: {
					kms: new PolicyDocument({
						statements: [
							new PolicyStatement({
								effect: Effect.ALLOW,
								actions: [
									actions.KMS.DECRYPT,
								],
								resources: ['*'],
							}),
						],
					}),
				},
			}),
		})

		/**************************************************************************
         * Device Types
        ***************************************************************************/
		const deviceTypes = new CustomResource(this, 'DeviceTypesCustomResource', {
			resourceType: 'Custom::DefaultsLoadLambda',
			serviceToken: utilsFunction.functionArn,
			properties: {
				sourceS3Bucket: defaultsBucket.bucketName,
				sourceS3Key: 'device-types',
				table: persistent.deviceManagementStack.deviceTypeTable.tableName,
				customAction: 'dynamodbPutObjectsFromS3Folder',
			},
		})
		deviceTypes.node.addDependency(bucketDeployment)

		/**************************************************************************
         * Device Blueprints
        ***************************************************************************/
		const deviceBlueprints = new CustomResource(this, 'DeviceBlueprintsCustomResource', {
			resourceType: 'Custom::DefaultsLoadLambda',
			serviceToken: utilsFunction.functionArn,
			properties: {
				sourceS3Bucket: defaultsBucket.bucketName,
				sourceS3Key: 'device-blueprints',
				table: persistent.deviceManagementStack.deviceBlueprintTable.tableName,
				customAction: 'dynamodbPutObjectsFromS3Folder',
			},
		})
		deviceBlueprints.node.addDependency(bucketDeployment)

		/**************************************************************************
         * System Blueprints
        ***************************************************************************/
		const systemBlueprints = new CustomResource(this, 'SystemBlueprintsCustomResource', {
			resourceType: 'Custom::DefaultsLoadLambda',
			serviceToken: utilsFunction.functionArn,
			properties: {
				sourceS3Bucket: defaultsBucket.bucketName,
				sourceS3Key: 'system-blueprints',
				table: persistent.deviceManagementStack.systemBlueprintTable.tableName,
				customAction: 'dynamodbPutObjectsFromS3Folder',
			},
		})
		systemBlueprints.node.addDependency(bucketDeployment)

		/**************************************************************************
         * Greengrass Lambdas
        ***************************************************************************/
		// Permissions
		new Policy(this, 'GreengrassGroupPolicy', {
			roles: [greengrassGroupsRole],
			statements: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						actions.Logs.CREATE_LOG_STREAM,
						actions.Logs.DESCRIBE_LOG_STREAMS,
						actions.Logs.PUT_LOG_EVENTS,
						actions.Logs.CREATE_LOG_GROUP,
					],
					resources: ['arn:aws:logs:*:*:log-group:/aws/greengrass/*'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						actions.S3.LIST_BUCKET,
						actions.S3.GET_OBJECT,
						actions.S3.LIST_OBJECTS,
					],
					resources: ['arn:aws:s3:::deeplens*/*', 'arn:aws:s3:::deeplens*'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						'deeplens:*',
					],
					resources: ['*'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						actions.KinesisVideo.DESCRIBE_STREAM,
						actions.KinesisVideo.CREATE_STREAM,
						actions.KinesisVideo.GET_DATA_ENDPOINT,
						actions.KinesisVideo.PUT_MEDIA,
					],
					resources: ['*'],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						actions.S3.LIST_BUCKET,
						actions.S3.GET_OBJECT,
						actions.S3.LIST_OBJECTS,
						actions.S3.PUT_OBJECT,
					],
					resources: [
						persistent.dataBucketStack.dataBucket.bucketArn,
						persistent.dataBucketStack.dataBucket.arnForObjects('*'),
					],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						actions.IoT.GET_THING_SHADOW,
						actions.Greengrass.GET_CONNECTIVITY_INFO,
						actions.Greengrass.LIST_GROUP_CERTIFICATE_AUTHORITIES,
						actions.Greengrass.GET_GROUP_CERTIFICATE_AUTHORITY,
					],
					resources: ['*'],
				}),
			],
		})

		const greengrassLambdaRole = new Role(this, 'GreengrassLambdaRole', {
			assumedBy: new ServicePrincipal(ServicePrincipals.LAMBDA),
		})

		// Create lambda for each default lambda defined in examples
		fs.readdirSync(path.join(DEFAULTS_TEMP_DIR, 'lambdas'), { withFileTypes: true })
			.filter((dirent): boolean => dirent.isDirectory())
			.forEach((dirent): void => {
				const name = path.basename(dirent.name)
				const lambda = new LambdaFunction(this, `GG-Lambda-${name}`, {
					functionName: namespaced(this, path.basename(name)),
					handler: 'lambda_function.lambda_handler',
					runtime: Runtime.PYTHON_2_7,
					timeout: Duration.seconds(3),
					memorySize: 128,
					role: greengrassLambdaRole,
					code: Code.fromAsset(path.join(DEFAULTS_TEMP_DIR, 'lambdas', name)),
				})
				const version = new LambdaVersion(this, `GG-Lambda-${name}-Version`, {
					lambda,
				})
				new LambdaAlias(this, `GG-Lambda-${name}-Alias`, {
					aliasName: 'Prod',
					version,
				})
			})

		/**************************************************************************
         * Models
        ***************************************************************************/
		// Build models
		const MODELS_DIR = path.join(DEFAULTS_TEMP_DIR, 'assets/models')
		fs.mkdirSync(MODELS_DIR, { recursive: true })
		bundleAsset(MODELS_DIR, path.join(DEFAULTS_TEMP_DIR, 'models.sh'))

		fs.readdirSync(MODELS_DIR, { withFileTypes: true })
			.filter((dirent): boolean => dirent.isFile())
			.forEach((dirent): void => {
				const name = path.basename(dirent.name)
				new BucketDeployment(this, `Model-${name}`, {
					sources: [Source.asset(MODELS_DIR)],
					destinationBucket: persistent.dataBucketStack.dataBucket,
					destinationKeyPrefix: 'Greengrass/models',
				})
			})
	}
}
