#!/bin/bash

echo "Nuke Stack !!! This will force delete all prefixed resources in the account/region specified... use caution!"

read -p "AWS Profile [$1]: " profile
profile=${profile:-$1}

read -p "AWS Region [$2]: " region
region=${region:-$2}

read -p "Namespace [Sputnik]: " prefix
prefix=${prefix:-Sputnik}

account_id=$(aws sts get-caller-identity --query Account --output text --profile $profile)

read -p "Are you sure you want to NUKE \"${prefix}*\" resources in account $account_id ($region)? " -n 1 -r
[[ $REPLY =~ ^[Yy]$ ]] || exit 0

printf "\n\n### Nuking S3 Buckets ####\n\n"
for bucket in $(aws s3 ls --profile $profile --region $region | awk '{print $3}' | grep -i '$prefix.*' | grep -v -e 'pipeline' -e 'do-not-delete'); do  aws s3 rb "s3://${bucket}" --force --profile $profile --region $region ; done

printf "\n\n### Nuking DynamoDB Tables ####\n\n"
aws dynamodb list-tables --profile $profile --region $region | jq .'TableNames[]' -r | grep -io '$prefix.*' | xargs -ITABLE -n 1 aws dynamodb delete-table --output text --table-name TABLE --profile $profile --region $region > /dev/null

printf "\n\n### Nuking SNS Topics ####\n\n"
aws sns list-topics --profile $profile --region $region | jq .'Topics[]' -r | grep -io 'arn:.*:$prefix[^"]*' | xargs -ITABLE -n 1 aws sns delete-topic --output text --topic-arn TABLE --profile $profile --region $region > /dev/null

printf "\n\n### Nuking Cognito User Pools"
aws cognito-idp list-user-pools --max-results 60 --profile $profile --region $region | jq .'UserPools[]' -r | grep -io '$prefix[^"]*' | xargs -ITABLE -n 1 aws cognito-idp delete-user-pool --output text --user-pool-id TABLE --profile $profile --region $region
printf "\t Verify Cognito User Pools have been removed"
printf "\t - https://$region.console.aws.amazon.com/cognito/users/?region=$region"

printf "\n\n[MANUAL]: IoT Certifacate and Policies need to be deleted manually"
printf "\t- https://$region.console.aws.amazon.com/iot/home?region=$region#/certificatehub"
printf "\t- https://$region.console.aws.amazon.com/iot/home?region=$region#/policyhub"
