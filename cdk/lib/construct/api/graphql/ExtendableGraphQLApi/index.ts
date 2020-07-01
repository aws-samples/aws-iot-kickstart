import * as fs from 'fs'
import * as path from 'path'
import { FieldLogLevel, GraphQLApi, GraphQLApiProps, UserPoolDefaultAction, CfnGraphQLApi } from '@aws-cdk/aws-appsync'
import { IUserPool } from '@aws-cdk/aws-cognito'
import { Table } from '@aws-cdk/aws-dynamodb'
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { Function } from '@aws-cdk/aws-lambda'
import { Construct } from '@aws-cdk/core'
import { DynamoDB as DynamoDBActions, Lambda as LambdaActions } from 'cdk-iam-actions/lib/actions'
import { printSchema } from './print-schema'
import { ServicePrincipals } from 'cdk-constants'
import { ITypedef } from 'graphql-tools'
import { RootSchemaConfig } from './root-schema-config'
import { namespaced } from '../../../../utils/cdk-identity-utils'

const SCHEMA_OUT_DIR = path.join(process.cwd(), process.env.CDK_OUTDIR as string)

export interface ExtendableGraphQLApiProps extends GraphQLApiProps {
	readonly userPool?: IUserPool
	readonly schemaConfig?: RootSchemaConfig
}

/**
 * ExtendableGraphQLApi extends GraphQLApi to enable merging additional schema
 * definitions in post construction. This provides ability for separation of
 */
export class ExtendableGraphQLApi extends GraphQLApi {
	private readonly _typeDefs: ITypedef[] = []

	readonly apiRole: Role
	readonly schemaConfig?: RootSchemaConfig

	private _lambdaPolicy: ManagedPolicy
	private _dynamoDbPolicy: ManagedPolicy

	get apiRoleName (): string {
		return this.apiRole.roleName
	}

	get apiRoleArn (): string {
		return this.apiRole.roleArn
	}

	private static defaultProps ({ userPool, logConfig, authorizationConfig, ...props }: ExtendableGraphQLApiProps): GraphQLApiProps {
		return {
			...props,
			logConfig: logConfig || {
				fieldLogLevel: FieldLogLevel.ALL,
			},
			authorizationConfig: authorizationConfig || {
				defaultAuthorization: {
					userPool,
					defaultAction: UserPoolDefaultAction.ALLOW,
				},
				// TODO: Add this in once suppored
				// https://github.com/aws/aws-cdk/blob/fa8c13c753c0a6e195eed313d59ce74f1505cf6e/packages/%40aws-cdk/aws-appsync/lib/graphqlapi.ts#L302
				// additionalAuthorizationModes: [
				// 	{
				// 		authenticationType: 'AWS_IAM',
				// 	},
				// ],
			},
		}
	}

	constructor (scope: Construct, id: string, props: ExtendableGraphQLApiProps) {
		super(scope, id, ExtendableGraphQLApi.defaultProps(props))

		if (this.schema.definition) {
			this._typeDefs = [this.schema.definition]
		}

		this.apiRole = new Role(this, 'ApiRole', {
			roleName: namespaced(this, `${id}-ApiRole`),
			assumedBy: new ServicePrincipal(ServicePrincipals.APP_SYNC),
		})

		this.schemaConfig = props.schemaConfig

		// GraphQLApi only support adding via construct userpool and apikey AuthModes
		// https://github.com/aws/aws-cdk/blob/fa8c13c753c0a6e195eed313d59ce74f1505cf6e/packages/%40aws-cdk/aws-appsync/lib/graphqlapi.ts#L302
		const cfnGraphQLApi = this.node.defaultChild as CfnGraphQLApi
		const providers = cfnGraphQLApi.additionalAuthenticationProviders as CfnGraphQLApi.AdditionalAuthenticationProviderProperty[]

		if (!providers.find((q): boolean => q.authenticationType === 'AWS_IAM')) {
			providers.push({ authenticationType: 'AWS_IAM' })
		}
	}

	onPrepare (): void {
		this.schema.definition = printSchema(this.schemaConfig, ...this._typeDefs)

		fs.writeFileSync(path.join(SCHEMA_OUT_DIR, `schema.${this.node.uniqueId}.graphql`), this.schema.definition)

		super.onPrepare()
	}

	extendSchema (schema: string): void {
		this._typeDefs.push(schema)
	}

	extendSchemaFile (schemaFile: string): void {
		const schema = fs.readFileSync(schemaFile, { encoding: 'utf-8' })

		this.extendSchema(schema)
	}

	grantLambdaInvoke (...lambdaFunctions: Function[]): void {
		const statement = new PolicyStatement({
			effect: Effect.ALLOW,
			// TODO: make this configurable
			actions: [LambdaActions.INVOKE_FUNCTION, LambdaActions.INVOKE_ASYNC],
			resources: lambdaFunctions.map((lambda): string => lambda.functionArn),
		})

		if (this._lambdaPolicy == null) {
			this._lambdaPolicy = new ManagedPolicy(this, 'LambdaPolicy', {
				description: `Policy for ${this.name} AppSync API to access lambda`,
				roles: [this.apiRole],
				statements: [statement],
			})
		} else {
			this._lambdaPolicy.addStatements(statement)
		}
	}

	private _addDynamoDbPolicyStatement (...statements: PolicyStatement[]): void {
		if (this._dynamoDbPolicy == null) {
			this._dynamoDbPolicy = new ManagedPolicy(this, 'DynamoDbPolicy', {
				description: `Policy for ${this.name} AppSync API to access DynamoDB`,
				roles: [this.apiRole],
				statements,
			})
		} else {
			this._dynamoDbPolicy.addStatements(...statements)
		}
	}

	grantDynamoDbRead (...tables: Table[]): void {
		const statement = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: [
				DynamoDBActions.BATCH_GET_ITEM,
				DynamoDBActions.BATCH_WRITE_ITEM,
				DynamoDBActions.GET_ITEM,
				DynamoDBActions.QUERY,
				DynamoDBActions.SCAN,
			],
			resources: tables.map((table): string => table.tableArn),
		})

		this._addDynamoDbPolicyStatement(statement)
	}

	grantDynamoDbReadWrite (...tables: Table[]): void {
		const statement = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: [
				// TODO: make this configurable
				DynamoDBActions.BATCH_GET_ITEM,
				DynamoDBActions.BATCH_WRITE_ITEM,
				DynamoDBActions.DELETE_ITEM,
				DynamoDBActions.GET_ITEM,
				DynamoDBActions.PUT_ITEM,
				DynamoDBActions.QUERY,
				DynamoDBActions.SCAN,
				DynamoDBActions.UPDATE_ITEM,
			],
			resources: tables.map((table): string => table.tableArn),
		})

		this._addDynamoDbPolicyStatement(statement)
	}
}
