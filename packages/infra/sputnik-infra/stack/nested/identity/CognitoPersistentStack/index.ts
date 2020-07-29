/* eslint-disable no-template-curly-in-string */
import { CfnUserPoolClient, CfnUserPoolGroup, CfnUserPoolUser, CfnUserPoolUserToGroupAttachment, UserPool, UserPoolClient, UserPoolOperation } from '@aws-cdk/aws-cognito'
import { Construct, Fn, NestedStack, NestedStackProps, RemovalPolicy, Duration } from '@aws-cdk/core'
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda'
import { readFileSync } from 'fs'
import { join } from 'path'
import { CfnPolicy as CfnIoTPolicy } from '@aws-cdk/aws-iot'
import { CognitoPreTokenGenerationLambda } from '@deathstar/sputnik-infra-lambda-code/dist'
import { retainResource } from '../../../../utils/resource-utils'
import { namespaced, uniqueIdHash } from '../../../../utils/cdk-identity-utils'
import { PolicyStatement, Effect, PolicyDocument } from '@aws-cdk/aws-iam'
import { CognitoIDP as CognitoIDPActions } from 'cdk-iam-actions/lib/actions'
import { DEFAULT_NAMESPACE } from '../../device/management/constants'
import { CLAIM_PREFIX, INTERNAL_GROUPS, INTERNAL_TENANT } from '../constants'
import { UserGroups } from './UserGroups'

export interface CognitoPersistentStackProps extends NestedStackProps {
	readonly administratorName: string
	readonly administratorEmail: string
	readonly websiteURL: string
	readonly appFullName: string
	readonly userPool?: UserPool
}

export class CognitoPersistentStack extends NestedStack {
	readonly userPool: UserPool

	readonly adminCognitoGroup: CfnUserPoolGroup

	readonly memberCognitoGroup: CfnUserPoolGroup

	readonly adminCognitoUser: CfnUserPoolUser

	readonly adminGroupAssignment: CfnUserPoolUserToGroupAttachment

	readonly websiteClient: UserPoolClient

	readonly websiteCognitoIoTPolicy: CfnIoTPolicy

	get userPoolArn (): string {
		return this.userPool.userPoolArn
	}

	get userPoolId (): string {
		return this.userPool.userPoolId
	}

	get websiteClientId (): string {
		return this.websiteClient.userPoolClientId
	}

