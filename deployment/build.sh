#!/bin/bash
#
# This assumes all of the OS-level configuration has been completed and git repo has already been cloned
#
# This script should be run from the repo's deployment directory
# cd deployment
# ./build-s3-dist.sh source-bucket-base-name version-code
#
# Paramenters:
#  - source-bucket-base-name: Name for the S3 bucket location where the script will deploy the code to. The template will append '-[region_name]' to this bucket name.
#    For example: ./build-s3-dist.sh my-super-bucket v1.0.0
#    The template will then expect the source code to be located in the my-super-bucket-[region_name] bucket
#
#  - version-code: version of the package

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the base source bucket name and version where the code will eventually reside."
    echo "For example: ./build-s3-dist.sh my-super-bucket v1.0.0"
    exit 1
fi

set -e

echo "------------------------------------------------------------------------------"
echo "[Dependencies]"
echo "jq version: `jq --version`"
echo "yarn version: `yarn --version`"
echo "------------------------------------------------------------------------------"
echo

# Get reference for all important folders
template_dir="$PWD"
dist_dir="$template_dir/dist"
source_dir="$template_dir/../source"

$template_dir/scripts/00-cleanup.sh $dist_dir
$template_dir/scripts/01-prepare-cf.sh $source_dir $dist_dir $1 $2
$template_dir/scripts/02-cf-custom-resource-lambda.sh $source_dir $dist_dir
$template_dir/scripts/03-website.sh $source_dir $dist_dir
$template_dir/scripts/04-services-lambda.sh $source_dir $dist_dir
$template_dir/scripts/05-greengrass-lambdas.sh $source_dir $dist_dir
$template_dir/scripts/06-models.sh $dist_dir
