#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Please provide the source dir, dist dir"
    echo "For example: ./05-greengrass-lambdas.sh ../source ./dist"
    exit 1
fi

set -e

rm -rf $2/cf/defaults/lambdas
echo "mkdir -p $2/lambda"
mkdir -p $2/greengrasslambda

echo "05-greengrass-lambdas.sh--------------------------------------------------------------------------------"
echo
echo

cd $1/cf/defaults/lambdas/

for PYTHON_LAMBDA in *-python/ ; do
    echo "***"
    echo $PYTHON_LAMBDA
    cd $1/cf/defaults/lambdas/$PYTHON_LAMBDA
    pip install -r requirements.txt -t . --upgrade
    zip -rq $2/greengrasslambda/`echo ${PWD##*/}`.zip .
    echo "Done with $PYTHON_LAMBDA"
done

echo
echo "--------------------------------------------------------------------------------------------------------"
echo
exit 0
