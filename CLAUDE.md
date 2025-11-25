# CLAUDE.md 

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AINmem is a Next.js 15 knowledge graph application that visualizes relationships between logical propositions. It uses FOL-SDK (First-Order Logic SDK) to build and manage knowledge graphs from user memories/chat logs.

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Build
npm run build        # Production build

# Production
npm start            # Start production server
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router) with React 19
- **Database**: MongoDB via Mongoose
- **Styling**: Tailwind CSS 4 with CSS Modules
- **Visualization**: D3.js for knowledge graph rendering
- **Blockchain**: AIN blockchain integration (@ainblockchain/ain-js) for wallet-based authentication
- **AI/NLP**: FOL-SDK with Gemini adapter for First-Order Logic extraction

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/app/api/` - API routes (REST endpoints)
- `src/app/components/` - Reusable UI components
- `src/contexts/` - React contexts (AuthContext for auth state)
- `src/app/lib/` - Utilities (MongoDB connection)
- `src/app/models/` - Mongoose models

### Core Data Flow
1. Users authenticate via wallet signature (ethers.js verification)
2. Chat logs are stored in MongoDB `chatlogs` collection
3. FOL-SDK processes documents to extract Constants, Facts, and Predicates
4. D3.js renders the knowledge graph from extracted FOL data

### API Structure
Main API routes follow the pattern `/api?endpoint=<name>`:
- `memories` / `memoriesDocument` - User chat logs
- `constants` / `facts` / `predicates` - FOL data (via FOL-SDK MongoDbFolStore)
- `buildFols` - Trigger FOL extraction from documents
- `nonce` / `login` - Wallet authentication

Dedicated routes:
- `/api/memories` - GET memories by userName
- `/api/fols` - POST to build FOL from document

### Important Patterns
- MongoDB connections are cached globally for reuse in development
- FOL store instance (`MongoDbFolStore`) is cached globally to avoid model conflicts
- Client-side code cannot use `@ainblockchain/ain-js` or crypto packages (configured in next.config.ts)
- Auth state is managed via `AuthContext` and persisted in sessionStorage

## Git Workflow

### Dual Repository Setup
This project is pushed to two remote repositories simultaneously:
- `origin` - Primary repository
- `bitbucket` - Backup/mirror repository

**Important**: When pushing changes, ALWAYS push to both remotes:
```bash
git push origin <branch-name>
git push bitbucket <branch-name>
```

Example for current branch:
```bash
git push origin migrate-next
git push bitbucket migrate-next
```

## Environment Variables

Required in `.env`:
- `MONGODB_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key for FOL-SDK
 