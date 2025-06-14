import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, SelectChangeEvent } from '@mui/material';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (event: SelectChangeEvent) => {
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang); // Сохраняем выбранный язык
  };

  return (
    <Select
      value={i18n.language}
      onChange={changeLanguage}
      sx={{ minWidth: 120, color: 'inherit' }}
    >
      <MenuItem value="ja">{t('japanese')}</MenuItem>
      <MenuItem value="en">{t('english')}</MenuItem>
    </Select>
  );
};

export default LanguageSwitcher;