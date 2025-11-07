#!/usr/bin/env node

/**
 * Test Script for Interactive Layout Editor
 * Run this to verify the editor is working correctly
 */

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function checkDatabaseMigration() {
  logSection('📊 Checking Database Migration');
  
  try {
    // Try to get a charging point and check if it has pos_x and pos_y
    const response = await fetch(`${API_BASE_URL}/api/charging-points?limit=1`);
    const result = await response.json();
    
    if (!result.success || !result.data || result.data.length === 0) {
      log('⚠️  No charging points found. Cannot verify migration.', 'yellow');
      return false;
    }
    
    const point = result.data[0];
    const hasPosX = point.hasOwnProperty('pos_x');
    const hasPosY = point.hasOwnProperty('pos_y');
    
    if (hasPosX && hasPosY) {
      log('✅ Database migration complete: pos_x and pos_y columns exist', 'green');
      log(`   Sample point: pos_x=${point.pos_x}, pos_y=${point.pos_y}`, 'blue');
      return true;
    } else {
      log('❌ Database migration NOT complete', 'red');
      log('   Missing columns: ' + 
        (!hasPosX ? 'pos_x ' : '') + 
        (!hasPosY ? 'pos_y' : ''), 'red');
      log('\n   Run this SQL in Supabase:', 'yellow');
      log('   database/add_position_columns.sql', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Error checking database: ${error.message}`, 'red');
    return false;
  }
}

async function testAPIEndpoint() {
  logSection('🔌 Testing API Endpoints');
  
  try {
    // Test GET connector types
    log('Testing GET /api/charging-points/connector-types/list...', 'blue');
    const connectorResponse = await fetch(`${API_BASE_URL}/api/charging-points/connector-types/list`);
    const connectorResult = await connectorResponse.json();
    
    if (connectorResult.success && connectorResult.data.length > 0) {
      log(`✅ Connector types endpoint working (${connectorResult.data.length} types)`, 'green');
    } else {
      log('⚠️  Connector types endpoint returned no data', 'yellow');
    }
    
    // Test GET charging points
    log('Testing GET /api/charging-points...', 'blue');
    const pointsResponse = await fetch(`${API_BASE_URL}/api/charging-points?limit=5`);
    const pointsResult = await pointsResponse.json();
    
    if (pointsResult.success && pointsResult.data.length > 0) {
      log(`✅ Charging points endpoint working (${pointsResult.data.length} points loaded)`, 'green');
      return true;
    } else {
      log('⚠️  No charging points found', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ API Error: ${error.message}`, 'red');
    log('   Make sure backend server is running on ' + API_BASE_URL, 'yellow');
    return false;
  }
}

async function testPositionUpdate() {
  logSection('💾 Testing Position Update');
  
  try {
    // Get first charging point
    const response = await fetch(`${API_BASE_URL}/api/charging-points?limit=1`);
    const result = await response.json();
    
    if (!result.success || !result.data || result.data.length === 0) {
      log('⚠️  No charging points to test with', 'yellow');
      return false;
    }
    
    const point = result.data[0];
    const testPosX = Math.round(Math.random() * 1000);
    const testPosY = Math.round(Math.random() * 1000);
    
    log(`Updating point ${point.point_id} position to (${testPosX}, ${testPosY})...`, 'blue');
    
    const updateResponse = await fetch(`${API_BASE_URL}/api/charging-points/${point.point_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pos_x: testPosX,
        pos_y: testPosY,
      }),
    });
    
    const updateResult = await updateResponse.json();
    
    if (updateResult.success) {
      const updatedPoint = updateResult.data;
      if (updatedPoint.pos_x === testPosX && updatedPoint.pos_y === testPosY) {
        log('✅ Position update successful', 'green');
        log(`   Verified: pos_x=${updatedPoint.pos_x}, pos_y=${updatedPoint.pos_y}`, 'green');
        return true;
      } else {
        log('⚠️  Position update returned success but values do not match', 'yellow');
        return false;
      }
    } else {
      log('❌ Position update failed: ' + updateResult.error, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Update Error: ${error.message}`, 'red');
    return false;
  }
}

async function checkComponentFile() {
  logSection('📁 Checking Component Files');
  
  const fs = require('fs');
  const path = require('path');
  
  const componentPath = path.join(process.cwd(), 'src', 'components', 'InteractiveStationLayout.tsx');
  
  if (fs.existsSync(componentPath)) {
    log('✅ InteractiveStationLayout.tsx exists', 'green');
    
    const content = fs.readFileSync(componentPath, 'utf8');
    
    if (content.includes('import ReactFlow')) {
      log('✅ React Flow import found', 'green');
    } else {
      log('⚠️  React Flow import not found', 'yellow');
    }
    
    if (content.includes('pos_x') && content.includes('pos_y')) {
      log('✅ Position handling code found', 'green');
    } else {
      log('⚠️  Position handling code not found', 'yellow');
    }
    
    return true;
  } else {
    log('❌ InteractiveStationLayout.tsx not found', 'red');
    log('   Expected at: ' + componentPath, 'yellow');
    return false;
  }
}

async function checkPackageJson() {
  logSection('📦 Checking Dependencies');
  
  const fs = require('fs');
  const path = require('path');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.reactflow) {
      log(`✅ React Flow installed: ${deps.reactflow}`, 'green');
      return true;
    } else {
      log('❌ React Flow NOT installed', 'red');
      log('   Run: npm install reactflow@11.10.4', 'yellow');
      return false;
    }
  } else {
    log('⚠️  package.json not found', 'yellow');
    return false;
  }
}

async function runAllTests() {
  log('\n🚀 Interactive Layout Editor - Test Suite\n', 'cyan');
  
  const results = {
    packageJson: await checkPackageJson(),
    componentFile: await checkComponentFile(),
    database: await checkDatabaseMigration(),
    api: await testAPIEndpoint(),
    positionUpdate: await testPositionUpdate(),
  };
  
  logSection('📊 Test Results Summary');
  
  let passed = 0;
  let total = 0;
  
  Object.entries(results).forEach(([test, result]) => {
    total++;
    if (result) {
      passed++;
      log(`✅ ${test}: PASSED`, 'green');
    } else {
      log(`❌ ${test}: FAILED`, 'red');
    }
  });
  
  log(`\nTotal: ${passed}/${total} tests passed\n`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('🎉 All tests passed! Interactive Layout Editor is ready to use.', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Import the component: import { InteractiveStationLayout } from \'./components/InteractiveStationLayout\';', 'blue');
    log('2. Use it: <InteractiveStationLayout stationId="..." stationName="..." />', 'blue');
    log('3. See docs/QUICK_START_LAYOUT_EDITOR.md for more info', 'blue');
  } else {
    log('\n⚠️  Some tests failed. Please fix the issues above.', 'yellow');
  }
}

// Run if executed directly
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
