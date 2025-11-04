import { Shield, FileText, Calendar, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import SEO from '../components/SEO';

const Copyright = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);

  const currentYear = new Date().getFullYear();

  return (
    <>
      <SEO 
        title={language === 'ar' ? 'حقوق الطبع والنشر - فلوسي' : 'Copyright - Falusy'}
        description={language === 'ar' ? 'حقوق الطبع والنشر وشروط الاستخدام لتطبيق فلوسي' : 'Copyright and terms of use for Falusy application'}
      />
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <div className="bg-white dark:bg-charcoal/50 rounded-xl p-8 border border-gray-200 dark:border-fire-red/20">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-fire-red/20 rounded-xl">
              <FileText className="text-fire-red" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'حقوق الطبع والنشر' : 'Copyright'}
              </h1>
              <p className="text-gray-600 dark:text-light-gray/70 mt-1">
                {language === 'ar' ? 'شروط الاستخدام وحقوق الملكية' : 'Terms of Use & Intellectual Property'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            {language === 'ar' ? (
              <>
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar size={24} className="text-fire-red" />
                    حقوق الملكية الفكرية
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                    جميع حقوق الطبع والنشر محفوظة © {currentYear} فلوسي (Falusy). جميع محتويات هذا التطبيق، 
                    بما في ذلك النصوص والرسوم البيانية والتصاميم والرمز البرمجي، محمية بموجب قوانين حقوق الطبع والنشر 
                    والعلامات التجارية والبراءات وقوانين الملكية الفكرية الأخرى.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield size={24} className="text-fire-red" />
                    شروط الاستخدام
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">1. قبول الشروط</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        باستخدام تطبيق فلوسي، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على هذه الشروط، 
                        يرجى عدم استخدام التطبيق.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">2. الاستخدام المسموح</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        يُسمح لك باستخدام تطبيق فلوسي للأغراض الشخصية فقط. يُمنع استخدام التطبيق لأي غرض تجاري أو غير قانوني 
                        دون الحصول على إذن كتابي مسبق من المالكين.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">3. القيود</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        يُمنع منعاً باتاً:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mt-2 mr-4">
                        <li>نسخ أو إعادة إنتاج أو تعديل أو توزيع أي جزء من التطبيق</li>
                        <li>استخدام التطبيق لأي غرض غير قانوني أو غير مصرح به</li>
                        <li>محاولة اختراق أو تعطيل أو إتلاف أنظمة التطبيق</li>
                        <li>استخدام الروبوتات أو البرامج الآلية للوصول إلى التطبيق</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">4. البيانات والمحتوى</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        أنت مسؤول عن جميع البيانات التي تدخلها في التطبيق. نحن نحترم خصوصيتك ونحمي بياناتك وفقاً لسياسة الخصوصية الخاصة بنا.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">5. إخلاء المسؤولية</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        يتم تقديم التطبيق "كما هو" دون أي ضمانات صريحة أو ضمنية. لا نضمن دقة أو اكتمال أو موثوقية 
                        أي معلومات في التطبيق.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">6. التعديلات</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        نحتفظ بالحق في تعديل أو تحديث هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات عبر التطبيق.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Globe size={24} className="text-fire-red" />
                    الاتصال بنا
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                    إذا كان لديك أي أسئلة بخصوص حقوق الطبع والنشر أو شروط الاستخدام، يرجى الاتصال بنا من خلال صفحة الدعم في التطبيق.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar size={24} className="text-fire-red" />
                    Intellectual Property Rights
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                    All rights reserved © {currentYear} Falusy. All contents of this application, including text, 
                    graphics, designs, and source code, are protected by copyright, trademark, patent, and other 
                    intellectual property laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield size={24} className="text-fire-red" />
                    Terms of Use
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">1. Acceptance of Terms</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        By using the Falusy application, you agree to be bound by these terms and conditions. 
                        If you do not agree to these terms, please do not use the application.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">2. Permitted Use</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        You are permitted to use the Falusy application for personal purposes only. Use of the application 
                        for any commercial or illegal purpose is prohibited without prior written permission from the owners.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">3. Restrictions</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        The following are strictly prohibited:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 dark:text-light-gray space-y-2 mt-2 ml-4">
                        <li>Copying, reproducing, modifying, or distributing any part of the application</li>
                        <li>Using the application for any illegal or unauthorized purpose</li>
                        <li>Attempting to hack, disrupt, or damage the application systems</li>
                        <li>Using bots or automated software to access the application</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">4. Data and Content</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        You are responsible for all data you enter into the application. We respect your privacy and protect 
                        your data in accordance with our Privacy Policy.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">5. Disclaimer</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        The application is provided "as is" without any express or implied warranties. We do not guarantee 
                        the accuracy, completeness, or reliability of any information in the application.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">6. Modifications</h3>
                      <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                        We reserve the right to modify or update these terms at any time. You will be notified of any 
                        changes through the application.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Globe size={24} className="text-fire-red" />
                    Contact Us
                  </h2>
                  <p className="text-gray-700 dark:text-light-gray leading-relaxed">
                    If you have any questions regarding copyright or terms of use, please contact us through the support 
                    page in the application.
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

export default Copyright;

