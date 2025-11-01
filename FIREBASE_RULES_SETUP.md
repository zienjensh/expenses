# إعداد قواعد Firestore للمشاريع

## المشكلة
إذا ظهرت رسالة خطأ: `Missing or insufficient permissions` عند محاولة إنشاء أو قراءة المشاريع، فهذا يعني أن قواعد Firestore لم يتم نشرها في Firebase Console.

## الحل - خطوات سريعة

### 1. افتح Firebase Console
- اذهب إلى [Firebase Console](https://console.firebase.google.com/)
- اختر مشروعك (`expenses-4e1fa`)

### 2. افتح Firestore Database
- من القائمة الجانبية، اضغط على **Firestore Database**
- اضغط على تبويب **Rules** (في الأعلى بجانب Data, Indexes, Usage)

### 3. انسخ القواعد التالية
انسخ الكود التالي بالكامل:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Expenses collection rules
    match /expenses/{expenseId} {
      allow read: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Revenues collection rules
    match /revenues/{revenueId} {
      allow read: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Projects collection rules
    match /projects/{projectId} {
      allow read: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
      
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Users collection rules (for user preferences like currency)
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      
      allow create: if request.auth != null && request.auth.uid == userId &&
        request.resource.data.userId == request.auth.uid;
      
      allow update: if request.auth != null && request.auth.uid == userId &&
        resource.data.userId == request.auth.uid;
      
      allow delete: if false; // Prevent deletion of user documents
    }
    
    // Usernames collection rules (for username to email mapping)
    // Allow read without auth for login purposes (only username and email, no sensitive data)
    match /usernames/{usernameId} {
      // Allow read without authentication (needed for login)
      allow read: if true;
      
      // Only authenticated users can create usernames for themselves
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.email != null &&
        request.resource.data.username != null;
      
      allow update: if false; // Usernames cannot be updated
      
      allow delete: if false; // Usernames cannot be deleted
    }
  }
}
```

### 4. الصق القواعد
- احذف القواعد القديمة من محرر Rules
- الصق القواعد الجديدة التي نسختها

### 5. انشر القواعد
- اضغط على زر **Publish** (نشر) في الأعلى
- انتظر حتى ترى رسالة النجاح

### 6. إنشاء Index لـ usernames (مطلوب)
بعد نشر القواعد، ستحتاج إلى إنشاء index للبحث عن username:
- عند تسجيل الدخول لأول مرة باستخدام username، قد تظهر رسالة خطأ تحتوي على رابط لإنشاء index
- اضغط على الرابط أو اذهب إلى: Firebase Console → Firestore → Indexes
- سيتم إنشاء index تلقائياً - انتظر حتى يكتمل (قد يستغرق بضع دقائق)

**ملاحظة**: إذا لم يظهر الرابط، يمكنك إنشاء index يدوياً:
- اذهب إلى Firebase Console → Firestore → Indexes → Add Index
- Collection: `usernames`
- Fields: `username` (Ascending)
- Query scope: Collection

### 7. اختبر التطبيق
- عد إلى التطبيق وقم بتحديث الصفحة
- جرب تسجيل الدخول باستخدام username - يجب أن يعمل الآن!

## ملاحظات مهمة

- **الأمان**: هذه القواعد تسمح فقط للمستخدمين المصادق عليهم بقراءة وكتابة بياناتهم الخاصة فقط
- **الاختبار**: يمكنك استخدام محرر Rules في Firebase Console لاختبار القواعد قبل النشر
- **التحديثات**: كل مرة تقوم فيها بتحديث ملف `firestore.rules` محلياً، يجب أن تنشرها في Firebase Console
- **اسم المستخدم**: يجب أن يكون 3 أحرف على الأقل ويحتوي فقط على أحرف إنجليزية وأرقام وشرطة سفلية (مثل: user123, my_user)

## بديل - استخدام Firebase CLI

إذا كان لديك Firebase CLI مثبت، يمكنك نشر القواعد مباشرة من سطر الأوامر:

```bash
firebase deploy --only firestore:rules
```

لكن يتطلب هذا:
1. تثبيت Firebase CLI: `npm install -g firebase-tools`
2. تسجيل الدخول: `firebase login`
3. تهيئة المشروع: `firebase init firestore`

---

**بعد نشر القواعد، يجب أن تعمل صفحة المشاريع بدون مشاكل! 🎉**

