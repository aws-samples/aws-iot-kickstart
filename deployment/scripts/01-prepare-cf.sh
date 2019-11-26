#!/bin/bash

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ]; then
    echo "Please provide the source dir, dist dir, bucket name, version"
    echo "For example: ./00-prepare-cf.sh ../source ./dist sputnik.yml BUCKET v0.1"
    exit 1
fi

set -e

function sed_file() {
    echo "sed -i '' -e $1 $2"
    sed -i '' -e $1 $2
}

echo "01-prepare-cf.sh--------------------------------------------------------------"
echo "[Packing] Cloud formation template"
echo
echo "Removing old $2/cf dir (rm -rf $2/cf)"
rm -rf $2/cf

echo "Copying CF folder accross (cp -R $1/cf $2)"
cp -R $1/cf $2

echo "Updating code source bucket in templates with $3 and code source version in template with $4"
replace="s/%%BUCKET_NAME%%/$3/g"
sed_file $replace "${2}/cf/*.yml"
sed_file $replace "${2}/cf/defaults/*.yml"

replace="s/%%VERSION%%/$4/g"
sed_file $replace "${2}/cf/*.yml"
sed_file $replace "${2}/cf/defaults/*.yml"

echo
echo "------------------------------------------------------------------------------"
echo "Remove defaults lambda source code"
rm -rf $2/cf/defaults/lambdas
echo "------------------------------------------------------------------------------"
echo
exit 0
