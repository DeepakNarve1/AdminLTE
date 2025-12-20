import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

export interface Language {
  key: string;
  icon: string;
  label: string;
}

const languages: Language[] = [
  {
    key: "en",
    icon: "flag-icon-us",
    label: "header.language.english",
  },
  {
    key: "tr",
    icon: "flag-icon-tr",
    label: "header.language.turkish",
  },
  {
    key: "de",
    icon: "flag-icon-de",
    label: "header.language.german",
  },
  {
    key: "fr",
    icon: "flag-icon-fr",
    label: "header.language.french",
  },
  {
    key: "es",
    icon: "flag-icon-es",
    label: "header.language.spanish",
  },
];

const LanguagesDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setDropdownOpen(false);
  };

  const getCurrentLanguage = (): Language => {
    const currentLanguage = i18n.language;
    if (currentLanguage) {
      const language = languages.find(
        (language: Language) => language.key === currentLanguage
      );
      return language || languages[0];
    }
    return languages[0];
  };

  const isActiveLanguage = (language: Language) => {
    return getCurrentLanguage().key === language.key
      ? "bg-gray-100 text-blue-600 font-medium"
      : "text-gray-700 hover:bg-gray-50";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="nav-link flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <i
          className={`flag-icon ${getCurrentLanguage().icon} text-lg shadow-sm`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
          {languages.map((language) => (
            <button
              type="button"
              key={language.key}
              className={`flex items-center w-full px-4 py-2 text-sm text-left ${isActiveLanguage(language)} transition-colors`}
              onClick={() => changeLanguage(language.key)}
            >
              <i className={`flag-icon ${language.icon} mr-3 text-lg`} />
              <span>{t(language.label)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguagesDropdown;
