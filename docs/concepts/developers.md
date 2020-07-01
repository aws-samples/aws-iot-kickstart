# Developing Sputnik

## Pre-Requisites

Developing Sputnik requires the following OS level dependencies:

* jq

## Project structure

```
.
├── README.md
├── docs
├── images
└── source
    ├── cf
    ├── console
    ├── resources
    └── services
```


### source folder
#### cf
This folder holds the CloudFormation files and assets.

The main CloudFormation file: [../source/cf/sputnik.yml](../source/cf/sputnik.yml) is the main template for deploying Sputnik in an AWS Account. This template will refer to numerous other nested templates that will deploy the underlying AWS resources (Database, Lambda functions, GraphQL Schema etc ...)

#### console
This folder holds the Angular frontend source code for Sputnik.

To run a local version of the Angular code:

```
cd ./source/console
npm install
npm run dev
```

Point your browser to [http://localhost:4200](http://localhost:4200)

Before console application will work with your deployed stack, you need to update the appVariables.js file that stores the web configs.
This is auto updated/deployed from the websiteConfig custom resource.

Add the following file locally to minimic deployed application mapping:
```
// source/console/.local/assets/appVariables.js
'use strict';

const appVariables = {
IOT_ENDPOINT: 'XXXXXX-ats.iot.ap-southeast-1.amazonaws.com',
S3_DATA_BUCKET: 'sputnikp-data-bucket-XXXXXXX-ap-southeast-1',
IDENTITY_POOL_ID: 'ap-southeast-1:XXXXXXX-XXXXXXX-XXXXXXX',
USER_POOL_ID: 'ap-southeast-XXXXXXXX',
USER_POOL_CLIENT_ID: 'XXXXXXXXXXXXXX',
REGION: 'ap-southeast-1',
APP_SYNC_GRAPHQL_ENDPOINT: 'https://XXXXXXXXXXXXX.appsync-api.ap-southeast-1.amazonaws.com/graphql'
};
```

The easiest way to get these values is to open the deployed stacks domain name and check the network tab for `appVariables.js`
file and copy/paste the response into the above.

#### resources
This folder holds the custom lambda resources used by CloudFormation to setup specific AWS resources.

There are 3 custom resources:

* cf-helper-s3:
* usage-metrics:
* utils

#### services
This folder holds Sputnik's micro-service backend Lambda functions.

* admin
* deployments
* devices
* just-in-time-on-boarding
* settings
* systems
