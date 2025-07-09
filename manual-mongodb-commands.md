# Manual MongoDB Permission Fix Commands

Since the automated scripts require admin authentication, here are the manual commands you can run directly on your MongoDB server.

## Option 1: If you have admin user credentials

SSH into your server and run these commands with your admin credentials:

```bash
ssh deploy@89.58.28.241

# Connect as admin user (replace 'admin' and password as needed)
mongosh admin --username admin --password

# Once connected, run these commands:
use admin

# Check existing siteAdmin user
db.getUser('siteAdmin')

# Update siteAdmin user with proper permissions
db.updateUser('siteAdmin', {
  roles: [
    { role: 'readWrite', db: 'dump_app' },
    { role: 'dbAdmin', db: 'dump_app' },
    { role: 'userAdmin', db: 'dump_app' }
  ]
})

# Verify the update
db.getUser('siteAdmin')

# Test the permissions
use dump_app
db.devices.findOne()
```

## Option 2: If MongoDB has no authentication enabled

If your MongoDB instance doesn't require authentication:

```bash
ssh deploy@89.58.28.241

# Connect without authentication
mongosh admin

# Run the same commands as above
use admin
db.updateUser('siteAdmin', {
  roles: [
    { role: 'readWrite', db: 'dump_app' },
    { role: 'dbAdmin', db: 'dump_app' }
  ]
})
```

## Option 3: Direct connection string approach

Try connecting directly with the siteAdmin user to test current permissions:

```bash
ssh deploy@89.58.28.241

# Test current siteAdmin permissions
mongosh "mongodb://siteAdmin:SuperSicheresPasswortFuerMongoDb@localhost:27017/dump_app?authSource=admin"

# If this works, try:
db.devices.findOne()
```

## Option 4: Check MongoDB configuration

Check if authentication is enabled:

```bash
ssh deploy@89.58.28.241

# Check MongoDB config
cat /etc/mongod.conf | grep -A 5 security

# Check if MongoDB is running with auth
ps aux | grep mongod
```

## Option 5: Restart MongoDB without authentication (temporary)

If you have sudo access:

```bash
ssh deploy@89.58.28.241

# Stop MongoDB
sudo systemctl stop mongod

# Start MongoDB without auth (temporarily)
sudo mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork --noauth

# Connect and fix permissions
mongosh admin
db.updateUser('siteAdmin', {
  roles: [
    { role: 'readWrite', db: 'dump_app' },
    { role: 'dbAdmin', db: 'dump_app' }
  ]
})

# Stop the temporary instance
sudo pkill mongod

# Restart normal service
sudo systemctl start mongod
```

## What to look for

When you run these commands, you should see:
- ✅ User exists and has roles
- ✅ Can connect to dump_app database
- ✅ Can read from devices collection
- ✅ Can write to devices collection

If any of these fail, note the exact error message for further troubleshooting.
