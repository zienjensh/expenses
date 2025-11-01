# Expense Management Dashboard

A modern, RTL-ready expense management dashboard built with React, Firebase, and Tailwind CSS.

## Features

- 🏠 **Dashboard** - Overview of expenses, revenues, and financial metrics
- 💸 **Expenses Management** - Add, edit, delete, and filter expenses
- 💰 **Revenue Tracking** - Manage income and revenue streams
- 📈 **Reports & Analytics** - Visual charts and comprehensive financial reports
- ⚙️ **Settings** - User preferences, theme toggle, and account management
- 🔐 **Firebase Authentication** - Secure user authentication
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark Theme** - Beautiful dark theme with red accent colors
- 🇸🇦 **RTL Support** - Full Arabic RTL layout support

## Tech Stack

- React (Vite)
- Tailwind CSS
- Firebase (Auth, Firestore)
- Recharts (Charts)
- React Router
- Context API
- Lucide Icons
- React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project created

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-management-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:

   - Create a `.env` file in the root directory:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

   - Enable Email/Password authentication in Firebase Console
   - Create Firestore database in production mode
   - Set up Firestore security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /expenses/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
       }
       match /revenues/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Sidebar.jsx
│   ├── Navbar.jsx
│   ├── StatsCard.jsx
│   ├── TransactionTable.jsx
│   ├── AddTransactionModal.jsx
│   ├── ChartOverview.jsx
│   └── ConfirmDialog.jsx
├── context/           # Context providers
│   ├── AuthContext.jsx
│   ├── TransactionContext.jsx
│   └── ThemeContext.jsx
├── pages/             # Page components
│   ├── Dashboard.jsx
│   ├── Expenses.jsx
│   ├── Revenues.jsx
│   ├── Reports.jsx
│   ├── Settings.jsx
│   └── Login.jsx
├── firebase/          # Firebase configuration
│   └── config.js
├── App.jsx            # Main app component with routing
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Design System

### Colors
- Primary (Accent): `#E50914` (Fire Red)
- Background: `#0E0E0E` (Charcoal Black)
- Text: `#F2F2F2` (Light Gray)

### Font
- Tajawal (Google Fonts)

## License

MIT

