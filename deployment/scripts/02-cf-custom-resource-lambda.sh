#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the source dir, dist dir"
    echo "For example: ./00-cleanup.sh ../source ./dist"
    exit 1
fi

set -e

echo "02-cf-custom-resource-lambda.sh-----------------------------------------------"
echo "mkdir -p $2/lambda"
mkdir -p $2/lambda
echo
echo "[Rebuild] Cloudformation custom resource - S3 Helper"
cd $1/resources/cf-helper-s3
yarn run build
cp $1/resources/cf-helper-s3/dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo
echo "[Rebuild] Cloudformation custom resource - Utils"
echo
cd $1/resources/utils
yarn run build
cp ./dist/`jq -cr '.name' package.json`.zip $2/lambda/`jq -cr '.name' package.json`.zip

echo
echo "------------------------------------------------------------------------------"
echo

exit 0
