import { useState, useEffect, useRef } from 'react';
import { X, DollarSign, Tag, Calendar, CreditCard, FileText, Folder, Loader2 } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useProjects } from '../context/ProjectsContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import toast from 'react-hot-toast';

const AddTransactionModal = ({ type, onClose, editData = null, projectId = null }) => {
  const { addExpense, addRevenue, updateExpense, updateRevenue } = useTransactions();
  const { projects } = useProjects();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);
  
  const [formData, setFormData] = useState({
    amount: editData?.amount || '',
    category: editData?.category || '',
    description: editData?.description || '',
    type: editData?.type || (type === 'expense' ? (language === 'ar' ? 'ثابت' : 'Fixed') : ''),
    paymentMethod: editData?.paymentMethod || (language === 'ar' ? 'نقدي' : 'Cash'),
    date: editData?.date || new Date().toISOString().split('T')[0],
    projectId: editData?.projectId || projectId || '',
  });

  // Categories and options based on language
  const expenseCategories = language === 'ar' 
    ? ['طعام', 'مواصلات', 'صحة', 'ترفيه', 'فواتير', 'تسوق', 'أخرى']
    : ['Food', 'Transportation', 'Health', 'Entertainment', 'Bills', 'Shopping', 'Other'];
  const revenueCategories = language === 'ar'
    ? ['راتب', 'استثمار', 'هدية', 'أخرى']
    : ['Salary', 'Investment', 'Gift', 'Other'];
  const expenseTypes = language === 'ar'
    ? ['ثابت', 'متغير', 'طوارئ']
    : ['Fixed', 'Variable', 'Emergency'];
  const paymentMethods = language === 'ar'
    ? ['نقدي', 'بطاقة ائتمان', 'تحويل بنكي', 'محفظة إلكترونية']
    : ['Cash', 'Credit Card', 'Bank Transfer', 'E-Wallet'];

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = language === 'ar' ? 'المبلغ مطلوب ويجب أن يكون أكبر من صفر' : 'Amount is required and must be greater than zero';
    }
    
    if (!formData.category) {
      newErrors.category = t.categoryRequired;
    }
    
    if (!formData.date) {
      newErrors.date = language === 'ar' ? 'التاريخ مطلوب' : 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(language === 'ar' ? 'يرجى إكمال جميع الحقول المطلوبة' : 'Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date,
        // Include projectId only if selected (empty string means no project)
        ...(formData.projectId ? { projectId: formData.projectId } : {}),
      };

      if (editData) {
        if (type === 'expense') {
          await updateExpense(editData.id, transactionData);
          toast.success(t.updated);
        } else {
          await updateRevenue(editData.id, transactionData);
          toast.success(t.updated);
        }
      } else {
        if (type === 'expense') {
          await addExpense(transactionData);
          toast.success(t.created);
        } else {
          await addRevenue(transactionData);
          toast.success(t.created);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى' : 'An error occurred while saving. Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        // Close when clicking on backdrop (not the modal content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalRef}
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border backdrop-blur-xl shadow-2xl animate-fadeIn ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal border-fire-red/30 shadow-fire-red/20'
            : 'bg-gradient-to-br from-white via-white/95 to-white border-gray-200/50 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glow effect */}
        <div className={`absolute top-0 left-0 right-0 h-px ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-transparent via-fire-red/60 to-transparent'
            : 'bg-gradient-to-r from-transparent via-fire-red/40 to-transparent'
        }`} />

        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b backdrop-blur-xl ${
          theme === 'dark'
            ? 'bg-charcoal/80 border-fire-red/20'
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              type === 'expense' 
                ? 'bg-fire-red/20 text-fire-red' 
                : 'bg-green-500/20 text-green-500'
            }`}>
              <DollarSign size={24} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {editData ? t.edit : t.add} {type === 'expense' ? t.expense : t.revenue}
              </h2>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-light-gray/70' : 'text-gray-600'
              }`}>
                {editData 
                  ? (language === 'ar' ? 'قم بتحديث المعلومات' : 'Update the information')
                  : (language === 'ar' ? 'املأ البيانات لإضافة معاملة جديدة' : 'Fill in the data to add a new transaction')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-fire-red hover:bg-white/10'
                : 'text-gray-500 hover:text-fire-red hover:bg-gray-100'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div className={`space-y-4 p-5 rounded-xl border ${
            theme === 'dark'
              ? 'bg-white/5 border-fire-red/10'
              : 'bg-gray-50/50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <DollarSign size={20} className="text-fire-red" />
              {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
                }`}>
                  <DollarSign size={16} className="text-fire-red" />
                  {t.amount} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    if (errors.amount) setErrors({ ...errors, amount: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    errors.amount
                      ? 'border-red-500'
                      : theme === 'dark'
                      ? 'bg-white/5 border-fire-red/20 text-white placeholder:text-gray-500 focus:border-fire-red focus:bg-white/10'
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-fire-red focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-fire-red/20`}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
                }`}>
                  <Tag size={16} className="text-fire-red" />
                  {t.category} *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    if (errors.category) setErrors({ ...errors, category: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    errors.category
                      ? 'border-red-500'
                      : theme === 'dark'
                      ? 'bg-white/5 border-fire-red/20 text-white focus:border-fire-red focus:bg-white/10'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-fire-red focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-fire-red/20`}
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                    color: theme === 'dark' ? '#F2F2F2' : '#0E0E0E'
                  }}
                >
                  <option value="" style={{
                    backgroundColor: theme === 'dark' ? '#0E0E0E' : '#FFFFFF',
                    color: theme === 'dark' ? '#F2F2F2' : '#0E0E0E'
                  }}>{t.selectCategory}</option>
                  {(type === 'expense' ? expenseCategories : revenueCategories).map(cat => (
                    <option key={cat} value={cat} style={{
                      backgroundColor: theme === 'dark' ? '#0E0E0E' : '#FFFFFF',
                      color: theme === 'dark' ? '#F2F2F2' : '#0E0E0E'
                    }}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Details Section */}
          <div className={`space-y-4 p-5 rounded-xl border ${
            theme === 'dark'
              ? 'bg-white/5 border-fire-red/10'
              : 'bg-gray-50/50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <CreditCard size={20} className="text-fire-red" />
              {language === 'ar' ? 'تفاصيل المعاملة' : 'Transaction Details'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type === 'expense' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
                  }`}>
                    {t.expenseType}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      theme === 'dark'
                        ? 'bg-white/5 border-fire-red/20 text-white focus:border-fire-red focus:bg-white/10'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-fire-red focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-fire-red/20`}
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                      color: theme === 'dark' ? '#F2F2F2' : '#0E0E0E'
                    }}
                  >
                    {expenseTypes.map(t => (
                      <option key={t} value={t} style={{
                        backgroundColor: theme === 'dark' ? '#0E0E0E' : '#FFFFFF',
                        color: theme === 'dark' ? '#F2F2F2' : '#0E0E0E'
                      }}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
                }`}>
                  <CreditCard size={16} className="text-fire-red" />
                  {t.paymentMethod}
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-fire-red/20 text-white focus:border-fire-red focus:bg-white/10'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-fire-red focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-fire-red/20`}
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                    color: theme === 'dark' ? '#F2F2F2' : '#0E0E0E'
                  }}
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method} style={{
                      backgroundColor: theme === 'dark' ? '#0E0E0E' : '#FFFFFF',
                      color: theme === 'dark' ? '#F2F2F2' : '#0E0E0E'
                    }}>{method}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
              }`}>
                <Calendar size={16} className="text-fire-red" />
                {t.date} *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  if (errors.date) setErrors({ ...errors, date: '' });
                }}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  errors.date
                    ? 'border-red-500'
                    : theme === 'dark'
                    ? 'bg-white/5 border-fire-red/20 text-white focus:border-fire-red focus:bg-white/10'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-fire-red focus:bg-white'
                } focus:outline-none focus:ring-2 focus:ring-fire-red/20`}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Additional Information Section */}
          <div className={`space-y-4 p-5 rounded-xl border ${
            theme === 'dark'
              ? 'bg-white/5 border-fire-red/10'
              : 'bg-gray-50/50 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <FileText size={20} className="text-fire-red" />
              {language === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
            </h3>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
              }`}>
                {t.description}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border transition-all resize-none ${
                  theme === 'dark'
                    ? 'bg-white/5 border-fire-red/20 text-white placeholder:text-gray-500 focus:border-fire-red focus:bg-white/10'
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-fire-red focus:bg-white'
                } focus:outline-none focus:ring-2 focus:ring-fire-red/20`}
                placeholder={language === 'ar' ? 'أضف وصفاً أو ملاحظات (اختياري)' : 'Add description or notes (optional)'}
              />
            </div>

            {/* Project Selection */}
            {projects && projects.length > 0 && (
              <div>
                <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-light-gray' : 'text-gray-700'
                }`}>
                  <Folder size={16} className="text-fire-red" />
                  {t.project} ({t.optional})
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-fire-red/20 text-white focus:border-fire-red focus:bg-white/10'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-fire-red focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-fire-red/20`}
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                    color: theme === 'dark' ? '#F2F2F2' : '#0E0E0E'
                  }}
                >
                  <option value="" style={{
                    backgroundColor: theme === 'dark' ? '#0E0E0E' : '#FFFFFF',
                    color: theme === 'dark' ? '#F2F2F2' : '#0E0E0E'
                  }}>{language === 'ar' ? 'بدون مشروع' : 'No Project'}</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id} style={{
                      backgroundColor: theme === 'dark' ? '#0E0E0E' : '#FFFFFF',
                      color: theme === 'dark' ? '#F2F2F2' : '#0E0E0E'
                    }}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <p className={`text-xs mt-1.5 ${
                  theme === 'dark' ? 'text-light-gray/60' : 'text-gray-500'
                }`}>
                  {language === 'ar' 
                    ? `يمكنك ربط هذا ${type === 'expense' ? 'المصروف' : 'الإيراد'} بمشروع معين لتتبع أفضل`
                    : `You can link this ${type === 'expense' ? 'expense' : 'revenue'} to a specific project for better tracking`}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-fire-red/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 text-light-gray border border-white/10'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-fire-red to-fire-red/90 hover:from-fire-red/90 hover:to-fire-red text-white shadow-lg shadow-fire-red/30 hover:shadow-xl hover:shadow-fire-red/40'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40'
              } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{t.loading}</span>
                </>
              ) : (
                <>
                  {editData ? t.save : t.add}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;

