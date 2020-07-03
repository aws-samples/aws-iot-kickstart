import * as s3 from '@aws-cdk/aws-s3'
import * as cdk from '@aws-cdk/core'
import { BucketExistsResource } from '../../../construct/customResources/BucketExistsResource'
import { getRootStack } from '../../../utils/cdk-identity-utils'

interface CreateBucketStackProps extends cdk.NestedStackProps {
  bucketAlreadyExistsResponse: string
  s3Props: s3.BucketProps
}

class BucketsNestedStack extends cdk.NestedStack {
	private static _rootStackMap: Map<cdk.Construct, BucketsNestedStack> = new Map<cdk.Construct, BucketsNestedStack>();
	public readonly nestedScope: cdk.Construct;

	constructor (
		scope: cdk.Construct,
		id: string,
		props?: cdk.NestedStackProps,
	) {
		super(scope, id, props)

		this.nestedScope = this
	}

	public static getOrCreateNestedStack (
		scope: cdk.Construct,
		id: string,
		props?: cdk.NestedStackProps
	): BucketsNestedStack {
		const rootStack = getRootStack(scope)

		if (!BucketsNestedStack._rootStackMap.get(rootStack)) {
			this._rootStackMap.set(rootStack, new BucketsNestedStack(rootStack, id, props))
		}

		return BucketsNestedStack._rootStackMap.get(rootStack) as BucketsNestedStack
	}
}

class CreateBucket {
	constructor (
		scope: cdk.Construct,
		id: string,
		props: CreateBucketStackProps,
	) {
		const nestedStackInstance = BucketsNestedStack.getOrCreateNestedStack(scope, 'BucketsNestedStack')

		const bucket = new s3.Bucket(nestedStackInstance.nestedScope, id, props.s3Props)
		const bucketNode = bucket.node
			.defaultChild as s3.CfnBucket

		bucketNode.cfnOptions.condition = new cdk.CfnCondition(
			nestedStackInstance.nestedScope,
			id + 'BucketCondition',
			{
				expression: cdk.Fn.conditionEquals(
					props.bucketAlreadyExistsResponse,
					'false',
				),
			},
		)
	}
}

export function CreateBucketIfNotExists (scope: cdk.Construct, id: string, props: s3.BucketProps): s3.IBucket {
	const s3Props = {
		...props,
		removalPolicy: cdk.RemovalPolicy.RETAIN,
	}

	if (!props.bucketName) {
		throw new Error('BucketName is a required parameter')
	}

	const bucketAlreadyExists = new BucketExistsResource(scope, [id, 'alreadyExists'].join('-'), {
		bucketName: props.bucketName,
	})

	new CreateBucket(scope, [id, 'bucket'].join('-'), {
		bucketAlreadyExistsResponse: bucketAlreadyExists.response,
		s3Props,
	})

	return s3.Bucket.fromBucketArn(scope, id + 'Instance', 'arn:aws:s3:::' + props.bucketName)
}
