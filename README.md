# فلوسي - Falusy 💰
نظام إدارة المصروفات والإيرادات الشخصي | Personal Expense Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7-orange.svg)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-brightgreen.svg)](https://web.dev/progressive-web-apps/)

## 📖 نظرة عامة / Overview

**فلوسي** هو تطبيق ويب تقدمي (PWA) لإدارة المصروفات والإيرادات الشخصية. يوفر للمستخدمين طريقة سهلة لتتبع أموالهم، إنشاء تقارير مالية، وإدارة المشاريع المالية.

**Falusy** is a Progressive Web App (PWA) for personal expense and revenue management. It provides users with an easy way to track their money, generate financial reports, and manage financial projects.

## ✨ الميزات الرئيسية / Key Features

### 💸 إدارة المعاملات / Transaction Management
- ✅ إضافة وتعديل وحذف المصروفات والإيرادات
- ✅ تصنيف المعاملات حسب الفئات
- ✅ ربط المعاملات بالمشاريع
- ✅ البحث والفلترة المتقدمة

### 📊 لوحة التحكم / Dashboard
- ✅ نظرة شاملة على الوضع المالي
- ✅ إحصائيات فورية (المصروفات، الإيرادات، صافي الدخل)
- ✅ رسوم بيانية تفاعلية
- ✅ آخر المعاملات

### 📈 التقارير / Reports
- ✅ تقارير شهرية وسنوية
- ✅ تحليل الفئات
- ✅ مقارنة المصروفات والإيرادات
- ✅ تصدير إلى PDF/Excel/CSV

### 🏗️ المشاريع / Projects
- ✅ إدارة المشاريع المالية
- ✅ تتبع المصروفات لكل مشروع
- ✅ إحصائيات المشاريع

### 🔔 الإشعارات / Notifications
- ✅ نظام إشعارات متقدم
- ✅ إشعارات من الإدارة
- ✅ تذكيرات مخصصة

### 💬 الدعم / Support
- ✅ نظام دعم مباشر
- ✅ محادثات مع الإدارة
- ✅ تتبع طلبات الدعم

### 👤 الإدارة / Admin Panel
- ✅ لوحة تحكم للإدارة
- ✅ إدارة المستخدمين
- ✅ إرسال الإشعارات
- ✅ إدارة الدعم

### 🌍 متعدد اللغات / Multi-language
- ✅ دعم العربية والإنجليزية
- ✅ واجهة RTL/LTR
- ✅ ترجمة كاملة

### 🌙 الوضع الداكن / Dark Mode
- ✅ وضع داكن/فاتح
- ✅ تخصيص الألوان
- ✅ حفظ التفضيلات

### 📱 تطبيق PWA / PWA App
- ✅ يعمل بدون إنترنت
- ✅ قابل للتثبيت على الموبايل
- ✅ تحديثات تلقائية
- ✅ أداء سريع

## 🚀 البدء السريع / Quick Start

### المتطلبات / Requirements
- Node.js 16+ 
- npm أو yarn
- حساب Firebase

### التثبيت / Installation

1. **استنساخ المستودع / Clone Repository**
```bash
git clone [repository-url]
cd MY
```

2. **تثبيت المكتبات / Install Dependencies**
```bash
npm install
```

3. **إعداد Firebase / Setup Firebase**
- أنشئ مشروع Firebase جديد
- أضف معلومات التكوين في `src/firebase/config.js`
- قم بنشر Firestore Rules من `firestore.rules`

4. **تشغيل المشروع / Run Project**
```bash
npm run dev
```

5. **بناء للإنتاج / Build for Production**
```bash
npm run build
```

## 📁 بنية المشروع / Project Structure

```
src/
├── components/          # المكونات القابلة لإعادة الاستخدام
├── context/            # Context API للـ state management
├── pages/              # صفحات التطبيق
├── firebase/           # إعدادات Firebase
├── translations/        # ملفات الترجمة
├── utils/              # دوال مساعدة
├── App.jsx             # المكون الرئيسي
└── main.jsx           # نقطة الدخول
```

## 🛠️ التقنيات المستخدمة / Technologies

- **Frontend:** React 18.2
- **Routing:** React Router DOM 6.20
- **Styling:** Tailwind CSS 3.3
- **Backend:** Firebase (Firestore, Auth)
- **Charts:** Recharts 2.10
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **PWA:** Vite Plugin PWA
- **Export:** jsPDF, xlsx, html2canvas

## 🔐 الأمان / Security

- Firebase Authentication
- Firestore Security Rules
- Protected Routes
- Input Validation
- XSS Protection

## 📱 التوافق / Compatibility

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Mobile Browsers
- ✅ PWA Support

## 🌐 اللغات المدعومة / Supported Languages

- العربية (Arabic) - RTL
- الإنجليزية (English) - LTR

## 📝 الترخيص / License

MIT License - انظر ملف LICENSE للتفاصيل

## 🤝 المساهمة / Contributing

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📧 التواصل / Contact

للأسئلة أو الدعم، يرجى التواصل عبر:
- صفحة الدعم في التطبيق
- أو فتح issue في المستودع

## 🎯 الطريق المستقبلي / Roadmap

انظر ملف [IMPROVEMENTS_SUGGESTIONS.md](./IMPROVEMENTS_SUGGESTIONS.md) للقائمة الكاملة بالتحسينات والميزات المقترحة.

### الميزات القادمة / Upcoming Features
- ✅ نظام الميزانية
- ✅ الأهداف المالية
- ✅ الفواتير المتكررة
- ✅ النسخ الاحتياطي والاستعادة
- ✅ الملفات المرفقة

## 🙏 شكر وتقدير / Acknowledgments

- Firebase Team
- React Community
- جميع المساهمين

---

**صنع بـ ❤️ باستخدام React و Firebase**

*Made with ❤️ using React & Firebase*

