import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { AuthProvider } from "./auth/AuthProvider";
import { I18nextProvider } from "react-i18next";
import i18n from './i18n';
import { Helmet } from "react-helmet";
import AppRoutes from './AppRoutes';
import { InitialDataContext } from './shared/InitialDataContext';

const ServerApp = ({ location, initialData = {}, i18nStore }) => {
  const pathSegments = location.split('/').filter(Boolean);
  const langFromPath = pathSegments[0];
  const validLangs = ['en', 'tr'];
  const currentLang = validLangs.includes(langFromPath) ? langFromPath : 'tr';

  // SSR için i18n'i doğru dil ve resource ile ayarla
  if (i18nStore && i18nStore.resources && i18nStore.resources[currentLang]) {
    i18n.addResourceBundle(currentLang, 'translation', i18nStore.resources[currentLang].translation, true, true);
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }

  return (
    <I18nextProvider i18n={i18n}>
      <InitialDataContext.Provider value={initialData}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StaticRouter location={location}>
            <AuthProvider>
              <div className="App">
                <Helmet>
                  <html lang={currentLang} />
                </Helmet>
                <AppRoutes />
              </div>
            </AuthProvider>
          </StaticRouter>
        </LocalizationProvider>
      </InitialDataContext.Provider>
    </I18nextProvider>
  );
};

export default ServerApp;
