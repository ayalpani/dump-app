#!/bin/bash

echo "🔍 Verifying MongoDB Permission Fix"
echo "Testing if the permissions are now working..."

# SSH and test the fixed permissions
ssh deploy@89.58.28.241 << 'EOF'

echo "=== Testing siteAdmin permissions after fix ==="

# Test dump_app access with siteAdmin after the fix
mongosh "mongodb://siteAdmin:SuperSicheresPasswortFuerMongoDb@localhost:27017/dump_app?authSource=admin" --eval "
console.log('=== Testing dump_app access after permission fix ===');

try {
    // Test basic connection
    var status = db.runCommand({connectionStatus: 1});
    console.log('✅ Connected to dump_app database');
    
    // Test read permission
    var result = db.devices.findOne();
    console.log('✅ Can read from devices collection');
    
    // Test write permission
    var testDoc = {
        deviceId: 'test-verification-' + new Date().getTime(),
        testField: 'permission-verification',
        createdAt: new Date()
    };
    var insertResult = db.devices.insertOne(testDoc);
    console.log('✅ Can write to devices collection');
    
    // Test update permission
    db.devices.updateOne(
        {_id: insertResult.insertedId}, 
        {\$set: {testField: 'updated-value'}}
    );
    console.log('✅ Can update documents in devices collection');
    
    // Clean up test document
    db.devices.deleteOne({_id: insertResult.insertedId});
    console.log('✅ Can delete from devices collection');
    
    console.log('🎉 ALL PERMISSIONS ARE NOW WORKING!');
    console.log('Your MongoDB authorization issue has been resolved.');
    
} catch (e) {
    console.log('❌ Permission test still failed:', e.message);
    console.log('The fix may not have taken effect yet. Try restarting your application.');
}
"

echo "=== Checking current user roles ==="

# Verify the roles were actually updated
mongosh "mongodb://siteAdmin:SuperSicheresPasswortFuerMongoDb@localhost:27017/admin?authSource=admin" --eval "
try {
    var userInfo = db.runCommand({usersInfo: 'siteAdmin'});
    if (userInfo.users && userInfo.users.length > 0) {
        console.log('✅ Updated siteAdmin roles:');
        console.log(JSON.stringify(userInfo.users[0].roles, null, 2));
    }
} catch (e) {
    console.log('❌ Cannot check user info:', e.message);
}
"

EOF

echo "🎉 Verification completed!"
echo ""
echo "If all tests passed above, your MongoDB authorization issue is RESOLVED!"
echo "You can now restart your Netlify dev server and test your application."
