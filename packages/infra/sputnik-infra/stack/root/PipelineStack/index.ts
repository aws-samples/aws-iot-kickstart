/* eslint-disable @typescript-eslint/camelcase */
import * as codecommit from '@aws-cdk/aws-codecommit'
import * as codepipeline from '@aws-cdk/aws-codepipeline'
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions'
import * as iam from '@aws-cdk/aws-iam'
import { Construct, Stack, StackProps } from '@aws-cdk/core'
import { AppCodeBuild } from './AppCodeBuild'

export interface PipelineStackProps extends StackProps {
		readonly repositoryName: string
		readonly repositoryBranch?: string
		readonly appStackRegion: string
		readonly appStackName: string
		readonly selfUpdate?: boolean
}

export class PipelineStack extends Stack {
		readonly pipeline: codepipeline.Pipeline

		constructor (scope: Construct, id: string, props: PipelineStackProps) {
			super(scope, id, props)

			const { appStackRegion, appStackName, repositoryName, repositoryBranch = 'master', selfUpdate } = props

			const repository = codecommit.Repository.fromRepositoryName(this, 'CodeCommitRepository', repositoryName)

			// Configure the CodePipeline source - where your CDK App's source code is hosted
			const sourceOutput = new codepipeline.Artifact()

			const appBuild = new AppCodeBuild(this, 'App-CodeBuild', {
				appStackRegion,
				appStackName,
			})

			this.pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
				// Mutating a CodePipeline can cause the currently propagating state to be
				// "lost". Ensure we re-run the latest change through the pipeline after it's
				// been mutated so we're sure the latest state is fully deployed through.
				restartExecutionOnUpdate: true,
			})

			this.pipeline.addStage({
				stageName: 'Source',
				actions: [
					new codepipeline_actions.CodeCommitSourceAction({
						actionName: 'CodeCommitSource',
						repository,
						branch: repositoryBranch,
						output: sourceOutput,
						role: new iam.Role(this, 'CodeCommitSourceActionRole', {
							assumedBy: new iam.AccountPrincipal(this.account),
							managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeCommitReadOnly')],
						}),
					}),
				],
			})

			if (selfUpdate) {
				const pipelineBuild = new AppCodeBuild(this, 'Pipeline-CodeBuild', {
					appStackRegion,
					appStackName,
				})

				this.pipeline.addStage({
					stageName: 'Pipeline-Build',
					actions: [
						new codepipeline_actions.CodeBuildAction({
							actionName: 'Pipeline-BuildDeploy',
							project: pipelineBuild.buildPipelineProject,
							input: sourceOutput,
						}),
					],
				})
			}

			const appDeployAction =	new codepipeline_actions.CodeBuildAction({
				actionName: 'Deploy-App',
				project: appBuild.buildPipelineProject,
				input: sourceOutput,
			})

			this.pipeline.addStage({
				stageName: 'Deploy',
				actions: [appDeployAction],
			})
		}
}
