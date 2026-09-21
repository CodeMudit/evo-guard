import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "EvoGuard NER": "EvoGuard NER",
      "Disaster Risk Decision Support": "Disaster Risk Decision Support",
      "Command Center": "Command Center",
      "Field Sensors": "Field Sensors",
      "Risk Analysis": "Risk Analysis",
      "Environmental Data": "Environmental Data",
      "Trends & History": "Trends & History",
      "Alerts & Advisories": "Alerts & Advisories",
      "Field Reports": "Field Reports",
      "Hazard & Terrain": "Hazard & Terrain",
      "System Settings": "System Settings",
      "System Online": "System Online",
      "EXTREME": "EXTREME",
      "HIGH": "HIGH",
      "MODERATE": "MODERATE",
      "LOW": "LOW"
    }
  },
  hi: {
    translation: {
      "EvoGuard NER": "एवोगार्ड NER",
      "Disaster Risk Decision Support": "आपदा जोखिम निर्णय समर्थन",
      "Command Center": "नियंत्रण केंद्र",
      "Field Sensors": "फील्ड सेंसर",
      "Risk Analysis": "जोखिम विश्लेषण",
      "Environmental Data": "पर्यावरणीय डेटा",
      "Trends & History": "प्रवृत्तियां और इतिहास",
      "Alerts & Advisories": "अलर्ट और सलाह",
      "Field Reports": "फील्ड रिपोर्ट्स",
      "Hazard & Terrain": "खतरा और भूभाग",
      "System Settings": "सिस्टम सेटिंग्स",
      "System Online": "सिस्टम ऑनलाइन",
      "EXTREME": "अत्यधिक",
      "HIGH": "उच्च",
      "MODERATE": "मध्यम",
      "LOW": "निम्न"
    }
  },
  as: {
    translation: {
      "EvoGuard NER": "এভোগার্ড NER",
      "Disaster Risk Decision Support": "বিপৰ্যয় শংকা সিদ্ধান্ত সমৰ্থন",
      "Command Center": "কমাণ্ড চেণ্টাৰ",
      "Field Sensors": "ফিল্ড ছেন্সৰ",
      "Risk Analysis": "আশংকা বিশ্লেষণ",
      "Environmental Data": "পৰিৱেশৰ তথ্য",
      "Trends & History": "প্ৰৱণতা আৰু ইতিহাস",
      "Alerts & Advisories": "সতৰ্কবাণী আৰু পৰামৰ্শ",
      "Field Reports": "ফিল্ড ৰিপোৰ্ট",
      "Hazard & Terrain": "বিপদ আৰু ভূখণ্ড",
      "System Settings": "চিষ্টেম ছেটিংছ",
      "System Online": "চিষ্টেম অনলাইন",
      "EXTREME": "চৰম",
      "HIGH": "উচ্চ",
      "MODERATE": "মজলীয়া",
      "LOW": "নিম্ন"
    }
  },
  brx: {
    translation: {
      "EvoGuard NER": "EvoGuard NER (Bodo)",
      "Disaster Risk Decision Support": "Disaster Risk Decision Support (Bodo)",
      "Command Center": "Command Center (Bodo)",
      "Field Sensors": "Field Sensors (Bodo)",
      "EXTREME": "EXTREME (BRX)",
      "HIGH": "HIGH (BRX)",
      "MODERATE": "MODERATE (BRX)",
      "LOW": "LOW (BRX)"
    }
  },
  kha: {
    translation: {
      "EvoGuard NER": "EvoGuard NER (Khasi)",
      "Disaster Risk Decision Support": "Disaster Risk Decision Support (Khasi)",
      "Command Center": "Command Center (Khasi)",
      "Field Sensors": "Field Sensors (Khasi)",
      "EXTREME": "EXTREME (KHA)",
      "HIGH": "HIGH (KHA)",
      "MODERATE": "MODERATE (KHA)",
      "LOW": "LOW (KHA)"
    }
  },
  miz: {
    translation: {
      "EvoGuard NER": "EvoGuard NER (Mizo)",
      "Disaster Risk Decision Support": "Disaster Risk Decision Support (Mizo)",
      "Command Center": "Command Center (Mizo)",
      "Field Sensors": "Field Sensors (Mizo)",
      "EXTREME": "EXTREME (MIZ)",
      "HIGH": "HIGH (MIZ)",
      "MODERATE": "MODERATE (MIZ)",
      "LOW": "LOW (MIZ)"
    }
  },
  mni: {
    translation: {
      "EvoGuard NER": "EvoGuard NER (Manipuri)",
      "Disaster Risk Decision Support": "Disaster Risk Decision Support (Manipuri)",
      "Command Center": "Command Center (Manipuri)",
      "Field Sensors": "Field Sensors (Manipuri)",
      "EXTREME": "EXTREME (MNI)",
      "HIGH": "HIGH (MNI)",
      "MODERATE": "MODERATE (MNI)",
      "LOW": "LOW (MNI)"
    }
  },
  nag: {
    translation: {
      "EvoGuard NER": "EvoGuard NER (Nagamese)",
      "Disaster Risk Decision Support": "Disaster Risk Decision Support (Nagamese)",
      "Command Center": "Command Center (Nagamese)",
      "Field Sensors": "Field Sensors (Nagamese)",
      "EXTREME": "EXTREME (NAG)",
      "HIGH": "HIGH (NAG)",
      "MODERATE": "MODERATE (NAG)",
      "LOW": "LOW (NAG)"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
