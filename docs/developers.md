# Developing Sputnik

## Pre-Requisites

Developing Sputnik requires the following OS level dependencies:

* jq
* yarn
* uuidgen


## Project structure

```
.
├── README.md
├── deployment
│   ├── build.sh
│   └── scripts
│       ├── 00-cleanup.sh
│       ├── 01-prepare-cf.sh
│       ├── 02-cf-custom-resource-lambda.sh
│       ├── 03-website.sh
│       ├── 04-services-lambda.sh
│       └── 05-greengrass-lambdas.sh
├── docs
├── images
└── source
    ├── cf
    ├── console
    ├── resources
    └── services
```


### deployment folder
This folder contains the scripts to build and deploy your own custom version of Sputnik.

Build:

```
chmod +x build.sh
./build.sh [S3 BUCKET NAME] [VERSION]
```

_Note 1:_ [S3 BUCKET NAME] is the destination S3 Bucket in which you want to store the build. It will be off of this build that your deployments will be run against. You would have to create this S3 bucket with the prefix [my-bucket-name]-[AWS REGION]. The AWS Region is where you are testing the customized solution. Finally, the assets in this bucket will have to be publicly accessible.

_Note 2:_ Specify a version for your build, example: "v1.0"

Deploy:

```
aws s3 cp ./dist/ s3://[S3 BUCKET NAME]/sputnik/[VERSION]/ --recursive --acl bucket-owner-full-control
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
yarn install
ng serve
```

Point your browser to [http://localhost:4200](http://localhost:4200)

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
