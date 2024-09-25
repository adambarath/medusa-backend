#!/bin/sh

medusa migrations run
npx medusa links sync

# https://docs.medusajs.com/cli/reference
# medusa user -e admin@medusa-test.com -p supersecret
# npx medusa exec ./src/scripts/seed.hu.ts

medusa $1
