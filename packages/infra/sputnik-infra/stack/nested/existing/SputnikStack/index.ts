import * as path from 'path';
import { IUserPool } from '@aws-cdk/aws-cognito';
import * as iam from '@aws-cdk/aws-iam';
import * as iot from '@aws-cdk/aws-iot';
import { v1 as uuid } from 'uuid';
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda';
import {
  Construct,
  CustomResource,
  Fn,
  NestedStack,
  NestedStackProps,
} from '@aws-cdk/core';
import { ExtendableGraphQLApi } from '../../../../construct/api/graphql/ExtendableGraphQLApi';
import { uniqueIdHash, namespaced } from '../../../../utils/cdk-identity-utils';
import { IPersistent } from '../../../../stack/root/PersistentStack';
import {
  DeploymentsServiceLambda,
  SettingsServiceLambda,
  SystemsServiceLambda,
  JITOnboardingServiceLambda,
  S3HelperLambda,
  HelperUtilsLambda,
} from '@deathstar/sputnik-infra-lambda-code/dist';
import { DeviceManagementStack } from '../../device/management/DeviceManagementStack';
import { CognitoStack } from '../../identity/CognitoStack';
import { UserManagementStack } from '../../identity/UserManagementStack';
import { IncludeStack } from './IncludeStack';

function getTemplateFile(templateName: string): string {
  return path.join(__dirname, 'cf', `${templateName}.yml`);
}

export interface SputnikStackProps extends NestedStackProps {
  readonly includeCloudTrail?: boolean;

  readonly persistent: IPersistent;

  readonly graphQLApi: ExtendableGraphQLApi;
  readonly userPool: IUserPool;
  readonly cognitoStack: CognitoStack;
  readonly userManagementStack: UserManagementStack;
  readonly deviceManagementStack: DeviceManagementStack;

  // previous props
  readonly administratorName: string;
  readonly administratorEmail: string;
  readonly appShortName: string;
  readonly appFullName: string;
  readonly sendAnonymousUsageData?: boolean;
}

export class SputnikStack extends NestedStack {
  readonly greengrassServiceIAMRole: iam.Role;

  readonly greengrassGroupsIAMRole: iam.Role;

  readonly IoTPolicyForGreengrassCores: iot.CfnPolicy;

  readonly lambdaHelpersStack: IncludeStack;

  readonly lambdaServiceStack: IncludeStack;

  readonly appSyncStack: IncludeStack;

  readonly cloudTrailStack?: IncludeStack;

  readonly iotEndpoint: CustomResource;

  readonly greengrassAssociateServiceRoleToAccount: CustomResource;

  readonly websiteConfig: CustomResource;

  readonly initSettings: CustomResource;

  constructor(scope: Construct, id: string, props: SputnikStackProps) {
    super(scope, id, props);

    const {
      includeCloudTrail,
      sendAnonymousUsageData,
      graphQLApi,
      persistent,
      cognitoStack,
    } = props;

    /**************************************************************************
     * ROLES & POOLICIES
     ***************************************************************************/
    this.greengrassServiceIAMRole = new iam.Role(
      this,
      'greengrassServiceIAMRole',
      {
        assumedBy: new iam.ServicePrincipal('greengrass.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSGreengrassResourceAccessRolePolicy',
          ),
        ],
      },
    );

    this.greengrassGroupsIAMRole = new iam.Role(
      this,
      'greengrassGroupsIAMRole',
      {
        roleName: namespaced(this, `${id}-GreengrassGroupsIAMRole`),
        assumedBy: new iam.ServicePrincipal('greengrass.amazonaws.com'),
      },
    );

