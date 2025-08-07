#!/bin/sh
# Install any new library if added
set -e

echo "Build started"
docker build -t dpaved/metuaa-admin-mapper:1.0 .
echo "Build finished successfully"
docker push dpaved/metuaa-admin-mapper:1.0
