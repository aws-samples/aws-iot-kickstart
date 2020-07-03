#!/bin/bash
set -e

cd `dirname $0`/lambdas

LAMBDAS_DIR=$PWD

for PYTHON_LAMBDA in *-python/ ; do
    echo "--------------------------------------------------------------------------------------------------------"
    echo $PYTHON_LAMBDA
    cd $PYTHON_LAMBDA
    pip install -r requirements.txt -t . --upgrade
    zip -rq ../`echo ${PWD##*/}`.zip .
    echo "Done with $PYTHON_LAMBDA"
    cd $LAMBDAS_DIR
done

exit 0