	constructor (scope: Construct, id: string, props: CognitoPersistentStackProps) {
		super(scope, id, props)

		const { administratorEmail, administratorName, websiteURL, appFullName } = props

		const userPool = props.userPool || new UserPool(this, 'UserPool', {
			userPoolName: namespaced(this, 'UserPool'),
			selfSignUpEnabled: false,
			userInvitation: {
				emailSubject: `Your ${appFullName} login`,
				smsMessage: 'Your username is {username} and temporary password is {####}.',
				emailBody: Fn.sub(readFileSync(join(__dirname, './user-invitation-body.html')).toString(), { websiteURL, administratorEmail }),
			},
			autoVerify: { email: true },
			signInAliases: { email: true },
			userVerification: {
				emailSubject: 'Your sputnik dashboard verification code',
				emailBody: 'Your sputnik dashboard verification code is {####}.',
			},
			passwordPolicy: {
				minLength: 8,
				requireDigits: true,
				requireLowercase: true,
				requireSymbols: false,
				requireUppercase: true,
			},
			standardAttributes: {
				email: { mutable: false, required: true },
				nickname: { mutable: true, required: true },
				// TODO: add phoneNumber, address, etc... must also update the UI and client
				// phoneNumber: { mutable: true, required: false },
			},
		})
		retainResource(userPool)
		userPool.addTrigger(UserPoolOperation.PRE_TOKEN_GENERATION, new CognitoPreTokenGenerationLambda(this, 'PreTokenGenerationTriggerLambda', {
			initialPolicy: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						CognitoIDPActions.ADMIN_GET_USER,
						CognitoIDPActions.ADMIN_LIST_GROUPS_FOR_USER,
					],
					resources: [
						// TODO: [SECURITY] scope this permission
						'*',
					],
				}),
			],
			environment: {
				CLAIM_PREFIX,
				INTERNAL_TENANT,
				INTERNAL_NAMESPACE: DEFAULT_NAMESPACE,
				INTERNAL_GROUPS: INTERNAL_GROUPS.join(','),
			},
		}))

		const adminCognitoGroup = new CfnUserPoolGroup(this, 'AdminCognitoGroup', {
			userPoolId: userPool.userPoolId,
			description: 'Administrator group for managing sputnik web interface',
			groupName: UserGroups.ADMINISTRATORS,
			precedence: 1,
		})
		adminCognitoGroup.applyRemovalPolicy(RemovalPolicy.RETAIN)

		const memberCognitoGroup = new CfnUserPoolGroup(this, 'MemberCognitoGroup', {
			userPoolId: userPool.userPoolId,
			description: 'Member group for managing sputnik web interface',
			groupName: UserGroups.MEMBERS,
			precedence: 2,
		})
		memberCognitoGroup.applyRemovalPolicy(RemovalPolicy.RETAIN)

		const adminCognitoUser = new CfnUserPoolUser(this, 'AdminCognitoUser', {
			userPoolId: userPool.userPoolId,
			desiredDeliveryMediums: ['EMAIL'],
			forceAliasCreation: true,
			userAttributes: [
				{ name: 'nickname', value: administratorName },
				{ name: 'email', value: administratorEmail },
			],
			username: administratorEmail,
		})
		adminCognitoUser.applyRemovalPolicy(RemovalPolicy.RETAIN)

		const adminGroupAssignment = new CfnUserPoolUserToGroupAttachment(this, 'AdminGroupAssignment', {
			userPoolId: userPool.userPoolId,
			groupName: adminCognitoGroup.ref,
			username: adminCognitoUser.ref,
		})

		const websiteClient = new UserPoolClient(this, 'UserPoolClient', {
			userPool: userPool,
			userPoolClientName: namespaced(this, 'WebsiteClient'),
			generateSecret: false,
		})
		retainResource(websiteClient)

		// TODO: Configure cognito attributes
		const cfnWebsiteCognitoClient = websiteClient.node.defaultChild as CfnUserPoolClient
		cfnWebsiteCognitoClient.addPropertyOverride('ExplicitAuthFlows', undefined)
		cfnWebsiteCognitoClient.addPropertyOverride('WriteAttributes', ['email', 'nickname'])
		cfnWebsiteCognitoClient.addPropertyOverride('ReadAttributes', ['name', 'family_name', 'given_name', 'middle_name', 'nickname', 'preferred_username', 'address', 'email', 'updated_at', 'phone_number', 'email_verified', 'phone_number_verified'])
		cfnWebsiteCognitoClient.addPropertyOverride('RefreshTokenValidity', 1)

		// TODO: [SECURITY] Lock this down to tenant/namespace
		const websiteCognitoIoTPolicy = new CfnIoTPolicy(this, 'WebsiteCognitoIoTPolicy', {
			policyName: `WebsiteCognitoIoTPolicy-${uniqueIdHash(this)}`,
			policyDocument: PolicyDocument.fromJson({
				Statement: [{ Effect: 'Allow', Action: ['iot:*'], Resource: ['*'] }],
			}),
		})
		websiteCognitoIoTPolicy.applyRemovalPolicy(RemovalPolicy.RETAIN)

		// Assign all local props to instance
		Object.assign(this, {
			userPool,
			websiteClient,
			adminCognitoGroup,
			memberCognitoGroup,
			adminCognitoUser,
			adminGroupAssignment,
			websiteCognitoIoTPolicy,
		})
	}
}
