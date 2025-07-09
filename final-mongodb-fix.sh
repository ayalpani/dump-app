#!/bin/bash

echo "🔧 Final MongoDB Permission Fix"
echo "Connecting directly with siteAdmin credentials to test and fix permissions"

# SSH and test siteAdmin connection
ssh deploy@89.58.28.241 << 'EOF'

echo "=== Testing siteAdmin connection ==="

# Test current siteAdmin permissions
mongosh "mongodb://siteAdmin:SuperSicheresPasswortFuerMongoDb@localhost:27017/admin?authSource=admin" --eval "
console.log('=== Connected as siteAdmin to admin database ===');

// Check current user info
try {
    var currentUser = db.runCommand({connectionStatus: 1});
    console.log('✅ Connection successful');
    console.log('Authenticated as:', currentUser.authInfo.authenticatedUsers[0].user);
    console.log('Auth database:', currentUser.authInfo.authenticatedUsers[0].db);
} catch (e) {
    console.log('❌ Connection status error:', e.message);
}

// Try to check own user info
try {
    var userInfo = db.runCommand({usersInfo: 'siteAdmin'});
    if (userInfo.users && userInfo.users.length > 0) {
        console.log('✅ Current siteAdmin roles:');
        console.log(JSON.stringify(userInfo.users[0].roles, null, 2));
    }
} catch (e) {
    console.log('❌ Cannot check user info:', e.message);
}
"

echo "=== Testing dump_app database access ==="

# Test dump_app access with siteAdmin
mongosh "mongodb://siteAdmin:SuperSicheresPasswortFuerMongoDb@localhost:27017/dump_app?authSource=admin" --eval "
console.log('=== Testing dump_app access as siteAdmin ===');

try {
    // Test basic connection
    var status = db.runCommand({connectionStatus: 1});
    console.log('✅ Connected to dump_app database');
    
    // Test read permission
    var result = db.devices.findOne();
    console.log('✅ Can read from devices collection');
    
    // Test write permission
    var testDoc = {
        deviceId: 'test-' + new Date().getTime(),
        testField: 'permission-test',
        createdAt: new Date()
    };
    var insertResult = db.devices.insertOne(testDoc);
    console.log('✅ Can write to devices collection');
    
    // Clean up test document
    db.devices.deleteOne({_id: insertResult.insertedId});
    console.log('✅ Can delete from devices collection');
    
    console.log('🎉 ALL PERMISSIONS ARE WORKING!');
    console.log('The issue may be with your application connection string or environment variables.');
    
} catch (e) {
    console.log('❌ Permission test failed:', e.message);
    console.log('This confirms the siteAdmin user lacks permissions for dump_app database.');
}
"

echo "=== Checking if we can self-grant permissions ==="

# Try to grant permissions to self (this usually doesn't work but worth trying)
mongosh "mongodb://siteAdmin:SuperSicheresPasswortFuerMongoDb@localhost:27017/admin?authSource=admin" --eval "
try {
    db.grantRolesToUser('siteAdmin', [
        { role: 'readWrite', db: 'dump_app' },
        { role: 'dbAdmin', db: 'dump_app' }
    ]);
    console.log('✅ Successfully granted permissions to siteAdmin');
} catch (e) {
    console.log('❌ Cannot self-grant permissions:', e.message);
    console.log('You need an admin user to grant permissions to siteAdmin.');
}
"

EOF

echo "🎉 Final MongoDB diagnosis completed!"
echo ""
echo "NEXT STEPS:"
echo "1. If the permissions test PASSED, the issue is in your application configuration"
echo "2. If the permissions test FAILED, you need an admin user to grant permissions"
echo "3. Check the output above to determine which case applies"
