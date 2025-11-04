# إصلاحات Firestore Rules / Firestore Rules Fixes

## المشكلة / Problem
تم مواجهة أخطاء "Missing or insufficient permissions" عند استخدام الميزات الجديدة.

## الحلول المطبقة / Applied Solutions

### 1. دعم البحث عن رقم الهاتف / Phone Number Search Support

تم تحديث قواعد Firestore لدعم البحث عن رقم الهاتف في `usernames` collection:

```firestore
// Allow querying usernames collection for login (by phoneNumber or username)
match /usernames {
  allow list: if true; // Allow queries for login purposes
}
```

### 2. تحديث AuthContext

- تم تحديث `checkPhoneExists` لاستخدام `usernames` collection بدلاً من `users`
- تم تحديث `login` للبحث في `usernames` collection أولاً عند تسجيل الدخول برقم الهاتف

## خطوات النشر / Deployment Steps

### 1. نشر قواعد Firestore

```bash
firebase deploy --only firestore:rules
```

أو من Firebase Console:
1. اذهب إلى Firebase Console
2. اختر Firestore Database
3. اذهب إلى Rules
4. انسخ محتوى `firestore.rules`
5. اضغط Publish

### 2. إنشاء فهرس Firestore (اختياري لكن موصى به)

في Firebase Console > Firestore Database > Indexes:

**مطلوب للبحث عن رقم الهاتف:**
- Collection ID: `usernames`
- Fields to index:
  - `phoneNumber` (Ascending)
- Query scope: Collection

**ملاحظة:** Firebase قد ينشئ الفهرس تلقائياً عند أول استعلام، لكن إنشاؤه يدوياً أسرع.

## التحقق من الإصلاحات / Verification

بعد نشر القواعد:

1. ✅ تسجيل الدخول برقم الهاتف يجب أن يعمل
2. ✅ تسجيل الدخول باسم المستخدم يجب أن يعمل
3. ✅ جميع الـ Contexts يجب أن تعمل بدون أخطاء صلاحيات
4. ✅ الفواتير المتكررة يجب أن تعمل
5. ✅ الميزانيات والأهداف يجب أن تعمل

## ملاحظات أمنية / Security Notes

- `usernames` collection يمكن قراءتها بدون مصادقة (لأغراض تسجيل الدخول فقط)
- `users` collection محمية وتتطلب مصادقة
- رقم الهاتف يُحفظ في `usernames` collection لأغراض تسجيل الدخول فقط

## استكشاف الأخطاء / Troubleshooting

إذا استمرت مشاكل الصلاحيات:

1. تأكد من نشر القواعد في Firebase Console
2. تحقق من أن المستخدم مسجل دخول (للـ Contexts التي تحتاج مصادقة)
3. تحقق من فهارس Firestore في Console
4. امسح ذاكرة التخزين المؤقت للمتصفح

---

*آخر تحديث: [التاريخ الحالي]*
*Last Updated: [Current Date]*

