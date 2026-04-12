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
    "tabs.profile": "Profile",
    "tabs.settings": "Settings",

    // Home Screen
    "home.title": "Remote Job Hunting",
    "home.search": "Search jobs...",
    "home.searchRemote": "Search remote jobs...",
    "home.allJobs": "All Jobs",
    "home.noJobs": "No jobs found",
    "home.addJob": "Add Job",
    "home.filters": "Filters",
    "filter.sortBy": "Sort By",
    "filter.newest": "Newest",
    "filter.oldest": "Oldest",
    "filter.jobType": "Job Type",
    "filter.all": "All",
    "filter.full-time": "Full Time",
    "filter.full_time": "Full Time",
    "filter.part-time": "Part Time",
    "filter.part_time": "Part Time",
    "filter.contract": "Contract",
    "filter.freelance": "Freelance",

    // Tabs LabWork 2
    "home.tabLocal": "My Jobs",
    "home.tabRemote": "Find Work",
    "home.onlineJobs": "Online Jobs",
    "home.loading": "Loading jobs...",
    "home.noRemoteJobs": "No remote jobs",
    "home.noConnection": "No internet connection and no cache",
    "home.noLocalJobs": "Start by adding your first job!",
    "home.noSearchResult": "No jobs found for",

    // Network & Cache
    "network.offline": "No internet connection",
    "network.restored": "Connection restored",
    "network.cached": "Showing cached data · will update when connected",

    // Source badges
    "badge.online": "Online",
    "badge.mine": "Mine",

    // Job Detail remote
    "job.notFound": "Job not found",
    "job.savedCount": "job saved",
    "job.savedCountPlural": "jobs saved",

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

    // Validation
    "validation.jobTitle": "Please enter a job title",
    "validation.company": "Please enter a company name",
    "validation.description": "Please enter a job description",

    // Errors
    "error.createJob": "Failed to create job",
    "error.updateJob": "Failed to update job",

    // Dialog
    "discard.confirm": "Are you sure you want to discard this job?",
    "common.yes": "Yes",
    "common.no": "No",

    // Auth
    "auth.welcomeBack": "Welcome back!",
    "auth.createAccount": "Create your account",
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.fillFields": "Please fill in all fields",
    "auth.passwordMismatch": "Passwords do not match",
    "auth.passwordTooShort": "Password must be at least 6 characters",
    "auth.usernameTooShort": "Username must be at least 3 characters",

    // Profile
    "profile.title": "Profile",
    "profile.username": "Username",
    "profile.memberSince": "Member since",
    "profile.active": "Active",
    "profile.signOut": "Sign Out",
    "profile.signOutConfirm": "Sign Out?",
    "profile.signOutMessage": "Are you sure you want to sign out?",

    // Share
    "share.title": "Share Job",
    "share.text": "Check out this job:",

    // Camera
    "camera.title": "Select Image",
    "camera.gallery": "Choose from Gallery",
    "camera.take": "Take a Photo",
    "camera.cancel": "Cancel",
  },
  ru: {
    // Tab Navigation
    "tabs.jobs": "Вакансии",
    "tabs.saved": "Сохранённые",
    "tabs.profile": "Профиль",
    "tabs.settings": "Настройки",

    // Home Screen
    "home.title": "Поиск удалённой работы",
    "home.search": "Поиск вакансий...",
    "home.searchRemote": "Поиск вакансий удалённо...",
    "home.allJobs": "Все вакансии",
    "home.noJobs": "Вакансии не найдены",
    "home.addJob": "Добавить вакансию",
    "home.filters": "Фильтры",
    "filter.sortBy": "Сортировка",
    "filter.newest": "Сначала новые",
    "filter.oldest": "Сначала старые",
    "filter.jobType": "Тип занятости",
    "filter.all": "Все",
    "filter.full-time": "Полная занятость",
    "filter.full_time": "Полная занятость",
    "filter.part-time": "Частичная занятость",
    "filter.part_time": "Частичная занятость",
    "filter.contract": "Контракт",
    "filter.freelance": "Фриланс",

    // Tabs LabWork 2
    "home.tabLocal": "Мои вакансии",
    "home.tabRemote": "Найти работу",
    "home.onlineJobs": "Online вакансии",
    "home.loading": "Загрузка вакансий...",
    "home.noRemoteJobs": "Нет вакансий",
    "home.noConnection": "Нет интернет-соединения и кэша",
    "home.noLocalJobs": "Добавьте первую вакансию!",
    "home.noSearchResult": "Нет вакансий по запросу",

    // Network & Cache
    "network.offline": "Нет подключения к интернету",
    "network.restored": "Соединение восстановлено",
    "network.cached": "Данные из кэша · обновятся при подключении",

    // Source badges
    "badge.online": "Online",
    "badge.mine": "Моя",

    // Job Detail remote
    "job.notFound": "Вакансия не найдена",
    "job.savedCount": "вакансия сохранена",
    "job.savedCountPlural": "вакансий сохранено",

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

    // Validation
    "validation.jobTitle": "Введите название вакансии",
    "validation.company": "Введите название компании",
    "validation.description": "Введите описание вакансии",

    // Errors
    "error.createJob": "Не удалось создать вакансию",
    "error.updateJob": "Не удалось обновить вакансию",

    // Dialog
    "discard.confirm": "Отменить изменения?",
    "common.yes": "Да",
    "common.no": "Нет",

    // Auth
    "auth.welcomeBack": "С возвращением!",
    "auth.createAccount": "Создайте аккаунт",
    "auth.username": "Имя пользователя",
    "auth.password": "Пароль",
    "auth.confirmPassword": "Подтвердите пароль",
    "auth.signIn": "Войти",
    "auth.signUp": "Регистрация",
    "auth.noAccount": "Нет аккаунта?",
    "auth.hasAccount": "Уже есть аккаунт?",
    "auth.fillFields": "Пожалуйста, заполните все поля",
    "auth.passwordMismatch": "Пароли не совпадают",
    "auth.passwordTooShort": "Пароль должен быть не менее 6 символов",
    "auth.usernameTooShort": "Имя пользователя должно быть не менее 3 символов",

    // Profile
    "profile.title": "Профиль",
    "profile.username": "Имя пользователя",
    "profile.memberSince": "Дата регистрации",
    "profile.active": "Активен",
    "profile.signOut": "Выйти",
    "profile.signOutConfirm": "Выйти?",
    "profile.signOutMessage": "Вы уверены, что хотите выйти из аккаунта?",

    // Share
    "share.title": "Поделиться вакансией",
    "share.text": "Посмотри эту вакансию:",

    // Camera
    "camera.title": "Выберите изображение",
    "camera.gallery": "Выбрать из галереи",
    "camera.take": "Сделать фото",
    "camera.cancel": "Отмена",
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
