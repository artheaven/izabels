'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals мониторинг для production
 * Отправляет метрики в консоль (можно подключить аналитику)
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // В production здесь можно отправлять в Google Analytics, Vercel Analytics и т.д.
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metric);
    }

    // Пример отправки в Google Analytics
    // if (window.gtag) {
    //   window.gtag('event', metric.name, {
    //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //     event_label: metric.id,
    //     non_interaction: true,
    //   });
    // }

    // Пример отправки в собственный API
    // fetch('/api/analytics/web-vitals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metric),
    // });
  });

  return null;
}

