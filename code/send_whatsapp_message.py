#!/usr/bin/env python3
"""
Simple script to send WhatsApp messages via Twilio to your own number
"""

import os
from twilio.rest import Client

# Configuration - Replace with your actual values
TWILIO_ACCOUNT_SID = 'your_twilio_account_sid_here'
TWILIO_AUTH_TOKEN = 'your_twilio_auth_token_here'
TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886'  # Twilio sandbox number
YOUR_PHONE_NUMBER = 'whatsapp:+your_phone_number_here'  # Your phone number with country code

def send_whatsapp_message(message, to_number=None):
    """Send a WhatsApp message via Twilio"""
    
    if to_number is None:
        to_number = YOUR_PHONE_NUMBER
    
    try:
        # Initialize Twilio client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Send message
        message_obj = client.messages.create(
            body=message,
            from_=TWILIO_WHATSAPP_NUMBER,
            to=to_number
        )
        
        print(f"✅ Message sent successfully!")
        print(f"   Message: {message}")
        print(f"   To: {to_number}")
        print(f"   SID: {message_obj.sid}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending message: {str(e)}")
        return False

def main():
    """Main function to send test messages"""
    
    print("🚀 WhatsApp Message Sender")
    print("=" * 40)
    
    # Check if credentials are set
    if TWILIO_ACCOUNT_SID == 'your_twilio_account_sid_here':
        print("❌ Please set your Twilio credentials in the script:")
        print("   1. Get your Account SID and Auth Token from https://console.twilio.com/")
        print("   2. Update TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in this script")
        print("   3. Update YOUR_PHONE_NUMBER with your phone number (include country code)")
        print("   4. Join the Twilio WhatsApp sandbox by sending 'join <sandbox-code>' to +1 415 523 8886")
        return
    
    # Test messages
    test_messages = [
        "Hello! This is a test message from the WhatsApp bot.",
        "مرحباً! هذه رسالة تجريبية من بوت الواتساب.",
        "Testing the bot functionality...",
        "اختبار وظائف البوت...",
        "The bot is working correctly!",
        "البوت يعمل بشكل صحيح!"
    ]
    
    print(f"📤 Sending {len(test_messages)} test messages to {YOUR_PHONE_NUMBER}")
    print()
    
    success_count = 0
    for i, message in enumerate(test_messages, 1):
        print(f"📤 Sending message {i}/{len(test_messages)}: {message[:50]}...")
        
        if send_whatsapp_message(message):
            success_count += 1
        
        print()  # Empty line for readability
    
    print("=" * 40)
    print(f"📊 Results: {success_count}/{len(test_messages)} messages sent successfully")
    
    if success_count == len(test_messages):
        print("🎉 All messages sent successfully!")
    else:
        print("⚠️  Some messages failed to send. Check your Twilio credentials and phone number.")

if __name__ == "__main__":
    main()
