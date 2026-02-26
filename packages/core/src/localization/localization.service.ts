import i18n from 'i18n';

export const Localization = {
  __: i18n.__,
  configure(directory: string, locales = ['pt', 'en'], defaultLocale = 'pt') {
    i18n.configure({
      directory,
      locales,
      defaultLocale,
      updateFiles: false,
    });
  },
};
