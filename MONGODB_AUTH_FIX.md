# MongoDB Authorization Error Fix

## Problem
The application is experiencing a MongoDB authorization error:
```
MongoServerError: not authorized on dump_app to execute command { find: "devices", ... }
```

This error occurs because the MongoDB user doesn't have the necessary permissions to perform operations on the `dump_app` database.

## Root Cause
The MongoDB user specified in your `MONGODB_URI` connection string lacks the required permissions for the `dump_app` database. This typically happens when:

1. The user was created with limited permissions
2. The database name in the connection string doesn't match the actual database permissions
3. The user was granted permissions to a different database name

**CONFIRMED ISSUE**: Your `siteAdmin` user can connect to MongoDB but lacks `readWrite` permissions for the `dump_app` database.

## Solutions

### Solution 1: Update MongoDB User Permissions (Recommended)

If you're using MongoDB Atlas:

1. **Log into MongoDB Atlas**
2. **Go to Database Access**
3. **Find your database user**
4. **Edit the user**
5. **Update Database User Privileges:**
   - Select "Built-in Role"
   - Choose "Read and write to any database" OR
   - Choose "Custom" and add specific permissions:
     - Database: `dump_app`
     - Collection: `devices`
     - Actions: `find`, `insert`, `update`, `delete`

If you're using a self-hosted MongoDB:

```javascript
// Connect to MongoDB as admin
use admin

// Create or update user with proper permissions
db.createUser({
  user: "your_username",
  pwd: "your_password",
  roles: [
    {
      role: "readWrite",
      db: "dump_app"
    }
  ]
})

// Or update existing user
db.updateUser("your_username", {
  roles: [
    {
      role: "readWrite", 
      db: "dump_app"
    }
  ]
})
```

### Solution 2: Update Connection String

Ensure your `MONGODB_URI` in the `.env` file is correctly formatted:

```bash
# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dump_app?retryWrites=true&w=majority

# For self-hosted MongoDB
MONGODB_URI=mongodb://username:password@localhost:27017/dump_app
```

### Solution 3: Verify Database Name Consistency

Ensure all functions use the same database name. The following files have been updated to use `dump_app`:

- `netlify/functions/get-device-data.ts`
- `netlify/functions/update-device-data.ts`
- `netlify/functions/delete-device-data.ts`
- `netlify/functions/get-data-usage.ts`

## Enhanced Error Handling

The `get-device-data.ts` function has been updated with:

1. **Better error detection** for authorization issues
2. **Timeout handling** for connection and query operations
3. **Enhanced connection options** for reliability
4. **Proper connection cleanup** in finally blocks

## Testing the Fix

After implementing the solution:

1. **Deploy the updated functions**
2. **Test the API endpoints**
3. **Check the logs** for any remaining authorization errors

## Environment Variables

Ensure these environment variables are set in your Netlify deployment:

```bash
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB_NAME=dump_app
```

## Additional Debugging

If issues persist, add temporary logging to check:

```typescript
console.log('Database name:', dbName)
console.log('MongoDB URI (masked):', mongoUri.replace(/\/\/.*@/, '//***:***@'))
```

## Security Notes

- Never commit your actual MongoDB connection string to version control
- Use environment variables for all sensitive configuration
- Regularly rotate database passwords
- Use the principle of least privilege for database users
