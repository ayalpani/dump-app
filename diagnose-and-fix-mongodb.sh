#!/bin/bash

# Comprehensive MongoDB Diagnostic and Fix Script
echo "🔍 Diagnosing MongoDB permissions issue..."

# SSH into your MongoDB server and run comprehensive diagnostics
ssh deploy@89.58.28.241 << 'EOF'
echo "=== MongoDB Diagnostic Report ==="

# Check if MongoDB is running
if pgrep mongod > /dev/null; then
    echo "✅ MongoDB service is running"
else
    echo "❌ MongoDB service is not running"
    sudo systemctl start mongod
fi

# Connect to MongoDB and run diagnostics
mongosh admin --eval "
console.log('=== Current Admin Users ===');
db.getUsers().forEach(function(user) {
    console.log('User: ' + user.user + ', Roles: ' + JSON.stringify(user.roles));
});

console.log('\n=== Checking siteAdmin user ===');
try {
    var siteAdmin = db.getUser('siteAdmin');
    if (siteAdmin) {
        console.log('✅ siteAdmin user exists');
        console.log('Current roles: ' + JSON.stringify(siteAdmin.roles));
    } else {
        console.log('❌ siteAdmin user does not exist');
    }
} catch (e) {
    console.log('❌ Error getting siteAdmin user: ' + e.message);
}

console.log('\n=== Attempting to fix permissions ===');

// Method 1: Update user roles completely
try {
    db.updateUser('siteAdmin', {
        roles: [
            { role: 'readWrite', db: 'dump_app' },
            { role: 'dbAdmin', db: 'dump_app' }
        ]
    });
    console.log('✅ Updated siteAdmin roles using updateUser');
} catch (e) {
    console.log('❌ updateUser failed: ' + e.message);
}

// Method 2: Grant additional roles
try {
    db.grantRolesToUser('siteAdmin', [
        { role: 'readWrite', db: 'dump_app' },
        { role: 'dbAdmin', db: 'dump_app' }
    ]);
    console.log('✅ Granted additional roles to siteAdmin');
} catch (e) {
    console.log('❌ grantRolesToUser failed: ' + e.message);
}

// Verify the changes
console.log('\n=== Verification ===');
try {
    var updatedUser = db.getUser('siteAdmin');
    console.log('Updated roles: ' + JSON.stringify(updatedUser.roles));
} catch (e) {
    console.log('❌ Error verifying user: ' + e.message);
}
"

# Test permissions on dump_app database
mongosh dump_app --eval "
console.log('\n=== Testing dump_app database permissions ===');

// Test read permission
try {
    db.runCommand({connectionStatus: 1});
    console.log('✅ Can connect to dump_app database');
} catch (e) {
    console.log('❌ Cannot connect to dump_app: ' + e.message);
}

// Test collection access
try {
    var result = db.devices.findOne();
    console.log('✅ Can read from devices collection');
} catch (e) {
    console.log('❌ Cannot read from devices collection: ' + e.message);
}

// Test write permission
try {
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
} catch (e) {
    console.log('❌ Cannot write to devices collection: ' + e.message);
}

console.log('\n=== Database and Collection Info ===');
try {
    console.log('Database stats:');
    console.log(JSON.stringify(db.stats(), null, 2));
    
    console.log('Collections in dump_app:');
    db.getCollectionNames().forEach(function(name) {
        console.log('- ' + name);
    });
} catch (e) {
    console.log('❌ Error getting database info: ' + e.message);
}
"

echo "=== Diagnostic completed ==="
EOF

echo "🎉 MongoDB diagnostic and fix completed!"
echo "Check the output above for any remaining issues."
