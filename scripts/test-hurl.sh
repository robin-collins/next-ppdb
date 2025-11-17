#!/bin/bash

# Hurl API Test Runner
# Runs all Hurl tests against the API

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if hurl is installed
if ! command -v hurl &> /dev/null; then
    echo -e "${RED}❌ Hurl is not installed${NC}"
    echo ""
    echo "Install Hurl:"
    echo "  macOS:     brew install hurl"
    echo "  Ubuntu:    curl -LO https://github.com/Orange-OpenSource/hurl/releases/latest/download/hurl_amd64.deb && sudo dpkg -i hurl_amd64.deb"
    echo ""
    echo "See hurl/README.md for more installation options"
    exit 1
fi

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Dev server is not running${NC}"
    echo ""
    echo "Start the dev server first:"
    echo "  pnpm dev"
    echo ""
    exit 1
fi

# Variables file
VARS_FILE="hurl/variables.env"

if [ ! -f "$VARS_FILE" ]; then
    echo -e "${RED}❌ Variables file not found: $VARS_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}🧪 Running Hurl API Tests${NC}"
echo ""

# Run tests by category
FAILED=0

run_tests() {
    local category=$1
    local pattern=$2
    
    echo -e "${YELLOW}Testing $category...${NC}"
    
    if hurl $pattern --variables-file "$VARS_FILE" --test; then
        echo -e "${GREEN}✅ $category tests passed${NC}"
        echo ""
    else
        echo -e "${RED}❌ $category tests failed${NC}"
        echo ""
        FAILED=1
    fi
}

# Run test suites
run_tests "Animals" "hurl/animals/*.hurl"
run_tests "Customers" "hurl/customers/*.hurl"
run_tests "Breeds" "hurl/breeds/*.hurl"
run_tests "Notes" "hurl/notes/*.hurl"

# Run complete workflow test
echo -e "${YELLOW}Testing Complete Workflow...${NC}"
if hurl hurl/workflow-complete.hurl --variables-file "$VARS_FILE" --test; then
    echo -e "${GREEN}✅ Workflow test passed${NC}"
    echo ""
else
    echo -e "${RED}❌ Workflow test failed${NC}"
    echo ""
    FAILED=1
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All Hurl tests passed!${NC}"
else
    echo -e "${RED}❌ Some Hurl tests failed${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $FAILED

