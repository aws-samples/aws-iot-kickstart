/* eslint-disable no-template-curly-in-string */
import { CfnIdentityPool, CfnIdentityPoolRoleAttachment, UserPool, UserPoolClient } from '@aws-cdk/aws-cognito'
import { Effect, PolicyDocument, PolicyStatement } from '@aws-cdk/aws-iam'
import { Bucket } from '@aws-cdk/aws-s3'
import { NestedStack, NestedStackProps, Stack } from '@aws-cdk/core'
import { CognitoFederatedRole, CognitoFederatedRoleMappingKey } from '../../../../construct/identity/cognito/CognitoFederatedRole'
import { namespaced } from '../../../../utils/cdk-identity-utils'

export interface CognitoStackProps extends NestedStackProps {
	readonly dataBucket: Bucket

	readonly userPool: UserPool

	readonly websiteClient: UserPoolClient
}

export class CognitoStack extends NestedStack {
	readonly authenticatedRole: CognitoFederatedRole
	readonly unauthenticatedRole: CognitoFederatedRole
	readonly identityPool: CfnIdentityPool
	readonly identityPoolRoleAttachment: CfnIdentityPoolRoleAttachment
	readonly websiteClient: UserPoolClient
	readonly tenantRole: CognitoFederatedRole

	readonly userPool: UserPool

	get userPoolArn (): string {
		return this.userPool.userPoolArn
	}
	get userPoolId (): string {
		return this.userPool.userPoolId
	}

	get identityPoolId (): string {
		return this.identityPool.ref
	}

	get websiteClientId (): string {
		return this.websiteClient.userPoolClientId
	}

	constructor (scope: Stack, id: string, props: CognitoStackProps) {
		super(scope, id, props)

		const { userPool, websiteClient, dataBucket } = props

		const identityPool = new CfnIdentityPool(this, 'IdentityPool', {
			identityPoolName: 'sputnik_identity_pool',
			cognitoIdentityProviders: [
				{ clientId: websiteClient.userPoolClientId, providerName: userPool.userPoolProviderName },
			],
			allowUnauthenticatedIdentities: true,
		})

		const authenticatedRole = new CognitoFederatedRole(this, 'AuthenticatedRole', {
			description: 'Role for the sputnik identity pool authorized identities.',
			identityPool,
			roleMappingKey: CognitoFederatedRoleMappingKey.AUTHENTICATED,
			inlinePolicies: {
				ResourcePolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: [
								'iot:Connect',
								'iot:Subscribe',
								'iot:Publish',
								'iot:Receive',
								'iot:DescribeEndpoint',
								'iot:AttachPolicy',
								'iot:GetThingShadow',
								'iot:UpdateThingShadow',
								'iot:DeleteThingShadow',
							],
							resources: ['*'],
						}),
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: ['s3:*'],
							resources: [
								dataBucket.bucketArn,
								dataBucket.arnForObjects('*'),
							],
						}),
					],
				}),
			},
		})

		const unauthenticatedRole = new CognitoFederatedRole(this, 'UnauthenticatedRole', {
			description: 'Role for the sputnik identity pool unauthorized identities.',
			identityPool,
			roleMappingKey: CognitoFederatedRoleMappingKey.UNAUTHENTICATED,
			inlinePolicies: {
				ResourcePolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: [
								'iot:Connect',
								'iot:Subscribe',
								'iot:Publish',
								'iot:Receive',
								'iot:DescribeEndpoint',
								'iot:AttachPolicy',
							],
							resources: ['*'],
						}),
					],
				}),
			},
		})

		const identityPoolRoleAttachment = new CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
			identityPoolId: identityPool.ref,
			roles: {
				[CognitoFederatedRoleMappingKey.AUTHENTICATED]: authenticatedRole.roleArn,
				[CognitoFederatedRoleMappingKey.UNAUTHENTICATED]: unauthenticatedRole.roleArn,
			},
		})

		// TODO: add Admin + Member specific roles, currently only using authenticated/unauthenticated

		const tenantRole = new CognitoFederatedRole(this, 'TenantRole', {
			roleName: namespaced(this, 'TenantRole'),
			identityPool,
			roleMappingKey: CognitoFederatedRoleMappingKey.AUTHENTICATED,
			description: 'Role for the sputnik identity pool tenants.',
		})

		// Assign all local props to instance
		Object.assign(this, {
			websiteClient,
			authenticatedRole,
			unauthenticatedRole,
			userPool,
			identityPool,
			identityPoolRoleAttachment,
			tenantRole,
		})
	}
}
