#!/usr/bin/env node
/**
 * Verify Gmail Message Script
 * Fetches the message from Gmail API to verify it was sent
 */

const crypto = require('crypto');
const fs = require('fs');

const SERVICE_ACCOUNT_KEY_PATH = '/Users/ankitkumarsingh/hushh-github-notifier-key.json';
const MESSAGE_ID = '19b5b283f999d431';
const USER_EMAIL = 'ankit@hushh.ai';

function base64urlEncode(data) {
  const base64 = Buffer.from(data).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    sub: USER_EMAIL,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: exp,
    scope: 'https://www.googleapis.com/auth/gmail.readonly'
  };

  const signatureInput = `${base64urlEncode(JSON.stringify(header))}.${base64urlEncode(JSON.stringify(payload))}`;
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(serviceAccount.private_key);
  const encodedSignature = base64urlEncode(signature);
  
  const jwt = `${signatureInput}.${encodedSignature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Token error:', JSON.stringify(data, null, 2));
    throw new Error(`Failed to get token: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

async function getMessage(accessToken, messageId) {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  const data = await response.json();
  return { status: response.status, data };
}

async function listSentMessages(accessToken) {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=in:sent&maxResults=5`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  const data = await response.json();
  return { status: response.status, data };
}

async function main() {
  console.log('=== Gmail Message Verification ===\n');
  
  // Load service account
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_KEY_PATH, 'utf-8'));
  console.log('Service Account:', serviceAccount.client_email);
  console.log('Client ID:', serviceAccount.client_id);
  console.log('Impersonating:', USER_EMAIL);
  console.log('Message ID to find:', MESSAGE_ID);
  console.log('');

  try {
    // Get access token
    console.log('1. Getting access token...');
    const accessToken = await getAccessToken(serviceAccount);
    console.log('   ✅ Access token obtained successfully');
    console.log('');

    // Try to fetch the specific message
    console.log(`2. Fetching message ${MESSAGE_ID}...`);
    const messageResult = await getMessage(accessToken, MESSAGE_ID);
    
    if (messageResult.status === 200) {
      console.log('   ✅ Message found!');
      console.log('   Message data:', JSON.stringify(messageResult.data.payload?.headers?.filter(h => 
        ['From', 'To', 'Subject', 'Date'].includes(h.name)
      ), null, 2));
    } else {
      console.log('   ❌ Message not found');
      console.log('   Error:', JSON.stringify(messageResult.data, null, 2));
    }
    console.log('');

    // List recent sent messages
    console.log('3. Listing recent sent messages...');
    const sentResult = await listSentMessages(accessToken);
    
    if (sentResult.status === 200 && sentResult.data.messages) {
      console.log(`   Found ${sentResult.data.messages.length} recent sent messages`);
      for (const msg of sentResult.data.messages.slice(0, 3)) {
        console.log(`   - ${msg.id}`);
      }
    } else {
      console.log('   No sent messages found or error:', JSON.stringify(sentResult.data, null, 2));
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('unauthorized_client')) {
      console.log('\n⚠️  Domain-Wide Delegation might not be working correctly!');
      console.log('   Please verify in Google Admin Console:');
      console.log('   1. Go to admin.google.com > Security > API Controls > Domain-wide delegation');
      console.log('   2. Ensure Client ID 115893683073531844743 has scope:');
      console.log('      https://www.googleapis.com/auth/gmail.send');
      console.log('      https://www.googleapis.com/auth/gmail.readonly');
    }
  }
}

main();
