# Twilio WhatsApp Setup Guide

## Step 1: Get Twilio Credentials

1. **Sign up for Twilio** (if you haven't already):
   - Go to [https://console.twilio.com/](https://console.twilio.com/)
   - Create a free account

2. **Get your credentials**:
   - Account SID: Found on the main dashboard
   - Auth Token: Found on the main dashboard (click to reveal)

## Step 2: Enable WhatsApp Sandbox

1. **Go to WhatsApp in Twilio Console**:
   - Navigate to "Messaging" → "Try it out" → "Send a WhatsApp message"
   - Or go directly to: [https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)

2. **Join the sandbox**:
   - You'll see a sandbox code (like "join <code>")
   - Send this message to: **+1 415 523 8886** from your WhatsApp
   - You'll receive a confirmation message

## Step 3: Update the Script

1. **Edit `send_whatsapp_message.py`**:
   ```python
   TWILIO_ACCOUNT_SID = 'your_actual_account_sid_here'
   TWILIO_AUTH_TOKEN = 'your_actual_auth_token_here'
   YOUR_PHONE_NUMBER = 'whatsapp:+1234567890'  # Your phone with country code
   ```

2. **Phone number format**:
   - Include country code (e.g., +1 for US, +20 for Egypt)
   - Format: `whatsapp:+1234567890`

## Step 4: Run the Script

```bash
# Install Python dependencies
pip install twilio

# Run the script
python send_whatsapp_message.py
```

## Step 5: Test with Your WhatsApp Bot

1. **Start your WhatsApp bot**:
   ```bash
   npm run dev
   ```

2. **Scan the QR code** with your phone

3. **Send test messages** using the Python script

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**:
   - Check your Account SID and Auth Token
   - Make sure they're correct and not expired

2. **"Phone number not found"**:
   - Make sure you've joined the sandbox
   - Check the phone number format (include country code)
   - Try sending the join message again

3. **"Message not delivered"**:
   - Check if the recipient has joined the sandbox
   - Make sure the phone number is correct
   - Try sending a simple message first

### Testing Steps:

1. **First, test with Twilio sandbox**:
   ```python
   python send_whatsapp_message.py
   ```

2. **Then test with your bot**:
   - Start the bot: `npm run dev`
   - Scan QR code
   - Send messages to the bot from your phone
   - Check if the bot responds

### Useful Commands:

```bash
# Check if your bot is running
curl http://localhost:8080/healthz

# Test admin interface
curl -u admin:change-me http://localhost:8080/api/admin/status

# Send test message via API
curl -X POST -u admin:change-me \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"whatsapp:+1234567890","message":"Test message"}' \
  http://localhost:8080/api/admin/test-message
```

## Next Steps

Once everything is working:

1. **Customize the bot responses** in `data/` files
2. **Add more test scenarios** in the Python script
3. **Deploy to production** when ready
4. **Set up proper webhooks** for production use

## Support

- Twilio Documentation: [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- Twilio Console: [https://console.twilio.com/](https://console.twilio.com/)
- WhatsApp Business API: [https://business.whatsapp.com/](https://business.whatsapp.com/)
