import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component for Dynamic Meta Tags
 * Updates page title and meta tags based on current route
 */
const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = 'website',
  noindex = false 
}) => {
  const location = useLocation();
  // IMPORTANT: Update this with your actual domain after deployment
  const baseUrl = 'https://your-domain.vercel.app';
  const defaultImage = `${baseUrl}/og-image.png`;
  
  // Default values based on current route
  const getDefaultMeta = () => {
    const path = location.pathname;
    
    const metaMap = {
      '/': {
        title: 'لوحة إدارة المصروفات - نظام إدارة المصروفات والإيرادات الشخصي',
        description: 'نظام شامل لإدارة المصروفات والإيرادات الشخصية. تتبع مصروفاتك وإيراداتك بسهولة، أنشئ تقارير مفصلة، وأدر مشاريعك المالية باحترافية.',
        keywords: 'إدارة المصروفات, نظام مالي, تتبع الإيرادات, إدارة الميزانية'
      },
      '/login': {
        title: 'تسجيل الدخول - لوحة إدارة المصروفات',
        description: 'سجل دخولك إلى نظام إدارة المصروفات والإيرادات الشخصي',
        keywords: 'تسجيل الدخول, حساب, مصروفات'
      },
      '/expenses': {
        title: 'المصروفات - إدارة مصروفاتك اليومية',
        description: 'أضف وتتبع جميع مصروفاتك اليومية والشهرية بسهولة. نظام شامل لإدارة المصروفات مع إمكانية التصنيف والتقارير.',
        keywords: 'المصروفات, إدارة المصروفات, تتبع المصروفات, مصروفات شخصية'
      },
      '/revenues': {
        title: 'الإيرادات - تتبع إيراداتك',
        description: 'سجل وتتبع جميع إيراداتك. أضف مصادر دخلك المختلفة واحصل على تقارير مفصلة.',
        keywords: 'الإيرادات, تتبع الإيرادات, الدخل, مصادر الدخل'
      },
      '/projects': {
        title: 'المشاريع - إدارة مشاريعك المالية',
        description: 'أنشئ وأدر مشاريعك المالية المختلفة. ربط المصروفات والإيرادات بكل مشروع لتتبع أفضل.',
        keywords: 'المشاريع, إدارة المشاريع, مشاريع مالية, تتبع المشاريع'
      },
      '/reports': {
        title: 'التقارير - تقارير مالية مفصلة',
        description: 'احصل على تقارير مالية مفصلة وشاملة. تحليل المصروفات والإيرادات مع رسوم بيانية تفاعلية.',
        keywords: 'التقارير, تقارير مالية, تحليل مالي, إحصائيات'
      },
      '/settings': {
        title: 'الإعدادات - تخصيص حسابك',
        description: 'قم بتخصيص إعدادات حسابك. اختر العملة، الوضع الداكن/الفاتح، وغيرها من الخيارات.',
        keywords: 'الإعدادات, تخصيص, إعدادات الحساب'
      }
    };
    
    return metaMap[path] || metaMap['/'];
  };

  const defaultMeta = getDefaultMeta();
  const finalTitle = title || defaultMeta.title;
  const finalDescription = description || defaultMeta.description;
  const finalKeywords = keywords || defaultMeta.keywords;
  const finalUrl = url || `${baseUrl}${location.pathname}`;
  const finalImage = image || defaultImage;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('title', finalTitle);
    
    // Robots
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Open Graph tags
    updateMetaTag('og:title', finalTitle, 'property');
    updateMetaTag('og:description', finalDescription, 'property');
    updateMetaTag('og:image', finalImage, 'property');
    updateMetaTag('og:url', finalUrl, 'property');
    updateMetaTag('og:type', type, 'property');

    // Twitter Card tags
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', finalUrl);

    // Update JSON-LD structured data
    const updateStructuredData = () => {
      // Remove old structured data
      const oldScripts = document.querySelectorAll('script[type="application/ld+json"]');
      oldScripts.forEach(script => {
        if (script.id === 'page-structured-data') {
          script.remove();
        }
      });

      // Add new structured data
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": finalTitle,
        "description": finalDescription,
        "url": finalUrl,
        "inLanguage": "ar",
        "isPartOf": {
          "@type": "WebSite",
          "name": "لوحة إدارة المصروفات",
          "url": baseUrl
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'page-structured-data';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    };

    updateStructuredData();
  }, [finalTitle, finalDescription, finalKeywords, finalImage, finalUrl, type, noindex, location.pathname]);

  return null;
};

export default SEO;

