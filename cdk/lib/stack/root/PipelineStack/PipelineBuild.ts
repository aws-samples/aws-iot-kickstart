/* eslint-disable @typescript-eslint/camelcase */
import * as codebuild from '@aws-cdk/aws-codebuild'
import * as iam from '@aws-cdk/aws-iam'
import { ManagedPolicy } from '@aws-cdk/aws-iam'
import { Construct, Stack } from '@aws-cdk/core'

export class PipelineBuild extends Construct {
		readonly buildPipelineProject: codebuild.PipelineProject

		constructor (stack: Stack, id: string) {
			super(stack, id)

			const separator = '\n#########################################################################\n'

			this.buildPipelineProject = new codebuild.PipelineProject(this, 'Pipeline-BuildPipelineProject', {
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
								'cd $CODEBUILD_SRC_DIR/cdk',
								'npm run build',
								`npm run cdk deploy -- --require-approval never ${stack.stackName} --region ${stack.region} -c RepositoryRegion=${stack.region}`,
								'tree ./cdk.out',
								'echo "####### CDK Template Output #######"',
								`find cdk.out -type f -iname *.template.json -exec printf "\n\n${separator}#### {}${separator}" \\; -exec cat {} \\;`,
							],
						},
					},
				}),
				environment: {
					buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
					computeType: codebuild.ComputeType.MEDIUM,
				},
				role: new iam.Role(this, 'Pipeline-BuildPipelineProject-Role', {
					assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
					managedPolicies: [
						ManagedPolicy.fromManagedPolicyArn(this, 'Pipeline-CodeBuildAdministratorAccess', 'arn:aws:iam::aws:policy/AdministratorAccess'),
					],
				}),
			})
		}
}
