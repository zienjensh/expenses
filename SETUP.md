# دليل إعداد المشروع

## الخطوات السريعة للبدء

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. إعداد Firebase

#### أ) إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اضغط على "إضافة مشروع" (Add Project)
3. اتبع التعليمات لإنشاء مشروع جديد

#### ب) الحصول على بيانات الإعدادات

1. في صفحة المشروع، اضغط على أيقونة الإعدادات ⚙️
2. اختر "إعدادات المشروع" (Project Settings)
3. في قسم "تطبيقاتك" (Your apps)، اضغط على أيقونة الويب `</>`
4. سجل بيانات التطبيق:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

#### ج) تفعيل المصادقة (Authentication)

1. من القائمة الجانبية، اختر "المصادقة" (Authentication)
2. اضغط على "البدء" (Get Started)
3. اختر "البريد الإلكتروني / كلمة المرور" (Email/Password)
4. فعّل "البريد الإلكتروني / كلمة المرور"
5. احفظ التغييرات

#### د) إعداد Firestore Database

1. من القائمة الجانبية، اختر "Firestore Database"
2. اضغط على "إنشاء قاعدة بيانات" (Create Database)
3. اختر "بدء في وضع الإنتاج" (Start in production mode)
4. اختر موقع قاعدة البيانات (اختر الأقرب لك)
5. بعد إنشاء قاعدة البيانات:
   - انتقل إلى تبويب "Rules"
   - انسخ محتوى ملف `firestore.rules` والصقه في محرر القواعد
   - اضغط "نشر" (Publish)

#### هـ) إنشاء Indexes (اختياري - للمساعدة في الأداء)

Firebase سيطلب منك إنشاء indexes تلقائياً عند الحاجة، أو يمكنك إنشاؤها يدوياً:

1. انتقل إلى Firestore → Indexes
2. أنشئ index مركب:
   - Collection: `expenses`
   - Fields: `userId` (Ascending), `createdAt` (Descending)
3. كرر نفس الخطوة لمجموعة `revenues`

### 3. إنشاء ملف البيئة (.env)

1. أنشئ ملف `.env` في مجلد المشروع الرئيسي
2. أضف البيانات التالية (استبدل القيم بقيم مشروعك):

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. تشغيل المشروع

```bash
npm run dev
```

سيتم فتح المشروع على: `http://localhost:3000`

## استخدام التطبيق

1. عند فتح التطبيق، سترى صفحة تسجيل الدخول
2. يمكنك إنشاء حساب جديد بالضغط على "ليس لديك حساب؟ سجل الآن"
3. بعد تسجيل الدخول، يمكنك:
   - إضافة مصروفات وإيرادات
   - عرض التقارير والرسوم البيانية
   - إدارة الإعدادات

## المشاكل الشائعة وحلولها

### خطأ في Firestore Index

إذا ظهرت رسالة خطأ تتعلق بـ Index:
1. اضغط على الرابط في رسالة الخطأ
2. سيتم توجيهك لصفحة إنشاء Index
3. اضغط "إنشاء Index"

### خطأ في الاتصال بـ Firebase

- تأكد من صحة بيانات `.env`
- تأكد من تفعيل Authentication و Firestore Database
- تأكد من نشر قواعد Firestore بشكل صحيح

### المشروع لا يعمل بعد التثبيت

```bash
# احذف node_modules وأعد التثبيت
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## بناء المشروع للإنتاج

```bash
npm run build
```

الملفات المجمعة ستكون في مجلد `dist`

## الدعم

للمزيد من المعلومات، راجع ملف `README.md`

