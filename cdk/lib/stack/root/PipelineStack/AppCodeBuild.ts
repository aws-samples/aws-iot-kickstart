/* eslint-disable @typescript-eslint/camelcase */
import * as codebuild from '@aws-cdk/aws-codebuild'
import * as iam from '@aws-cdk/aws-iam'
import { ManagedPolicy } from '@aws-cdk/aws-iam'
import * as s3 from '@aws-cdk/aws-s3'
import { Construct } from '@aws-cdk/core'

export interface AppCodeBuildProps {
		readonly appStackRegion: string
		readonly appStackName: string
}

export class AppCodeBuild extends Construct {
		readonly deploymentBucket: s3.Bucket

		readonly buildPipelineProject: codebuild.PipelineProject

		constructor (scope: Construct, id: string, props: AppCodeBuildProps) {
			super(scope, id)

			const { appStackName, appStackRegion } = props

			const separator = '\n#########################################################################\n'

			this.buildPipelineProject = new codebuild.PipelineProject(this, 'App-BuildPipelineProject', {
				buildSpec: codebuild.BuildSpec.fromObject({
					version: '0.2',
					phases: {
						install: {
							commands: [
								'apt update',
								'apt-get install tree',
								'cd $CODEBUILD_SRC_DIR/cdk',
								'npm install',
							],
						},
						build: {
							commands: [
								'export CDK_NPMCODE_VERBOSE=1',
								'cd $CODEBUILD_SRC_DIR/cdk',
								'npm run build',
								`npm run cdk deploy -- --diff --require-approval never ${appStackName} --region ${appStackRegion} -c AppRegion=${appStackRegion}`,
								'tree ./cdk.out',
								'echo "####### CDK Template Output #######"',
								`find cdk.out -type f -iname *.template.json -exec printf "\n\n${separator}#### {}${separator}" \\; -exec cat {} \\;`,
							],
						},
					},
				}),
				environment: {
					buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
					// TODO: make this configurable and lower before giving to customer
					computeType: codebuild.ComputeType.LARGE,
				},
				role: new iam.Role(this, 'App-BuildPipelineProject-Role', {
					assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
					managedPolicies: [
						ManagedPolicy.fromManagedPolicyArn(this, 'App-CodeBuildAdministratorAccess', 'arn:aws:iam::aws:policy/AdministratorAccess'),
					],
				}),
			})
		}
}
