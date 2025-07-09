#!/bin/bash

echo "🔧 Simple MongoDB Permission Fix"
echo "This will connect with authentication and fix permissions"

# SSH and connect with proper authentication
ssh deploy@89.58.28.241 << 'EOF'

echo "=== Connecting to MongoDB with authentication ==="

# Try to connect as admin user (assuming there's an admin user)
mongosh admin --username admin --password --eval "
console.log('=== Connected as admin ===');

// Check if siteAdmin user exists
try {
    var existingUser = db.getUser('siteAdmin');
    console.log('✅ siteAdmin user exists with roles:', JSON.stringify(existingUser.roles));
} catch (e) {
    console.log('❌ siteAdmin user does not exist or error:', e.message);
}

// Update or create siteAdmin user with proper permissions
try {
    db.updateUser('siteAdmin', {
        roles: [
            { role: 'readWrite', db: 'dump_app' },
            { role: 'dbAdmin', db: 'dump_app' },
            { role: 'userAdmin', db: 'dump_app' }
        ]
    });
    console.log('✅ Updated siteAdmin user permissions');
} catch (e) {
    console.log('❌ Failed to update user, trying to create:', e.message);
    
    try {
        db.createUser({
            user: 'siteAdmin',
            pwd: 'SuperSicheresPasswortFuerMongoDb',
            roles: [
                { role: 'readWrite', db: 'dump_app' },
                { role: 'dbAdmin', db: 'dump_app' },
                { role: 'userAdmin', db: 'dump_app' }
            ]
        });
        console.log('✅ Created siteAdmin user with permissions');
    } catch (createError) {
        console.log('❌ Failed to create user:', createError.message);
    }
}

// Verify final permissions
try {
    var finalUser = db.getUser('siteAdmin');
    console.log('✅ Final user verification:');
    console.log('Roles:', JSON.stringify(finalUser.roles, null, 2));
} catch (e) {
    console.log('❌ Final verification failed:', e.message);
}
"

echo "=== Testing permissions as siteAdmin ==="

# Test with siteAdmin credentials
mongosh dump_app --username siteAdmin --password SuperSicheresPasswortFuerMongoDb --eval "
console.log('=== Testing siteAdmin permissions ===');

try {
    // Test read
    var result = db.devices.findOne();
    console.log('✅ Can read from devices collection');
    
    // Test write
    var testDoc = {
        deviceId: 'test-' + new Date().getTime(),
        testField: 'permission-test',
        createdAt: new Date()
    };
    var insertResult = db.devices.insertOne(testDoc);
    console.log('✅ Can write to devices collection');
    
    // Clean up
    db.devices.deleteOne({_id: insertResult.insertedId});
    console.log('✅ Can delete from devices collection');
    
    console.log('🎉 ALL PERMISSIONS WORKING!');
} catch (e) {
    console.log('❌ Permission test failed:', e.message);
}
"

EOF

echo "🎉 Simple MongoDB fix completed!"
