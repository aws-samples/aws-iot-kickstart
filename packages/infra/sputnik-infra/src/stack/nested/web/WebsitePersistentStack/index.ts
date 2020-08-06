import * as path from 'path'
import { CloudFrontAllowedCachedMethods, CloudFrontAllowedMethods, CloudFrontWebDistribution, HttpVersion, OriginAccessIdentity, PriceClass, ViewerProtocolPolicy } from '@aws-cdk/aws-cloudfront'
import { CanonicalUserPrincipal, Effect, PolicyStatement, Role, ManagedPolicy, ServicePrincipal, PolicyDocument } from '@aws-cdk/aws-iam'
import { Bucket } from '@aws-cdk/aws-s3'
import { Construct, Duration, Fn, NestedStack, NestedStackProps } from '@aws-cdk/core'
import { BucketDeployment, Source, ISource } from '@aws-cdk/aws-s3-deployment'
import { namespacedBucket, namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { bundleAsset } from '@deathstar/sputnik-infra-core/lib/utils/asset-utils'
import { ServicePrincipals } from 'cdk-constants'
import { KMS as KMSActions } from 'cdk-iam-actions/lib/actions'

// TODO: make configurable and move to construct/block

// const WEBSITE_SOURCE = path.resolve(__dirname, '../../../../../../ui/sputnik-ui-angular')

export interface WebsitePersistentStackProps extends NestedStackProps {
	readonly source: ISource | ISource[]
}

export class WebsitePersistentStack extends NestedStack {
	readonly websiteBucket: Bucket

	readonly webDistribution: CloudFrontWebDistribution

	readonly bucketDeployment: BucketDeployment

	get websiteURL (): string {
		return Fn.join('', ['https://', this.webDistribution.domainName])
	}

	get websiteBucketArn (): string {
		return this.websiteBucket.bucketArn
	}

	constructor (scope: Construct, id: string, props: WebsitePersistentStackProps) {
		super(scope, id, props)

		const { source } = props

		// TODO: convert this to s3-deployment to enable distro invalidation
		// https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-deployment-readme.html
		const websiteBucket = new Bucket(this, 'WebsiteBucket', {
			bucketName: namespacedBucket(this, 'website-bucket'),
			websiteIndexDocument: 'index.html',
			blockPublicAccess: {
				blockPublicAcls: true,
				blockPublicPolicy: true,
				ignorePublicAcls: true,
				restrictPublicBuckets: true,
			},
		})

		const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity', {
			comment: `CloudFront OAI for sputnik website - ${websiteBucket.bucketName}`,
		})

		const webDistribution = new CloudFrontWebDistribution(this, 'WebDistribution', {
			originConfigs: [
				{
					s3OriginSource: {
						s3BucketSource: websiteBucket,
						originAccessIdentity,
					},
					behaviors: [
						{
							isDefaultBehavior: true,
							cachedMethods: CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
							allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
							compress: true,
							forwardedValues: { queryString: false },
						},
						{
							// Do not cache appVariables.js
							pathPattern: 'assets/appVariables.js',
							cachedMethods: CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
							allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
							compress: true,
							forwardedValues: { queryString: false },
							defaultTtl: Duration.seconds(0),
							maxTtl: Duration.seconds(0),
						},
					],
				},
			],
			defaultRootObject: 'index.html',

			viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
			httpVersion: HttpVersion.HTTP2,
			priceClass: PriceClass.PRICE_CLASS_ALL,
		})

		websiteBucket.addToResourcePolicy(new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['s3:GetObject'],
			resources: [websiteBucket.bucketArn, websiteBucket.arnForObjects('*')],
			principals: [new CanonicalUserPrincipal(originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
		}))

		// bundleAsset(WEBSITE_SOURCE, 'yarn install --production && yarn run build', { output: 'dist' })
		const bucketDeployment = new BucketDeployment(this, 'WebsiteBucketDeployment', {
			// sources: [Source.asset(path.join(WEBSITE_SOURCE, 'dist'))],
			sources: Array.isArray(source) ? source : [source],
			destinationBucket: websiteBucket,
			// Invalidate cloudfront cache on deploy
			// https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-deployment-readme.html#cloudfront-invalidation
			distribution: webDistribution,
			distributionPaths: ['/*'],
			retainOnDelete: true,
			prune: false,
			// TODO: remove once https://github.com/aws/aws-cdk/issues/8541 is resolved
			role: new Role(this, 'WebsiteBucketDeployment-Role', {
				assumedBy: new ServicePrincipal(ServicePrincipals.LAMBDA),
				inlinePolicies: {
					kms: new PolicyDocument({
						statements: [
							new PolicyStatement({
								effect: Effect.ALLOW,
								actions: [
									KMSActions.DECRYPT,
								],
								resources: ['*'],
							}),
						],
					}),
				},
			}),
		})

		Object.assign(this, {
			webDistribution,
			websiteBucket,
			bucketDeployment,
		})
	}
}
