import { Shield, Lock, Eye, Database, UserCheck, AlertCircle, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);

  const currentYear = new Date().getFullYear();

  return (
    <>
      <SEO 
        title={language === 'ar' ? 'سياسة الخصوصية - فلوسي' : 'Privacy Policy - Falusy'}
        description={language === 'ar' ? 'سياسة الخصوصية وحماية البيانات لتطبيق فلوسي' : 'Privacy policy and data protection for Falusy application'}
      />
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <div className="bg-white dark:bg-charcoal/50 rounded-xl p-8 border border-gray-200 dark:border-fire-red/20">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-fire-red/20 rounded-xl">
              <Shield className="text-fire-red" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </h1>
              <p className="text-gray-600 dark:text-light-gray/70 mt-1">
                {language === 'ar' ? 'حماية بياناتك وخصوصيتك' : 'Protecting Your Data and Privacy'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            {language === 'ar' ? (
              <>
                <section>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed mb-4">
                    نحن في فلوسي (Falusy) نلتزم بحماية خصوصيتك وبياناتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية 
                    معلوماتك الشخصية عند استخدام تطبيق فلوسي.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Database size={24} className="text-fire-red" />
                    المعلومات التي نجمعها
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">1. المعلومات الشخصية</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        نجمع المعلومات التي تقدمها لنا عند التسجيل واستخدام التطبيق، بما في ذلك:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mt-2 mr-4">
                        <li>اسم المستخدم والبريد الإلكتروني ورقم الهاتف</li>
                        <li>المصروفات والإيرادات المالية</li>
                        <li>المشاريع والأهداف المالية</li>
                        <li>الإعدادات والتفضيلات</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">2. المعلومات التقنية</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        قد نجمع تلقائياً معلومات تقنية مثل:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mt-2 mr-4">
                        <li>عنوان IP ونوع الجهاز</li>
                        <li>نوع المتصفح ونظام التشغيل</li>
                        <li>معلومات الاستخدام والإحصائيات</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Eye size={24} className="text-fire-red" />
                    كيفية استخدام المعلومات
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed mb-2">
                    نستخدم المعلومات التي نجمعها من أجل:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mr-4">
                    <li>توفير وتحسين خدمات التطبيق</li>
                    <li>معالجة المعاملات المالية وإدارة الحسابات</li>
                    <li>إرسال إشعارات مهمة بشأن حسابك</li>
                    <li>تحليل استخدام التطبيق لتحسين الأداء</li>
                    <li>ضمان الأمان ومنع الاحتيال</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Lock size={24} className="text-fire-red" />
                    حماية البيانات
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                      نستخدم تدابير أمنية متقدمة لحماية بياناتك:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mr-4">
                      <li>التشفير (Encryption) لجميع البيانات الحساسة</li>
                      <li>مصادقة آمنة باستخدام Firebase Authentication</li>
                      <li>تخزين آمن في قاعدة بيانات Firestore</li>
                      <li>مراقبة مستمرة للأنشطة المشبوهة</li>
                      <li>نسخ احتياطية منتظمة للبيانات</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserCheck size={24} className="text-fire-red" />
                    مشاركة المعلومات
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                    نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mt-2 mr-4">
                    <li>عندما يكون ذلك مطلوباً بموجب القانون</li>
                    <li>لحماية حقوقنا القانونية</li>
                    <li>مع موافقتك الصريحة</li>
                    <li>مع مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل التطبيق (مثل Firebase)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertCircle size={24} className="text-fire-red" />
                    حقوقك
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed mb-2">
                    لديك الحق في:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mr-4">
                    <li>الوصول إلى بياناتك الشخصية</li>
                    <li>تصحيح أو تحديث بياناتك</li>
                    <li>حذف حسابك وبياناتك</li>
                    <li>تصدير بياناتك في أي وقت</li>
                    <li>رفض جمع معلومات معينة</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Mail size={24} className="text-fire-red" />
                    الاتصال بنا
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                    إذا كان لديك أي أسئلة أو مخاوف بشأن سياسة الخصوصية هذه، يرجى الاتصال بنا من خلال:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mt-2 mr-4">
                    <li>صفحة الدعم في التطبيق</li>
                    <li>البريد الإلكتروني من خلال نموذج التواصل</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">التغييرات على السياسة</h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                    قد نحدث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإشعارك بأي تغييرات مهمة عبر التطبيق أو البريد الإلكتروني.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed mb-4">
                    At Falusy, we are committed to protecting your privacy and data. This privacy policy explains how we collect, 
                    use, and protect your personal information when using the Falusy application.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Database size={24} className="text-fire-red" />
                    Information We Collect
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">1. Personal Information</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        We collect information you provide to us when registering and using the application, including:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mt-2 ml-4">
                        <li>Username, email, and phone number</li>
                        <li>Financial expenses and revenues</li>
                        <li>Projects and financial goals</li>
                        <li>Settings and preferences</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">2. Technical Information</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        We may automatically collect technical information such as:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mt-2 ml-4">
                        <li>IP address and device type</li>
                        <li>Browser type and operating system</li>
                        <li>Usage information and statistics</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Eye size={24} className="text-fire-red" />
                    How We Use Information
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed mb-2">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 ml-4">
                    <li>Provide and improve application services</li>
                    <li>Process financial transactions and manage accounts</li>
                    <li>Send important notifications about your account</li>
                    <li>Analyze application usage to improve performance</li>
                    <li>Ensure security and prevent fraud</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Lock size={24} className="text-fire-red" />
                    Data Protection
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                      We use advanced security measures to protect your data:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 ml-4">
                      <li>Encryption for all sensitive data</li>
                      <li>Secure authentication using Firebase Authentication</li>
                      <li>Secure storage in Firestore database</li>
                      <li>Continuous monitoring of suspicious activities</li>
                      <li>Regular data backups</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserCheck size={24} className="text-fire-red" />
                    Information Sharing
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                    We do not sell, rent, or share your personal information with third parties except in the following cases:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mt-2 ml-4">
                    <li>When required by law</li>
                    <li>To protect our legal rights</li>
                    <li>With your explicit consent</li>
                    <li>With trusted service providers who help us operate the application (such as Firebase)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertCircle size={24} className="text-fire-red" />
                    Your Rights
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed mb-2">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 ml-4">
                    <li>Access your personal data</li>
                    <li>Correct or update your data</li>
                    <li>Delete your account and data</li>
                    <li>Export your data at any time</li>
                    <li>Opt-out of collecting certain information</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Mail size={24} className="text-fire-red" />
                    Contact Us
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                    If you have any questions or concerns about this privacy policy, please contact us through:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mt-2 ml-4">
                    <li>The support page in the application</li>
                    <li>Email through the contact form</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Policy Changes</h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                    We may update this privacy policy from time to time. We will notify you of any significant changes through 
                    the application or email.
                  </p>
                </section>
              </>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-fire-red/10 dark:bg-fire-red/20 rounded-lg border border-fire-red/20">
            <p className="text-sm text-gray-700 dark:text-light-gray">
              <strong>{language === 'ar' ? 'آخر تحديث:' : 'Last Updated:'}</strong>{' '}
              {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;

