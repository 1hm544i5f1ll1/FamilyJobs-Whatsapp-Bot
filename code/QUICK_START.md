# 🚀 Quick Start Guide - Run Bot in 60 Seconds

## ⚡ Fastest Way to Run

### Step 1: Create `.env` file (REQUIRED)
You need an OpenAI API key. Create `.env` file:

```bash
# Copy the example
copy env.example .env
```

Then edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
ADMIN_USER=admin
ADMIN_PASS=change-me
PORT=8080
```

### Step 2: Run the Bot
```bash
npm run dev
```

This starts:
- ✅ Backend server on port 8080
- ✅ Admin dashboard on port 3000

### Step 3: Connect WhatsApp
1. Open http://localhost:3000 in browser
2. Login with: `admin` / `change-me`
3. Go to **Status** tab
4. Scan QR code with WhatsApp mobile app
5. Done! Bot is ready 🎉

---

## 🎯 Alternative: Run Server Only (Faster Startup)

If you only need the WhatsApp bot (no admin UI):

```bash
npm run dev:server
```

Then scan QR code from terminal output.

---

## 📝 What You Need

**Minimum Required:**
- ✅ Node.js 18+ (already installed)
- ✅ OpenAI API Key (get from https://platform.openai.com/api-keys)
- ✅ WhatsApp mobile app (for QR scanning)

**Optional:**
- Python 3.8+ (only for testing with Twilio)

---

## ⚠️ Troubleshooting

**No QR Code?**
- Check terminal for QR code (it prints there too)
- Make sure port 8080 is not in use

**OpenAI API Error?**
- Verify your API key in `.env` file
- Check you have credits in OpenAI account

**Port Already in Use?**
- Change `PORT=8080` to another port in `.env`
- Update vite.config.ts port 3000 if needed

---

## 🎉 You're Ready!

Once connected, test the bot:
- Send `about` or `عن` for company info
- Ask any question - bot will use RAG to answer
- Commands: `projects`, `services`, `المشاريع`, `الخدمات`