    this.IoTPolicyForGreengrassCores = new iot.CfnPolicy(
      this,
      'IoTPolicyForGreengrassCores',
      {
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: ['iot:*', 'greengrass:*'],
              Resource: ['*'],
            },
          ],
        },
      },
    );

    /**************************************************************************
     * RESOURCES
     ***************************************************************************/
    this.lambdaHelpersStack = new IncludeStack(
      this,
      'CFStackForLambdaHelpers',
      {
        templateFile: getTemplateFile('lambda-helpers'),
        parameters: {
          customResourceS3Helper: S3HelperLambda.codeAsset,
          HelperUtilsLambdaFunction: HelperUtilsLambda.codeAsset,
          destBucketArn: persistent.websiteStack.websiteBucketArn,
          dataBucketArn: persistent.dataBucketStack.dataBucketArn,
          settingsTable:
            persistent.deviceManagementStack.settingTable.tableName,
          devicesTable: persistent.deviceManagementStack.deviceTable.tableName,
          deviceTypesTable:
            persistent.deviceManagementStack.deviceTypeTable.tableName,
          deviceBlueprintsTable:
            persistent.deviceManagementStack.deviceBlueprintTable.tableName,
          systemsTable: persistent.deviceManagementStack.systemTable.tableName,
          systemBlueprintsTable:
            persistent.deviceManagementStack.systemBlueprintTable.tableName,
          greengrassServiceRoleArn: this.greengrassServiceIAMRole.roleArn,
        },
      },
    );
    const utilsFunction = LambdaFunction.fromFunctionArn(
      this,
      'UtilsFunction',
      this.lambdaHelpersStack.getOutput('HelperUtilsLambdaFunctionArn'),
    );
    const s3HelperFunction = LambdaFunction.fromFunctionArn(
      this,
      'S3HelperFunction',
      this.lambdaHelpersStack.getOutput('customResourceS3HelperArn'),
    );

    this.iotEndpoint = new CustomResource(this, 'iotEndpoint', {
      resourceType: 'Custom::Lambda',
      serviceToken: utilsFunction.functionArn,
      properties: {
        customAction: 'iotDescribeEndpoint',
        endpointType: 'iot:Data-ATS',
      },
    });

    this.lambdaServiceStack = new IncludeStack(
      this,
      'CFStackForLambdaServices',
      {
        templateFile: getTemplateFile('lambda-services'),
        parameters: {
          tenantRoleArn: cognitoStack.tenantRole.roleArn,
          deploymentsServiceLambdaFunction: DeploymentsServiceLambda.codeAsset,
          settingsServiceLambdaFunction: SettingsServiceLambda.codeAsset,
          systemsServiceLambdaFunction: SystemsServiceLambda.codeAsset,
          justInTimeOnBoardingServiceLambdaFunction:
            JITOnboardingServiceLambda.codeAsset,
          dataBucket: persistent.dataBucketStack.dataBucket.bucketName,
          settingsTable:
            persistent.deviceManagementStack.settingTable.tableName,
          devicesTable: persistent.deviceManagementStack.deviceTable.tableName,
          deviceTypesTable:
            persistent.deviceManagementStack.deviceTypeTable.tableName,
          deviceBlueprintsTable:
            persistent.deviceManagementStack.deviceBlueprintTable.tableName,
          deploymentsTable:
            persistent.deviceManagementStack.deploymentTable.tableName,
          systemsTable: persistent.deviceManagementStack.systemTable.tableName,
          systemBlueprintsTable:
            persistent.deviceManagementStack.systemBlueprintTable.tableName,
          greengrassGroupsIAMRoleArn: this.greengrassGroupsIAMRole.roleArn,
          iotPolicyForGreengrassCores: this.IoTPolicyForGreengrassCores.ref,
          iotEndpoint: this.iotEndpoint.getAttString('endpointAddress'),
        },
      },
    );

    this.appSyncStack = new IncludeStack(this, 'CFStackForAppSync', {
      templateFile: getTemplateFile('appsync'),
      parameters: {
        uniqueId: uniqueIdHash(this),
        apiId: graphQLApi.apiId,
        apiRole: graphQLApi.apiRoleName,
        apiRoleArn: graphQLApi.apiRoleArn,
        settingsTable: persistent.deviceManagementStack.settingTable.tableName,
        dataStoreTable:
          persistent.deviceManagementStack.dataStoreTable.tableName,
        deviceTypesTable:
          persistent.deviceManagementStack.deviceTypeTable.tableName,
        deviceBlueprintsTable:
          persistent.deviceManagementStack.deviceBlueprintTable.tableName,
        deploymentsTable:
          persistent.deviceManagementStack.deploymentTable.tableName,
        systemsTable: persistent.deviceManagementStack.systemTable.tableName,
        systemBlueprintsTable:
          persistent.deviceManagementStack.systemBlueprintTable.tableName,
        settingsServiceLambdaFunctionArn: this.lambdaServiceStack.getOutput(
          'settingsServiceLambdaFunctionArn',
        ),
        deploymentsServiceLambdaFunctionArn: this.lambdaServiceStack.getOutput(
          'deploymentsServiceLambdaFunctionArn',
        ),
        systemsServiceLambdaFunctionArn: this.lambdaServiceStack.getOutput(
          'systemsServiceLambdaFunctionArn',
        ),
        HelperUtilsLambdaFunctionArn: utilsFunction.functionArn,
      },
    });

    // Do not include cloudtrail for dev, create massive unused buckets only worthy of auditing
    if (includeCloudTrail) {
      this.cloudTrailStack = new IncludeStack(this, 'CFStackForCloudTrail', {
        templateFile: getTemplateFile('cloudtrail'),
      });
    }

    /**************************************************************************
     * CUSTOM RESOURCES
     ***************************************************************************/
    this.greengrassAssociateServiceRoleToAccount = new CustomResource(
      this,
      'greengrassAssociateServiceRoleToAccount',
      {
        resourceType: 'Custom::Lambda',
        serviceToken: utilsFunction.functionArn,
        properties: {
          customAction: 'greengrassAssociateServiceRoleToAccount',
        },
      },
    );

    this.websiteConfig = new CustomResource(this, 'websiteConfig', {
      resourceType: 'Custom::LoadLambda',
      serviceToken: s3HelperFunction.functionArn,
      properties: {
        destS3Bucket: persistent.websiteStack.websiteBucket.bucketName,
        destS3Key: 'assets/appVariables.js',
        varName: 'appVariables',
        file: {
          USER_POOL_ID: cognitoStack.userPoolId,
          USER_POOL_CLIENT_ID: cognitoStack.websiteClientId,
          IDENTITY_POOL_ID: cognitoStack.identityPoolId,
          REGION: Fn.ref('AWS::Region'),
          IOT_COGNITO_POLICY:
            persistent.cognitoStack.websiteCognitoIoTPolicy.policyName,
          S3_DATA_BUCKET: persistent.dataBucketStack.dataBucket.bucketName,
          APP_SYNC_GRAPHQL_ENDPOINT: graphQLApi.graphQlUrl,
          IOT_ENDPOINT: this.iotEndpoint.getAttString('endpointAddress'),
        },
        customAction: 'putFile',
      },
    });

    this.initSettings = new CustomResource(this, 'initSettings', {
      resourceType: 'Custom::LoadLambda',
      serviceToken: utilsFunction.functionArn,
      properties: {
        ddbTable: persistent.deviceManagementStack.settingTable.tableName,
        ddbItem: {
          id: 'app-config',
          type: 'config',
          setting: {
            // NOTE: Not sure how UUID is used in the Sputnik system, but "usage metrics" requires it
            uuid: uuid(),
            mapboxToken: 'NA',
            anonymousData: sendAnonymousUsageData,
          },
        },
        customAction: 'dynamodbSaveItem',
      },
    });
  }
}
