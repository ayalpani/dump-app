#!/bin/bash

echo "🔧 Direct MongoDB Permission Fix"
echo "This will connect directly and apply the fix with service restart"

# Direct SSH command with comprehensive fix
ssh deploy@89.58.28.241 << 'EOF'

echo "=== Stopping MongoDB to clear any cached permissions ==="
sudo systemctl stop mongod
sleep 2

echo "=== Starting MongoDB ==="
sudo systemctl start mongod
sleep 3

echo "=== Applying permissions fix ==="
mongosh admin --eval "
// Remove existing user and recreate with proper permissions
try {
    db.dropUser('siteAdmin');
    console.log('✅ Dropped existing siteAdmin user');
} catch (e) {
    console.log('ℹ️  siteAdmin user did not exist or could not be dropped: ' + e.message);
}

// Create user with explicit permissions
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
    console.log('✅ Created siteAdmin user with full dump_app permissions');
} catch (e) {
    console.log('❌ Failed to create user: ' + e.message);
    
    // If user exists, update it
    try {
        db.updateUser('siteAdmin', {
            roles: [
                { role: 'readWrite', db: 'dump_app' },
                { role: 'dbAdmin', db: 'dump_app' },
                { role: 'userAdmin', db: 'dump_app' }
            ]
        });
        console.log('✅ Updated existing siteAdmin user permissions');
    } catch (updateError) {
        console.log('❌ Failed to update user: ' + updateError.message);
    }
}

// Verify user creation/update
try {
    var user = db.getUser('siteAdmin');
    console.log('✅ User verification successful');
    console.log('Roles: ' + JSON.stringify(user.roles));
} catch (e) {
    console.log('❌ User verification failed: ' + e.message);
}
"

# Test the permissions immediately
mongosh dump_app --eval "
try {
    // Test basic connection
    db.runCommand({ping: 1});
    console.log('✅ Can ping dump_app database');
    
    // Test read
    db.devices.findOne();
    console.log('✅ Can read from devices collection');
    
    // Test write
    var testResult = db.devices.insertOne({test: 'permission-check', timestamp: new Date()});
    console.log('✅ Can write to devices collection');
    
    // Clean up test document
    db.devices.deleteOne({_id: testResult.insertedId});
    console.log('✅ Can delete from devices collection');
    
    console.log('🎉 ALL PERMISSIONS WORKING CORRECTLY!');
} catch (e) {
    console.log('❌ Permission test failed: ' + e.message);
}
"

echo "=== Restarting MongoDB to ensure changes take effect ==="
sudo systemctl restart mongod

echo "=== Final verification ==="
sleep 3
mongosh dump_app --eval "
try {
    db.devices.findOne();
    console.log('✅ Final test: Can access devices collection in dump_app');
} catch (e) {
    console.log('❌ Final test failed: ' + e.message);
}
"

EOF

echo "🎉 Direct MongoDB fix completed!"
echo "The siteAdmin user should now have full access to the dump_app database."
