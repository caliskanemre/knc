import React from 'react';
import Chatbot from '../../components/common/Chatbot/Chatbot';
import i18n from '../../lib/i18n';
import fs from 'fs';
import path from 'path';

export default function ChatbotPage() {
  return <Chatbot />;
}

export async function getServerSideProps(context) {
  const { locale = 'tr' } = context;
  try {
    // Sunucu tarafında ilgili locale dosyasını yükle
    const localesDir = path.join(process.cwd(), 'public', 'locales');
    const filePath = path.join(localesDir, locale, 'translation.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      i18n.addResourceBundle(locale, 'translation', data, true, true);
    }
    // Sunucu tarafında dili ayarla
    if (i18n.language !== locale) {
      await i18n.changeLanguage(locale);
    }
  } catch (e) {
    // Sessizce devam et
  }

  return { props: {} };
}
