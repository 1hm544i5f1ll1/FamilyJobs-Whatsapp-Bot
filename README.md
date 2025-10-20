# WhatsApp Web Chatbot - Family Jobs Egypt

A bilingual (Arabic/English) WhatsApp Web chatbot with RAG (Retrieval Augmented Generation) capabilities for Family Jobs Egypt - Assiut Branch.

## Features

- 🤖 **Bilingual Support**: Responds in both Arabic and English
- 🧠 **RAG Integration**: Uses OpenAI embeddings for intelligent responses
- 📱 **WhatsApp Web Integration**: Built with whatsapp-web.js
- 🔍 **Language Detection**: Automatically detects Arabic vs English
- 📊 **Admin Dashboard**: Web interface for managing content
- 🔒 **Security**: Basic authentication and rate limiting
- 📝 **Logging**: Comprehensive logging with Winston

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for testing)
- OpenAI API key
- Twilio account (for testing)
- WhatsApp account for QR code scanning

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Chatbot
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies (for testing)**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your credentials:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ADMIN_USER=admin
   ADMIN_PASS=your_secure_password
   PORT=8080
   NODE_ENV=development
   LOG_LEVEL=info
   ```

5. **Create data directory and files**
   ```bash
   mkdir -p data
   # The data files are already created with sample content
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

This will start both the server and admin UI concurrently.

### Production Mode
```bash
npm run build
npm start
```

### Individual Components
```bash
# Server only
npm run dev:server

# Admin UI only
npm run dev:admin
```

## Testing with Twilio

### Setup Twilio Testing

1. **Get Twilio credentials**
   - Sign up at [Twilio Console](https://console.twilio.com/)
   - Get your Account SID and Auth Token
   - Enable WhatsApp Sandbox

2. **Set environment variables**
   ```bash
   export TWILIO_ACCOUNT_SID='your_account_sid'
   export TWILIO_AUTH_TOKEN='your_auth_token'
   export TWILIO_WHATSAPP_NUMBER='whatsapp:+14155238886'
   export TEST_PHONE_NUMBER='whatsapp:+your_phone_number'
   ```

3. **Run the test script**
   ```bash
   python test_whatsapp.py
   ```

### Test Features

The test script will:
- ✅ Send greeting messages in both languages
- ✅ Test command responses (about, projects)
- ✅ Test RAG functionality with various questions
- ✅ Monitor webhook responses
- ✅ Generate comprehensive test reports

## Usage

### WhatsApp Web Setup

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Scan QR Code**
   - A QR code will appear in the terminal
   - Scan it with your WhatsApp mobile app
   - The bot will be ready when you see "WhatsApp client is ready!"

3. **Test the bot**
   - Send any message to the bot
   - Try commands like "about", "projects", "عن", "المشاريع"
   - Ask questions about services, company info, etc.

### Admin Dashboard

1. **Access the dashboard**
   - Open http://localhost:8080 in your browser
   - Use the admin credentials from your .env file

2. **Manage content**
   - Update source text for RAG responses
   - Modify about text in both languages
   - Send test messages
   - Monitor system status

## API Endpoints

### Public Endpoints
- `GET /healthz` - Health check

### Admin Endpoints (require authentication)
- `GET /api/admin/status` - System status
- `GET /api/admin/source` - Get source text
- `POST /api/admin/source` - Update source text
- `GET /api/admin/about/:language` - Get about text
- `POST /api/admin/about/:language` - Update about text
- `POST /api/admin/test-message` - Send test message

## Project Structure

```
├── src/
│   ├── admin/          # Admin dashboard routes
│   ├── lang/           # Language detection
│   ├── rag/            # RAG functionality
│   ├── utils/          # Utilities (logging, state, etc.)
│   ├── wa/             # WhatsApp client
│   └── index.ts        # Main server file
├── data/               # Data files (source text, about text)
├── logs/               # Log files
├── test_whatsapp.py    # Python test script
├── requirements.txt    # Python dependencies
└── package.json        # Node.js dependencies
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for embeddings | Required |
| `ADMIN_USER` | Admin username | admin |
| `ADMIN_PASS` | Admin password | change-me |
| `PORT` | Server port | 8080 |
| `NODE_ENV` | Environment | development |
| `LOG_LEVEL` | Logging level | info |

### Data Files

- `data/source.txt` - Main content for RAG responses
- `data/about.en.txt` - English about text
- `data/about.ar.txt` - Arabic about text
- `data/state.json` - Application state (auto-generated)

## Troubleshooting

### Common Issues

1. **QR Code not appearing**
   - Check if Puppeteer is properly installed
   - Try running with `--no-sandbox` flag

2. **OpenAI API errors**
   - Verify your API key is correct
   - Check your OpenAI account credits

3. **WhatsApp connection issues**
   - Ensure your phone has internet connection
   - Try clearing WhatsApp Web sessions
   - Restart the application

4. **Test script not working**
   - Verify Twilio credentials
   - Check phone number format (include country code)
   - Ensure webhook URL is accessible

### Logs

Check the `logs/` directory for detailed error logs:
- `error-YYYY-MM-DD.log` - Error logs
- `combined-YYYY-MM-DD.log` - All logs
- `exceptions.log` - Uncaught exceptions

## Development

### Adding New Features

1. **New commands**: Add to `src/wa/client.ts` in the `handleMessage` function
2. **New API endpoints**: Add to `src/admin/router.ts`
3. **New utilities**: Add to `src/utils/`
4. **New RAG sources**: Update `src/rag/search.ts`

### Testing

```bash
# Run TypeScript compiler
npm run build

# Run linter
npm run lint

# Run tests
npm test
```

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t whatsapp-bot .

# Run container
docker run -p 8080:8080 --env-file .env whatsapp-bot
```

### Production Considerations

- Set `NODE_ENV=production`
- Use a proper database for state management
- Set up proper logging and monitoring
- Configure reverse proxy (nginx)
- Set up SSL certificates
- Use environment-specific configurations

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the logs in `logs/` directory
- Review the troubleshooting section
- Create an issue in the repository

---

**Note**: This bot is designed for Family Jobs Egypt - Assiut Branch. Modify the content in `data/` files to customize for your organization.
