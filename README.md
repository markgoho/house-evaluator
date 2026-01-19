# House Evaluator

A collaborative house evaluation app for families, built with SvelteKit and Firebase. Rate properties on customizable criteria and view aggregated scores in real-time.

## Features

- 🏠 **House Management**: Add and track properties with detailed information
- ⭐ **Custom Rating Criteria**: Define what matters most to your family
- 👨‍👩‍👧‍👦 **Family Collaboration**: Independent ratings with aggregated views
- 📱 **Mobile-First**: Optimized for use during house tours
- 🔐 **Secure**: Firebase Authentication and family-scoped data access
- ⚡ **Real-Time**: Instant updates across all family members

## Tech Stack

- **Frontend**: SvelteKit 2 + TypeScript
- **Backend**: Firebase (Firestore, Auth, Storage, Hosting)
- **Build**: Vite + Bun (or Node.js)
- **Deployment**: Firebase Hosting

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Firebase account
- Firebase CLI: `npm install -g firebase-tools`

## Setup Instructions

### 1. Install Dependencies

Using Bun (recommended):

```bash
bun install
```

Or using npm:

```bash
npm install
```

### 2. Firebase Configuration

#### Enable Firebase Services

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`house-eval`)
3. Enable the following services:
   - **Authentication**: Enable Google Sign-in provider
   - **Firestore Database**: Already configured
   - **Firebase Storage**: Click "Get Started" in Storage section

#### Get Firebase Config

1. In Firebase Console, go to Project Settings
2. Scroll to "Your apps" section
3. Click the web app (</>) icon or select your existing web app
4. Copy the `firebaseConfig` object

#### Create Environment File

Create `.env.local` in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Firebase configuration:

```env
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=house-eval.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=house-eval
PUBLIC_FIREBASE_STORAGE_BUCKET=house-eval.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Deploy Security Rules

Deploy the Firestore and Storage security rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 4. Run Development Server

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Building for Production

### Build the App

```bash
bun run build
# or
npm run build
```

### Preview Production Build

```bash
bun run preview
# or
npm run preview
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

## Usage Guide

### First-Time Setup

1. **Sign In**: Click "Sign in with Google"
2. **Create Family**: Enter your family name
3. **Default Criteria**: 8 criteria are automatically created

### Adding Houses

1. Navigate to "Houses" → "Add House"
2. Fill in property details
3. Click "Add House"

### Rating Houses

1. Click on a house to view details
2. Click "Rate This House"
3. Use sliders to rate each criterion (1-10)
4. Submit rating

### Managing Criteria

1. Go to "Criteria" in navigation
2. Add, edit, or delete criteria as needed

## License

MIT License
