# Encryption Setup Guide

## Overview

The application implements AES-256-GCM encryption for all API requests and responses. This provides both confidentiality and integrity for your API traffic.

## Environment Variables

Add the following variables to your `.env` file:

```env
# Encryption Configuration
# AES-256 Encryption Key (64 hex characters = 32 bytes)
# Generate a secure key using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_64_character_hex_key_here
# Enable/Disable encryption for all API requests and responses
ENABLE_ENCRYPTION=true
```

## Generating Encryption Key

To generate a secure encryption key, run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output a 64-character hexadecimal string. Copy this value to your `ENCRYPTION_KEY` environment variable.

## How It Works

### Request Flow
1. Client encrypts request body using AES-256-GCM
2. Client sends encrypted payload in format:
   ```json
   {
     "encrypted": "base64_encrypted_data",
     "iv": "base64_initialization_vector",
     "tag": "base64_authentication_tag"
   }
   ```
3. Server automatically decrypts the request body
4. Controller processes decrypted data normally

### Response Flow
1. Controller returns normal response data
2. Server automatically encrypts the response
3. Client receives encrypted payload
4. Client decrypts the response

## Client Implementation

### Encrypting Requests

```javascript
const crypto = require('crypto');

function encryptData(data, key) {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const keyBuffer = Buffer.from(key, 'hex');
  
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}
```

### Decrypting Responses

```javascript
function decryptData(payload, key) {
  const algorithm = 'aes-256-gcm';
  const keyBuffer = Buffer.from(key, 'hex');
  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const encrypted = Buffer.from(payload.encrypted, 'base64');
  
  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}
```

## Security Notes

1. **Key Management**: Never commit encryption keys to version control
2. **Key Rotation**: Rotate encryption keys periodically in production
3. **HTTPS**: Always use HTTPS in production to protect encrypted payloads in transit
4. **Key Storage**: Store encryption keys securely (use secret management services in production)

## Troubleshooting

### Encryption Not Working
- Ensure `ENABLE_ENCRYPTION=true` in your `.env` file
- Verify `ENCRYPTION_KEY` is set and is 64 hex characters
- Check server logs for encryption errors

### Decryption Failures
- Ensure client is using the same encryption key as the server
- Verify the encrypted payload format matches the expected structure
- Check that IV and tag are included in the payload

