#!/bin/bash

NAMESPACE=${1:-sputnik}
REGION="us-east-1"
read -p "Type the name of your profile or leave it empty to use the default one: (${AWS_PROFILE:-default})" PROFILE

if [ -z "$PROFILE" ]
then
    PROFILE=${AWS_PROFILE:-default}
fi

ACCOUNTID=$(aws sts get-caller-identity --query Account --output text --profile $PROFILE)

read -p "Are you sure you want to NUKE account $ACCOUNTID? (namespace $NAMESPACE)" -n 1 -r

[[ $REPLY =~ ^[Yy]$ ]] || exit 0

printf "\n\n### Nuking S3 Buckets ####\n\n"
for bucket in $(aws s3 ls --profile $PROFILE | awk "{print $3}" | grep -i "$NAMESPACE.*" | grep -v -e "pipeline" -e "do-not-delete"); do  aws s3 rb "s3://${bucket}" --force --profile $PROFILE ; done

printf "\n\n### Nuking DynamoDB Tables ####\n\n"
aws dynamodb list-tables --profile $PROFILE | jq ."TableNames[]" -r | grep -io "$NAMESPACE.*" | xargs -ITABLE -n 1 aws dynamodb delete-table --output text --table-name TABLE --profile $PROFILE > /dev/null

printf "\n\n### Nuking SNS Topics ####\n\n"
aws sns list-topics --profile $PROFILE | jq ."Topics[]" -r | grep -io "arn:.*:$NAMESPACE[^"]*" | xargs -ITABLE -n 1 aws sns delete-topic --output text --topic-arn TABLE --profile $PROFILE > /dev/null

printf "\n\nTODO: Need to add nuking Cognito UserPool, Groups, Etc\n\n"
aws cognito-idp list-user-pools --max-results 60 --profile $PROFILE | jq ."UserPools[]" -r | grep -io "$NAMESPACE[^"]*" | xargs -ITABLE -n 1 aws cognito-idp delete-user-pool --output text --user-pool-id TABLE --profile $PROFILE
