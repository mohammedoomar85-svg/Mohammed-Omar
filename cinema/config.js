// إعدادات الموقع
// ضع مفتاح TMDB هنا (API Key v3 أو Read Access Token v4)، أو اتركه فاضي وأدخله من شاشة الإعداد في الموقع.
// تحصل عليه مجاناً من: https://www.themoviedb.org/settings/api
window.CINEMA_CONFIG = {
  TMDB_KEY: "",
  REGION: "SA",            // الدولة لعرض منصات المشاهدة: SA, KW, AE, EG, QA ...
  REFRESH_MINUTES: 30,     // تحديث تلقائي للمحتوى كل كم دقيقة والصفحة مفتوحة
  NEW_DAYS: 21             // يعتبر العمل "جديد" إذا نزل خلال هالعدد من الأيام
};
