#!/bin/sh
# Install any new library if added
set -e

echo "Build started"
docker build -t dpaved/web-daddyfoundation:1.0 .
echo "Build finished successfully"
docker push dpaved/web-daddyfoundation:1.0
