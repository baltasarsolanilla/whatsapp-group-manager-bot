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
- PostgreSQL
- Redis

**WhatsApp Integration**

- Evolution API

**Infrastructure**

- AWS Lightsail + docker

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
- ✅ **Cancellable Job System** - Start, monitor, and cancel long-running removal workflows via API

For detailed information about the job system, see [docs/CANCELLABLE_JOBS.md](docs/CANCELLABLE_JOBS.md).

## 🏗️ Architecture

### **System Components**

```
┌─────────────────────────────────────────────────────┐
│                 Lightsail instance                  │
└─────────────────┬───────────────────────────────────┘
                  │
         ┌────────▼─────-───┐
         │   Evolution API  │
         │  (WhatsApp Web)  │
         └────────┬────-────┘
                  │ Webhooks (docker network)
         ┌────────▼───-─────┐
         │  Express Server  │
         │   (Bot Logic)    │
         └────----──────────┘
                  │
         ┌────────▼───-─────┐
         │    Postgres      |
         └────----──────────┘
```

## 🎓 Learning Outcomes

This project taught me:

- How to architect a complete backend system from requirements to implementation
- Implementing real-time event processing with webhooks
- Docker and containerization
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
