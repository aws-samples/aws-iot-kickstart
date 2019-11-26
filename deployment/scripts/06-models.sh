#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] ; then
    echo "Please provide the source dir, dist dir"
    echo "For example: ./06-models.sh ./dist"
    exit 1
fi

set -e

rm -rf $1/assets
echo "mkdir -p $1/assets"
mkdir -p $1/assets
echo "mkdir -p $1/assets/models"
mkdir -p $1/assets/models

echo "06-models.sh--------------------------------------------------------------------------------"
echo
echo

mkdir -p /tmp/squeezenet_v1.1
curl -o /tmp/squeezenet_v1.1/squeezenet_v1.1-0000.params https://s3.amazonaws.com/model-server/model_archive_1.0/examples/squeezenet_v1.1/squeezenet_v1.1-0000.params
curl -o /tmp/squeezenet_v1.1/squeezenet_v1.1-symbol.json https://s3.amazonaws.com/model-server/model_archive_1.0/examples/squeezenet_v1.1/squeezenet_v1.1-symbol.json
curl -o /tmp/squeezenet_v1.1/synset.txt https://s3.amazonaws.com/model-server/model_archive_1.0/examples/squeezenet_v1.1/synset.txt
zip -r -j $1/assets/models/squeezenet_v1.1.zip /tmp/squeezenet_v1.1/*

echo
echo "--------------------------------------------------------------------------------------------------------"
echo
exit 0
