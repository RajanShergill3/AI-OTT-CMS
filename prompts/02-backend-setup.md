# Day 2 – Backend Foundation Setup

**Date:** 08 July 2026

**Objective:**
Build a production-ready backend foundation for the AI Powered OTT Content Management System.

---

# Prompt 1 – Backend Project Initialization

You are a Senior Node.js Software Architect.

Create a production-ready backend project for an AI Powered OTT Content Management System.

Technology Stack:

- Node.js 22 LTS
- Express
- TypeScript
- MongoDB (Mongoose)
- JWT Authentication
- dotenv
- bcrypt
- cors
- helmet
- morgan
- compression
- express-rate-limit

Requirements:

- Generate package.json
- Configure TypeScript
- Configure tsconfig.json
- Configure npm scripts
- Use ES Modules
- Follow MVC architecture
- Explain every dependency added
- Do not generate APIs yet

---

# Prompt 2 – Backend Folder Structure

Create an enterprise-grade backend folder structure.

Include:

src/
config/
controllers/
database/
middleware/
models/
routes/
services/
validators/
utils/
types/
constants/

Generate placeholder index.ts files where appropriate.

Explain the responsibility of every folder.

---

# Prompt 3 – Environment Configuration

Create a production-ready environment configuration.

Generate:

.env.example

Environment Loader

Configuration Module

Validate required environment variables.

Include:

PORT

NODE_ENV

MONGODB_URI

JWT_SECRET

JWT_EXPIRES_IN

REFRESH_TOKEN_SECRET

REFRESH_TOKEN_EXPIRES_IN

CLIENT_URL

API_PREFIX

RATE_LIMIT_WINDOW_MS

RATE_LIMIT_MAX_REQUESTS

Fail application startup if mandatory variables are missing.

---

# Prompt 4 – MongoDB Connection

Create a production-ready MongoDB connection module.

Requirements:

- Use latest stable Mongoose
- Use only documented public Mongoose APIs
- Do not use undocumented exports
- Separate configuration from connection logic
- Graceful shutdown
- SIGINT handling
- SIGTERM handling
- Connection logging
- Reconnection handling
- Disconnect handling
- Export connectDatabase()
- Export disconnectDatabase()
- Export getDatabaseStatus()

---

# Prompt 5 – Express Application Setup

Create the Express application.

Configure:

helmet

cors

compression

express.json()

express.urlencoded()

morgan

Rate Limiter

404 Handler

Global Error Handler

Version APIs using:

/api/v1

Generate:

app.ts

server.ts

Follow production best practices.

---

# Prompt 6 – Health Check API

Create:

GET /api/v1/health

Return:

status

uptime

timestamp

environment

node version

application version

Return HTTP 200.

Use controller, service and route separation.

---

# Prompt 7 – Logging

Implement production-grade logging using Winston.

Generate:

logger.ts

Console logger

File logger

Request logging middleware

Log levels:

info

warn

error

debug

Explain the logging strategy.

---

# Prompt 8 – ESLint + Prettier

Configure:

ESLint

Prettier

TypeScript

Import ordering

Unused variable detection

Consistent formatting

Generate:

.eslintrc

.prettierrc

.prettierignore

Explain the chosen rules.

---

# Prompt 9 – Backend README

Generate a professional backend README.

Include:

Overview

Architecture

Folder Structure

Installation

Environment Variables

Running Locally

Scripts

Technology Stack

API Versioning

Future Modules

---

# Fix Prompt – MongoDB Connection

The MongoDB connection module is using undocumented or invalid Mongoose APIs.

Refactor the connection module.

Requirements:

- Use latest Mongoose version
- Use only official documented APIs
- Remove invalid imports
- Improve graceful shutdown
- Improve logging
- Keep TypeScript strict mode compatible

---


Status:
Completed successfully.