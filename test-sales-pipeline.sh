#!/bin/bash
# test-sales-pipeline.sh
# Quick test script for sales pipeline automation

set -e

echo "🧪 Testing Sales Pipeline Automation"
echo "======================================"
echo ""

# Test 1: Demo mode
echo "Test 1: Running in demo mode..."
python3 scripts/sales_pipeline_pull.py --demo
if [ $? -eq 0 ]; then
    echo "✅ Demo mode test passed"
else
    echo "❌ Demo mode test failed"
    exit 1
fi
echo ""

# Test 2: Verify output file exists
echo "Test 2: Verifying output file..."
if [ -f "output/sales_pipeline.json" ]; then
    echo "✅ Output file exists"
else
    echo "❌ Output file not found"
    exit 1
fi
echo ""

# Test 3: Validate JSON structure
echo "Test 3: Validating JSON structure..."
python3 -c "
import json
with open('output/sales_pipeline.json', 'r') as f:
    data = json.load(f)
    assert 'date' in data, 'Missing date field'
    assert 'leads' in data, 'Missing leads field'
    assert 'metrics' in data, 'Missing metrics field'
    assert len(data['leads']) > 0, 'No leads in output'
    print('✅ JSON structure valid')
"
echo ""

# Test 4: CSV mode with sample data
echo "Test 4: Testing CSV mode with sample data..."
python3 scripts/sales_pipeline_pull.py --source csv --path output/sales_pipeline_sample.csv
if [ $? -eq 0 ]; then
    echo "✅ CSV mode test passed"
else
    echo "❌ CSV mode test failed"
    exit 1
fi
echo ""

# Test 5: Verify audit log created
echo "Test 5: Checking audit log..."
if ls output/sales_audit_*.json 1> /dev/null 2>&1; then
    echo "✅ Audit log created"
else
    echo "❌ Audit log not found"
    exit 1
fi
echo ""

echo "======================================"
echo "✅ All tests passed!"
echo ""
echo "Next steps:"
echo "  - View output: cat output/sales_pipeline.json | python3 -m json.tool"
echo "  - Check metrics: jq '.metrics' output/sales_pipeline.json"
echo "  - Test API: npm run dev (then visit /api/sales-pipeline)"
