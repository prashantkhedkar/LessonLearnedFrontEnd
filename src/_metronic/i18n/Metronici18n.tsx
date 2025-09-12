import React, { FC, createContext, useContext } from "react";
import { WithChildren } from "../helpers";

const I18N_CONFIG_KEY = process.env.REACT_APP_I18N_CONFIG_KEY || "i18nConfig";

type Props = {
  selectedLang: "ar" | "en";
};

const initialState: Props = {
  selectedLang: "ar",
};

function getConfig(): Props {
  const ls = localStorage.getItem(I18N_CONFIG_KEY);
  if (ls) {
    try {
      return JSON.parse(ls) as Props;
    } catch (er) {
      console.error(er);
    }
  }
  return initialState;
}

// Side effect
export function setLanguage(lang: string) {
  localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify({ selectedLang: lang }));

  // If ADFS is enabled then use OIDC Provider for authentication
  if (process.env.REACT_APP_IS_ADFS_ENABLED === "1") {
    window.location.href = "/";
  } else {
    // For Local development with Login Page
    window.location.reload();
  }
}

const I18nContext = createContext<Props>(initialState);

const useLang = () => {
  return useContext(I18nContext).selectedLang;
};

const useDirection = (lang) => {
  return lang === "ar" ? "rtl" : "ltr";
};

const MetronicI18nProvider: FC<WithChildren> = ({ children }) => {
  const lang = getConfig();
  var rootDiv = document.getElementById("root") as HTMLInputElement | null;

  if (rootDiv) {
    if (lang.selectedLang === "ar") {
      rootDiv.setAttribute("dir", "rtl");
      rootDiv.setAttribute("direction", "rtl");
      rootDiv.setAttribute("style", "direction:rtl");
      rootDiv.setAttribute("lang", "ar");
    } else {
      rootDiv.removeAttribute("dir");
      rootDiv.removeAttribute("direction");
      rootDiv.removeAttribute("style");
      rootDiv.removeAttribute("lang");
      rootDiv.setAttribute("lang", "en");
    }
  }

  const LayoutEn = React.lazy(
    () => import("../layout/cssBaseLayout/cssLayoutEn")
  );
  const LayoutAr = React.lazy(
    () => import("../layout/cssBaseLayout/cssLayoutAr")
  );

  return (
    <>
      <React.Suspense>
        {lang.selectedLang === "en" && (
          <LayoutEn>
            <I18nContext.Provider value={lang}>{children}</I18nContext.Provider>
          </LayoutEn>
        )}
        {lang.selectedLang === "ar" && (
          <LayoutAr>
            <I18nContext.Provider value={lang}>{children}</I18nContext.Provider>
          </LayoutAr>
        )}
      </React.Suspense>
    </>
  );
};

export { MetronicI18nProvider, useLang };
