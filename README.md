# WhatsApp Group Manager Bot

## 🤖 Overview

Automated WhatsApp group management system with real-time blacklist enforcement, membership tracking, and webhook-based event processing.

## 📋 Description

A WhatsApp bot that automatically manages group membership and enforces blacklist rules in real-time.

## 🎯 Purpose

This project demonstrates my ability to architect and build a complete backend system from scratch, integrating multiple technologies and services. The main goals were to:

- **Master Backend Architecture**: Design a webhook-driven microservices architecture
- **Implement Real-time Processing**: Handle WhatsApp events with immediate automated responses
- **Database Design**: Create normalized schemas with proper relationships and indexing
- **API Integration**: Work with third-party APIs (Evolution API) for WhatsApp connectivity
- **Learn Docker**: Containerize a multi-service application stack
- **AI-Assisted Development**: Leverage modern AI tools to accelerate development

## 🛠️ Tech Stack

**Backend**

- Node.js
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL (2 instances)
- Redis

**WhatsApp Integration**

- Evolution API
- Ngrok

**Infrastructure**

- Docker
- Docker Compose

**AI / Tools**

- Claude
- VSCode with Copilot
- GitHub Copilot Agents

## ✨ Features

### **Core Functionality**

- ✅ **Webhook Processing** - Handle events from Evolution API
- ✅ **Blacklist Management** - Add users to blacklist with automatic group removal
- ✅ **Real-time Enforcement** - Automatically remove blacklisted users when they join groups
- ✅ **Membership Tracking** - Comprehensive database of all group members
- ✅ **Membership Clean-up** - Manually initiate a clean-up process to remove inactive members

## 🏗️ Architecture

### **System Components**

```
┌─────────────────────────────────────────────────────┐
│                  Internet/WhatsApp                  │
└─────────────────┬───────────────────────────────────┘
                  │
         ┌────────▼────────┐
         │   Evolution API  │
         │  (WhatsApp Web)  │
         └────────┬────────┘
                  │ Webhooks (via Ngrok)
         ┌────────▼────────┐
         │  Express Server  │
         │   (Bot Logic)    │
         └────┬────┬────┬──┘
              │    │    │
      ┌───────┘    │    └────────┐
      ▼            ▼             ▼
┌──────────┐  ┌─────────┐  ┌──────────┐
│ Bot DB   │  │Evolution│  │  Redis   │
│(Postgres)│  │   DB    │  │ (Cache)  │
└──────────┘  └─────────┘  └──────────┘
```

## 🚀 Getting Started

### **Prerequisites**

```bash
- Node.js 18+
- Docker & Docker Compose
- Git
- Ngrok account (free tier)
```

### **Installation**

```bash
# Clone the repository
git clone https://github.com/baltasarsolanilla/whatsapp-group-manager-bot.git
cd whatsapp-group-manager-bot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your environment variables
nano .env
```

### **Running the Application**

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f whatsapp-bot

# Access Prisma Studio for database management
npm run studio
# Opens at http://localhost:5555

# Run database migrations
npx prisma migrate dev

# Stop all services
docker-compose down
```

### **Setting Up Ngrok**

```bash
# Install ngrok
npm install -g ngrok

# Authenticate with your token
ngrok config add-authtoken YOUR_NGROK_TOKEN

# Start ngrok tunnel
ngrok http 3000

# Copy the public URL and configure it in Evolution API webhook settings
```

## 🎓 Learning Outcomes

This project taught me:

- How to architect a complete backend system from requirements to implementation
- Implementing real-time event processing with webhooks
- Docker and containerization for local development
- Writing comprehensive technical specifications (using AI to accelerate documentation)
- Database design with data consistency

## Notes

This project is meant purely for demonstration and skills practice.

Optionally, you can check out the [GitHub project](https://github.com/users/baltasarsolanilla/projects/3)

## 🔗 Links

- **GitHub Repository**: [whatsapp-group-manager-bot](https://github.com/baltasarsolanilla/whatsapp-group-manager-bot)
- **Evolution API Repository**: [Evolution API](https://github.com/EvolutionAPI/evolution-api)

## License

This project is licensed under the [MIT License](LICENSE)..
