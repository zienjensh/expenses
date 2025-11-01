# البدء السريع - دليل سريع

## 🚀 البدء في 5 دقائق

### 1️⃣ تثبيت الحزم
```bash
npm install
```

### 2️⃣ إعداد Firebase

**أ) إنشاء مشروع:**
- [Firebase Console](https://console.firebase.google.com/) → إضافة مشروع

**ب) تفعيل Authentication:**
- Authentication → Sign-in method → Email/Password → مفعّل

**ج) إنشاء Firestore:**
- Firestore Database → إنشاء قاعدة بيانات → وضع الإنتاج
- Rules → انسخ محتوى `firestore.rules` → نشر

### 3️⃣ ملف البيئة

أنشئ ملف `.env` في الجذر:

```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

> 💡 احصل على هذه القيم من: Firebase Console → ⚙️ → إعدادات المشروع → التطبيقات → Web App

### 4️⃣ التشغيل
```bash
npm run dev
```

افتح: `http://localhost:3000` 🎉

---

## ⚠️ مهم جداً

1. تأكد من تفعيل **Email/Password** في Authentication
2. تأكد من نشر **Firestore Rules** من ملف `firestore.rules`
3. عند ظهور رسالة خطأ عن Index، اضغط على الرابط لإنشاء Index تلقائياً

---

للمزيد من التفاصيل، راجع `SETUP.md`

