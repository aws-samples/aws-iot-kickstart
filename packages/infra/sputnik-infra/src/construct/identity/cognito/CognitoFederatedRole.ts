/* eslint-disable no-template-curly-in-string */
import { CfnIdentityPool } from '@aws-cdk/aws-cognito'
import { Effect, FederatedPrincipal, PolicyDocument, PolicyStatement, Role, RoleProps } from '@aws-cdk/aws-iam'
import { Construct, Fn } from '@aws-cdk/core'

export enum CognitoFederatedRoleMappingKey {
	AUTHENTICATED = 'authenticated',
	UNAUTHENTICATED = 'unauthenticated',
}

export interface CognitoFederatedRoleProps extends Omit<RoleProps, 'assumedBy'> {	/**
	* IdentityPool to define the `aud` claim property.
	* @see https://docs.aws.amazon.com/cognito/latest/developerguide/role-based-access-control.html#creating-roles-for-role-mapping
	*/
	readonly identityPool: CfnIdentityPool
	/**
	* Role mapping key used to define the `amr` claim property.
	* @see https://docs.aws.amazon.com/cognito/latest/developerguide/role-based-access-control.html#creating-roles-for-role-mapping
	*/
	readonly roleMappingKey: string
}

export class CognitoFederatedRole extends Role {
	readonly roleMappingKey: string

	readonly identityPool: CfnIdentityPool

	constructor (scope: Construct, id: string, { identityPool, roleMappingKey, inlinePolicies, ...props }: CognitoFederatedRoleProps) {
		super(scope, id, {
			...props,
			assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
				StringEquals: {
					'cognito-identity.amazonaws.com:aud': identityPool.ref,
				},
				'ForAnyValue:StringLike': {
					'cognito-identity.amazonaws.com:amr': roleMappingKey,
				},
			}, 'sts:AssumeRoleWithWebIdentity'),
			inlinePolicies: {
				CognitoIdentityAndAnalyticsPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: [
								// TODO: [SECURITY] should this be restricted for unauth?
								'cognito-identity:*',
							],
							resources: [Fn.sub('arn:aws:cognito-identity:${AWS::Region}:${AWS::AccountId}:identitypool/${identityPool}', { identityPool: identityPool.ref })],
						}),
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: [
								'mobileanalytics:PutEvents',
							],
							resources: ['*'],
						}),
					],
				}),
				...inlinePolicies || {},
			},
		})

		this.identityPool = identityPool
		this.roleMappingKey = roleMappingKey
	}
}
