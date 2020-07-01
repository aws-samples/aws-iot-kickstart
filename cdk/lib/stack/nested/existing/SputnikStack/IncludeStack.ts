import { readFileSync } from 'fs'
import { omit } from 'lodash'
import { CfnInclude, Construct, NestedStack, NestedStackProps, CfnResource } from '@aws-cdk/core'
import { yamlParse } from 'yaml-cfn'
import { NpmCode } from '../../../../construct/lambda/NpmCode'

interface Template {
	Parameters: {
		[key: string]: {
			Type: 'String'
			Description?: string
			Default?: string | number | boolean
		}
	}
}

export interface IncludeStackProps extends Omit<NestedStackProps, 'parameters'> {
	templateFile: string
	parameters?: { [key: string]: string | NpmCode, }
}

export class IncludeStack extends NestedStack {
	readonly include: CfnInclude

	constructor (scope: Construct, id: string, props: IncludeStackProps) {
		// Process NpmCode parameters to provice asset bucket details as separate params
		if (props.parameters) {
			Object.entries(props.parameters).forEach(([key, parameter]): void => {
				if (parameter instanceof NpmCode) {
					const codeConfig = parameter.bind(new Construct(scope, `${key}_Code`))

					if (props.parameters) {
						props.parameters[`${key}CodeS3Bucket`] = codeConfig.s3Location?.bucketName as string
						props.parameters[`${key}CodeS3Key`] = codeConfig.s3Location?.objectKey as string
						delete props.parameters[key]
					}
				}
			})
		}

		super(scope, id, Object.assign(omit(props, 'parameters'), { parameters: props.parameters || {} }))

		const template = yamlParse(readFileSync(props.templateFile, 'utf-8')) as Template

		this.include = new CfnInclude(this, 'Include', {
			template,
		})
	}

	getOutput (att: string): string {
		return (this.nestedStackResource as CfnResource).getAtt(`Outputs.${att}`).toString()
	}
}
