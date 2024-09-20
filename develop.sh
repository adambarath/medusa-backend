#!/bin/sh

medusa migrations run

# https://docs.medusajs.com/cli/reference
# medusa user -e admin@medusa-test.com -p supersecret

medusa $1
