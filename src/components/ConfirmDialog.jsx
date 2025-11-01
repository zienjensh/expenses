import { X } from 'lucide-react';

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-charcoal rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-fire-red/20 animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-600 dark:text-light-gray hover:text-fire-red transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <p className="text-gray-700 dark:text-light-gray mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg transition-all glow-red"
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

