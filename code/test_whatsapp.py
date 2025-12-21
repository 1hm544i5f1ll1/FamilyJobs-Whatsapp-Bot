#!/usr/bin/env python3
"""
WhatsApp Web Test Script using Twilio
This script tests the WhatsApp Web functionality by sending messages via Twilio API
"""

import os
import time
import requests
import json
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
from flask import Flask, request
import threading

# Configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', 'your_twilio_account_sid')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', 'your_twilio_auth_token')
TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')
TEST_PHONE_NUMBER = os.getenv('TEST_PHONE_NUMBER', 'whatsapp:+1234567890')
WEBHOOK_URL = os.getenv('WEBHOOK_URL', 'https://your-ngrok-url.ngrok.io/webhook')

# Initialize Twilio client
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Flask app for webhook
app = Flask(__name__)

# Test results storage
test_results = {
    'messages_sent': 0,
    'messages_received': 0,
    'test_messages': [],
    'errors': []
}

def send_test_message(message, phone_number=TEST_PHONE_NUMBER):
    """Send a test message via Twilio WhatsApp API"""
    try:
        message_obj = client.messages.create(
            body=message,
            from_=TWILIO_WHATSAPP_NUMBER,
            to=phone_number
        )
        
        test_results['messages_sent'] += 1
        test_results['test_messages'].append({
            'timestamp': time.time(),
            'message': message,
            'status': 'sent',
            'sid': message_obj.sid
        })
        
        print(f"✅ Message sent: {message}")
        print(f"   SID: {message_obj.sid}")
        return True
        
    except Exception as e:
        error_msg = f"❌ Failed to send message: {str(e)}"
        print(error_msg)
        test_results['errors'].append({
            'timestamp': time.time(),
            'error': str(e),
            'message': message
        })
        return False

@app.route('/webhook', methods=['POST'])
def webhook():
    """Handle incoming WhatsApp messages from Twilio"""
    try:
        # Get the message details
        message_body = request.values.get('Body', '')
        from_number = request.values.get('From', '')
        
        print(f"📨 Received message from {from_number}: {message_body}")
        
        test_results['messages_received'] += 1
        test_results['test_messages'].append({
            'timestamp': time.time(),
            'message': message_body,
            'status': 'received',
            'from': from_number
        })
        
        # Create a response (optional)
        response = MessagingResponse()
        # You can add automated responses here if needed
        
        return str(response)
        
    except Exception as e:
        print(f"❌ Error handling webhook: {str(e)}")
        return str(MessagingResponse())

def run_webhook_server():
    """Run the webhook server in a separate thread"""
    print("🌐 Starting webhook server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False)

def test_basic_functionality():
    """Test basic WhatsApp functionality"""
    print("🧪 Starting WhatsApp Web functionality tests...")
    print("=" * 50)
    
    # Test 1: Send a simple greeting
    print("\n📤 Test 1: Sending greeting message...")
    send_test_message("Hello! This is a test message from the WhatsApp Web bot.")
    time.sleep(2)
    
    # Test 2: Send Arabic message
    print("\n📤 Test 2: Sending Arabic message...")
    send_test_message("مرحباً! هذه رسالة تجريبية من بوت واتساب ويب.")
    time.sleep(2)
    
    # Test 3: Send command message
    print("\n📤 Test 3: Sending command message...")
    send_test_message("about")
    time.sleep(2)
    
    # Test 4: Send projects command
    print("\n📤 Test 4: Sending projects command...")
    send_test_message("projects")
    time.sleep(2)
    
    # Test 5: Send Arabic command
    print("\n📤 Test 5: Sending Arabic command...")
    send_test_message("عن")
    time.sleep(2)
    
    # Test 6: Send question about services
    print("\n📤 Test 6: Sending service question...")
    send_test_message("What services do you offer?")
    time.sleep(2)
    
    # Test 7: Send Arabic question
    print("\n📤 Test 7: Sending Arabic question...")
    send_test_message("ما هي الخدمات التي تقدمونها؟")
    time.sleep(2)

def test_rag_functionality():
    """Test RAG (Retrieval Augmented Generation) functionality"""
    print("\n🤖 Testing RAG functionality...")
    print("=" * 50)
    
    # Test questions that should trigger RAG responses
    test_questions = [
        "Tell me about your company",
        "What industries do you serve?",
        "How can I find a job?",
        "What is your experience?",
        "عرفني عن شركتكم",
        "ما هي الصناعات التي تخدمونها؟",
        "كيف يمكنني العثور على وظيفة؟"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n📤 RAG Test {i}: {question}")
        send_test_message(question)
        time.sleep(3)  # Wait longer for RAG processing

def print_test_results():
    """Print comprehensive test results"""
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    print(f"📤 Messages Sent: {test_results['messages_sent']}")
    print(f"📨 Messages Received: {test_results['messages_received']}")
    print(f"❌ Errors: {len(test_results['errors'])}")
    
    if test_results['errors']:
        print("\n❌ ERRORS:")
        for error in test_results['errors']:
            print(f"   - {error['error']}")
    
    print(f"\n📝 Total Test Messages: {len(test_results['test_messages'])}")
    
    # Save results to file
    with open('test_results.json', 'w') as f:
        json.dump(test_results, f, indent=2)
    
    print("\n💾 Test results saved to test_results.json")

def main():
    """Main test function"""
    print("🚀 WhatsApp Web Test Suite")
    print("=" * 50)
    
    # Check environment variables
    if TWILIO_ACCOUNT_SID == 'your_twilio_account_sid':
        print("❌ Please set your Twilio credentials in environment variables:")
        print("   export TWILIO_ACCOUNT_SID='your_account_sid'")
        print("   export TWILIO_AUTH_TOKEN='your_auth_token'")
        print("   export TWILIO_WHATSAPP_NUMBER='whatsapp:+14155238886'")
        print("   export TEST_PHONE_NUMBER='whatsapp:+your_phone_number'")
        return
    
    # Start webhook server in background
    webhook_thread = threading.Thread(target=run_webhook_server, daemon=True)
    webhook_thread.start()
    
    # Wait for webhook server to start
    time.sleep(2)
    
    try:
        # Run tests
        test_basic_functionality()
        test_rag_functionality()
        
        # Wait for any remaining responses
        print("\n⏳ Waiting for responses...")
        time.sleep(10)
        
        # Print results
        print_test_results()
        
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
    finally:
        print("\n🏁 Test suite completed")

if __name__ == "__main__":
    main()
