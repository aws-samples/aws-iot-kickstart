/* eslint-disable no-template-curly-in-string */
import * as path from 'path'
import { IRole } from '@aws-cdk/aws-iam'
import { IBucket } from '@aws-cdk/aws-s3'
import { ITable } from '@aws-cdk/aws-dynamodb'
import { CfnPolicy as IotCfnPolicy } from '@aws-cdk/aws-iot'
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda'
import { Construct } from '@aws-cdk/core'
import { DEFAULT_NAMESPACE } from '@deathstar/sputnik-core'
import { ExtendableGraphQLApi } from '@deathstar/sputnik-infra-core/lib/construct/api/graphql/ExtendableGraphQLApi'
import {
	MappingTemplate,
	DynamoDbDataSource,
	LambdaDataSource,
} from '@aws-cdk/aws-appsync'
import { DeploymentsServiceLambda } from '@deathstar/sputnik-infra-lambda-code/dist'

function getMappingTemplate (filename: string): MappingTemplate {
	return MappingTemplate.fromFile(path.join(__dirname, 'mapping-templates', filename))
}

export interface DeploymentServiceProps {
	readonly graphQLApi: ExtendableGraphQLApi
	readonly dataBucket: IBucket
	readonly deploymentTable: ITable
	readonly deviceBlueprintTable: ITable
	readonly deviceTypeTable: ITable
	readonly deviceTable: ITable
	readonly settingTable: ITable
	readonly greengrassGroupsRole: IRole
	readonly iotPolicyForGreengrassCores: IotCfnPolicy
	readonly iotEndpointAddress: string
}

export class DeploymentService extends Construct {
	readonly lambdaFunction: LambdaFunction;

	readonly deploymentTableDataSource: DynamoDbDataSource;

	readonly deploymentLambdaDataSource: LambdaDataSource;

	constructor (scope: Construct, id: string, props: DeploymentServiceProps) {
		super(scope, id)

		const {
			graphQLApi,
			dataBucket,
			deviceTable,
			deviceTypeTable,
			settingTable,
			deploymentTable,
			deviceBlueprintTable,
			greengrassGroupsRole,
			iotPolicyForGreengrassCores,
			iotEndpointAddress,
		} = props

		/***********************************************************************
		 *** LAMBDA
		 ***********************************************************************/

		// Create function in graphQLApi scope to prevent circular dep
		this.lambdaFunction = new DeploymentsServiceLambda(graphQLApi.node.scope as Construct, 'DeploymentsServiceLambda', {
			dependencies: {
				dataBucket,
				deviceTable,
				deviceTypeTable,
				deviceBlueprintTable,
				deploymentTable,
				settingTable,
				greengrassGroupsRole,
				iotPolicyForGreengrassCores,
				iotEndpointAddress,
			},
		})

		/***********************************************************************
		 *** PERMISSIONS
		 ***********************************************************************/

		// Grant dynamodb table access
		graphQLApi.grantDynamoDbReadWrite(deploymentTable)
		graphQLApi.grantDynamoDbReadWrite(deviceBlueprintTable)
		graphQLApi.grantDynamoDbReadWrite(deviceTypeTable)
		graphQLApi.grantDynamoDbReadWrite(deviceTable)
		graphQLApi.grantDynamoDbReadWrite(settingTable)
		// Grand lambda invoke access
		graphQLApi.grantLambdaInvoke(this.lambdaFunction)

		/***********************************************************************
		 *** DATA SOURCE
		 ***********************************************************************/

		this.deploymentTableDataSource = graphQLApi.addDynamoDbDataSource(
			'Deployment',
			'Deployment table data source',
			deploymentTable,
		)

		this.deploymentLambdaDataSource = graphQLApi.addLambdaDataSource(
			'DeploymentServiceLambda',
			'Deployment service lambda data source',
			this.lambdaFunction,
		)

		/***********************************************************************
		 *** QUERIES
		 ***********************************************************************/
		this.deploymentTableDataSource.createResolver({
			typeName: 'Query',
			fieldName: 'listDeployments',
			requestMappingTemplate: getMappingTemplate('Query.listDeployments.request.vtl'),
			responseMappingTemplate: getMappingTemplate('Query.listDeployments.response.vtl'),
		})

		/***********************************************************************
		 *** MUTATIONS
		 ***********************************************************************/
		this.deploymentLambdaDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'addDeployment',
			requestMappingTemplate: getMappingTemplate('Mutation.addDeployment.request.vtl'),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})
		this.deploymentLambdaDataSource.createResolver({
			typeName: 'Mutation',
			fieldName: 'addBatchDeployment',
			requestMappingTemplate: getMappingTemplate('Mutation.addBatchDeployment.request.vtl'),
			responseMappingTemplate: MappingTemplate.lambdaResult(),
		})

		// /***********************************************************************
		//	*** FIELD
		//	***********************************************************************/
	}
}
