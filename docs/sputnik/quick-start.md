# Sputnik Project Setup

## Quick Start: Application Deployment
Deploy and launch the full application

> If this is  your first CDK dpeloyment in account region, you will need to bootstrap CDK.
> Run `yarn run bootstrap` to deploy CDKToolkit. This is one time deploy per account per region.

1. Set the `AdministratorEmail` property in the `cdk.json` file.
	> Unfortunately list can not be automatically pulled from account using cli, so must be provided manually
2. Run the following script to deploy the app with **defaults** (example **DeviceTypes** & **DeviceBlueprints**)
	```
	cd cdk
	yarn install
	yarn run dev:deploy:app -- --context LoadDefaults=true
	```
	> `LoadDefaults=true` will automatically populate DynamoDB tables with data from `/examples/defaults`

	> WARNING: loading defaults should only be performed once, as it does not handle updating/overwriting existing data.
	> You will likely need to manually delete data in tables before running again if you change defaults or update the utils script to handle.
3. After deployment is complete, you will receive an email with the domain and login details.
	> The email maybe send prior to stack being completely ready, make sure CDK deploy has completed as well before attempting to access site.

> Can also specify `AdministratorEmail` in the command, but will not persist: `yarn run dev:deploy:app -- --context LoadDefaults=true --context AdministratorEmail=someone@example.com`

## Quick Start: CI/CD Pipeline Deployment
Setup code repository and pipeline to auto build and deploy the application when commiting to *mainline* branch.

1. Set the `AdministratorEmail` property in the `cdk.json` file.
2. Create CodeCommit repository name `Sputnik` - [folwing this guide](https://docs.aws.amazon.com/codecommit/latest/userguide/getting-started-cc.html)
3. Commit initial project files into repo
	- Check out the new CodeCommit repository locally (clone URL found in repository console)
	- Copy/Paste all the files from this project into local repository
	- Commit and push all files
4. Deploy the pipeline stack
	```
	cd cdk
	yarn install
	yarn dev:pipeline:deploy
	```

After pipeline is deployed, it will automatically pickup the latest commit from the CodeCommit repository and build/deploy the application.

> Any future commits pushed to origin/mainline will automatically get built & deployed

## Quick Start: Website Development (Console)
Develop the website locally against the deployed stack.

1. Setup local development variables to point to deployed stack
	- Launch the deployed application from domain in invitation email above
	- Open **Network Tab** and refresh page
	- Copy content of `appVariables.js` from request/response
	- Paste the content to `source/console/.local/appVariables.js`
		> This file is ignored by git and should not be committed
2. Run the website development server
	```
	cd source/console
	yarn install
	yarn run dev
	```
3. Open your browser to [http://localhost:4200](http://localhost:4200)

This will start the angular dev server, which automatically watches file changes, and uses the cloud services deployed above.

## Project Context
Context is used to define the properties used to build and deploy the application.
These can be edited in the `/cdk/cdk.json` file.

Property `AdministratorEmail` is the only required property that must be updated, other properties are defaulted.
> Can also be set during cdk command via `--context AdministratorEmail=xxx@example.com`

> You can supply any context overrides in the terminal when invoking cdk: `yarn run dev:deploy:app -- --context SomeKey=SomeValue`

Region for both app and pipeline (CI/CD) stacks will use region of AWS profile executing the cdk command. To force these value, or use cross-region deployment, set the values in the `cdk.json` file.

```
{
		...
		"context": {
				...
				// Namespace for stack and resources deployed
 				"Namespace": "Sputnik",

				// Name of the admin user
 				"AdministratorName": "Administrator",

				 // Email address of admin user (REQUIRED)
 				"AdministratorEmail": "################",

				 // Name of the CodeCommit repository where project code is stored
				"RepositoryName": "Sputnik",

				// Branch CI/CD monitors for changes to auto deploy; Useful to modify for development purposes
				"RepositoryBranch": "mainline",

				// Report where the CodeCommit repository is located (us-west-2, ap-southeast-1)
				// If not specified will use process.env.CDK_DEFAULT_REGION
  			"RepositoryRegion": "${CDK_DEFAULT_REGION}"

				// Region where you want the application to be deployed (us-west-2, ap-southeast-1)
				// If not specified will use process.env.CDK_DEFAULT_REGION
				"AppRegion": "${CDK_DEFAULT_REGION}",

				// Short name of application used for naming stacks and resources
				"AppShortName": "Sputnik",

				// Full name of application used in website and notifications
				"AppFullName": "Sputnik - IoT Device Provisioning and Management"
		}
}
```
