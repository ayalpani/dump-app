#!/bin/bash

# MongoDB Permission Fix Script
# This script connects to your MongoDB server via SSH and fixes the permissions

echo "🔧 Fixing MongoDB permissions for dump_app database..."

# SSH into your MongoDB server and execute the MongoDB commands
ssh deploy@89.58.28.241 << 'EOF'
# Connect to MongoDB and fix permissions
mongosh --eval "
use admin;

// Grant readWrite permissions to siteAdmin for dump_app database
db.grantRolesToUser('siteAdmin', [
  {
    role: 'readWrite',
    db: 'dump_app'
  }
]);

print('✅ Granted readWrite permissions to siteAdmin for dump_app database');

// Verify the user's roles
var user = db.getUser('siteAdmin');
print('📋 Current user roles:');
printjson(user.roles);

// Test the permissions by switching to dump_app database
use dump_app;
try {
  db.devices.findOne();
  print('✅ Permission test successful - can read from devices collection');
} catch (e) {
  print('❌ Permission test failed:', e.message);
}
"
EOF

echo "🎉 MongoDB permissions fix completed!"
echo "Your siteAdmin user should now have readWrite access to the dump_app database."
