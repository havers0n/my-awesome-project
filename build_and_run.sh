#!/bin/bash
set -e

npm install

npm run build

npm run preview -- --host 0.0.0.0 --port 7999