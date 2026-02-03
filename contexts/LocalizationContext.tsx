import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type Language = "en" | "ru";

type LocalizationContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(
  undefined
);

const LANGUAGE_STORAGE_KEY = "@app_language";

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Tab Navigation
    "tabs.jobs": "Jobs",
    "tabs.saved": "Saved",
    "tabs.settings": "Settings",

    // Home Screen
    "home.title": "Remote Job Hunting",
    "home.search": "Search jobs...",
    "home.allJobs": "All Jobs",
    "home.noJobs": "No jobs found",
    "home.addJob": "Add Job",

    // Job Details
    "job.details": "Job Details",
    "job.company": "Company",
    "job.location": "Location",
    "job.salary": "Salary",
    "job.description": "Description",
    "job.requirements": "Requirements",
    "job.postedDate": "Posted",
    "job.apply": "Apply Now",
    "job.save": "Save Job",
    "job.unsave": "Remove from Saved",
    "job.edit": "Edit",
    "job.delete": "Delete",

    // Add/Edit Job
    "addJob.title": "Add New Job",
    "editJob.title": "Edit Job",
    "addJob.jobTitle": "Job Title",
    "addJob.company": "Company Name",
    "addJob.location": "Location",
    "addJob.salary": "Salary",
    "addJob.description": "Job Description",
    "addJob.requirements": "Requirements",
    "addJob.save": "Save Job",
    "addJob.cancel": "Cancel",
    "addJob.titlePlaceholder": "e.g. Senior React Developer",
    "addJob.companyPlaceholder": "e.g. Tech Company Inc.",
    "addJob.locationPlaceholder": "e.g. Remote, USA",
    "addJob.salaryPlaceholder": "e.g. $80,000 - $120,000",
    "addJob.descriptionPlaceholder": "Enter job description...",
    "addJob.requirementsPlaceholder": "Enter job requirements...",

    // Saved Jobs
    "saved.title": "Saved Jobs",
    "saved.noJobs": "No saved jobs yet",
    "saved.empty": "Start saving jobs you're interested in!",

    // Settings
    "settings.title": "Settings",
    "settings.appearance": "Appearance",
    "settings.theme": "Theme",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.language": "Language",
    "settings.languageSection": "Language & Region",
    "settings.english": "English",
    "settings.russian": "Русский",
    "settings.about": "About",
    "settings.version": "Version",
    "settings.appName": "Remote Job Hunting App",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.confirm": "Confirm",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.back": "Back",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",

    // Messages
    "message.jobAdded": "Job added successfully",
    "message.jobUpdated": "Job updated successfully",
    "message.jobDeleted": "Job deleted successfully",
    "message.jobSaved": "Job saved to favorites",
    "message.jobUnsaved": "Job removed from favorites",
    "message.deleteConfirm": "Are you sure you want to delete this job?",
  },
  ru: {
    // Tab Navigation
    "tabs.jobs": "Вакансии",
    "tabs.saved": "Сохранённые",
    "tabs.settings": "Настройки",

    // Home Screen
    "home.title": "Поиск удалённой работы",
    "home.search": "Поиск вакансий...",
    "home.allJobs": "Все вакансии",
    "home.noJobs": "Вакансии не найдены",
    "home.addJob": "Добавить вакансию",

    // Job Details
    "job.details": "Детали вакансии",
    "job.company": "Компания",
    "job.location": "Местоположение",
    "job.salary": "Зарплата",
    "job.description": "Описание",
    "job.requirements": "Требования",
    "job.postedDate": "Опубликовано",
    "job.apply": "Откликнуться",
    "job.save": "Сохранить",
    "job.unsave": "Удалить из сохранённых",
    "job.edit": "Редактировать",
    "job.delete": "Удалить",

    // Add/Edit Job
    "addJob.title": "Добавить вакансию",
    "editJob.title": "Редактировать вакансию",
    "addJob.jobTitle": "Название вакансии",
    "addJob.company": "Название компании",
    "addJob.location": "Местоположение",
    "addJob.salary": "Зарплата",
    "addJob.description": "Описание вакансии",
    "addJob.requirements": "Требования",
    "addJob.save": "Сохранить",
    "addJob.cancel": "Отмена",
    "addJob.titlePlaceholder": "например, Senior React разработчик",
    "addJob.companyPlaceholder": "например, Технологическая компания",
    "addJob.locationPlaceholder": "например, Удалённо, Россия",
    "addJob.salaryPlaceholder": "например, 150,000 - 250,000 ₽",
    "addJob.descriptionPlaceholder": "Введите описание вакансии...",
    "addJob.requirementsPlaceholder": "Введите требования...",

    // Saved Jobs
    "saved.title": "Сохранённые вакансии",
    "saved.noJobs": "Нет сохранённых вакансий",
    "saved.empty": "Начните сохранять интересующие вас вакансии!",

    // Settings
    "settings.title": "Настройки",
    "settings.appearance": "Внешний вид",
    "settings.theme": "Тема",
    "settings.light": "Светлая",
    "settings.dark": "Тёмная",
    "settings.language": "Язык",
    "settings.languageSection": "Язык и регион",
    "settings.english": "English",
    "settings.russian": "Русский",
    "settings.about": "О приложении",
    "settings.version": "Версия",
    "settings.appName": "Приложение для поиска удалённой работы",

    // Common
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    "common.success": "Успешно",
    "common.confirm": "Подтвердить",
    "common.cancel": "Отмена",
    "common.save": "Сохранить",
    "common.delete": "Удалить",
    "common.edit": "Редактировать",
    "common.back": "Назад",
    "common.search": "Поиск",
    "common.filter": "Фильтр",
    "common.sort": "Сортировка",

    // Messages
    "message.jobAdded": "Вакансия успешно добавлена",
    "message.jobUpdated": "Вакансия успешно обновлена",
    "message.jobDeleted": "Вакансия успешно удалена",
    "message.jobSaved": "Вакансия сохранена в избранное",
    "message.jobUnsaved": "Вакансия удалена из избранного",
    "message.deleteConfirm": "Вы уверены, что хотите удалить эту вакансию?",
  },
};

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage === "en" || savedLanguage === "ru") {
        setLanguageState(savedLanguage);
      } else {
        // Detect system language
        const systemLanguage = Localization.getLocales()[0]?.languageCode;
        const detectedLanguage: Language =
          systemLanguage === "ru" ? "ru" : "en";
        setLanguageState(detectedLanguage);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LocalizationContext.Provider
      value={{ language, setLanguage, t, isLoading }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error(
      "useLocalization must be used within a LocalizationProvider"
    );
  }
  return context;
}
