#!/bin/bash
set -e

cd `dirname $0`

MODELS_DIR=$PWD/assets/models

mkdir -p $MODELS_DIR

mkdir -p /tmp/squeezenet_v1.1
curl -o /tmp/squeezenet_v1.1/squeezenet_v1.1-0000.params https://s3.amazonaws.com/model-server/model_archive_1.0/examples/squeezenet_v1.1/squeezenet_v1.1-0000.params
curl -o /tmp/squeezenet_v1.1/squeezenet_v1.1-symbol.json https://s3.amazonaws.com/model-server/model_archive_1.0/examples/squeezenet_v1.1/squeezenet_v1.1-symbol.json
curl -o /tmp/squeezenet_v1.1/synset.txt https://s3.amazonaws.com/model-server/model_archive_1.0/examples/squeezenet_v1.1/synset.txt
zip -r -j $MODELS_DIR/squeezenet_v1.1.zip /tmp/squeezenet_v1.1/*

exit 0
