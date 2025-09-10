const express = require('express');
const router = express.Router();

// Configurações de idiomas suportados
const supportedLanguages = {
  'en': { name: 'English', country: 'US', flag: '🇺🇸' },
  'en-CA': { name: 'English', country: 'Canada', flag: '🇨🇦' },
  'en-IN': { name: 'English', country: 'India', flag: '🇮🇳' },
  'en-GB': { name: 'English', country: 'United Kingdom', flag: '🇬🇧' },
  'en-AU': { name: 'English', country: 'Australia', flag: '🇦🇺' },
  'bg': { name: 'Български', country: 'Bulgaria', flag: '🇧🇬' },
  'de': { name: 'Deutsch', country: 'Germany', flag: '🇩🇪' },
  'ru': { name: 'Русский', country: 'Russia', flag: '🇷🇺' },
  'fr': { name: 'Français', country: 'France', flag: '🇫🇷' },
  'pt': { name: 'Português', country: 'Brazil', flag: '🇧🇷' }
};

// Traduções básicas
const translations = {
  en: {
    welcome: 'Welcome',
    models: 'Models',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    recent: 'Recent',
    popular: 'Popular',
    oldest: 'Oldest',
    random: 'Random',
    ethnicity: 'Ethnicity',
    age: 'Age',
    height: 'Height',
    weight: 'Weight',
    hair_color: 'Hair Color',
    eye_color: 'Eye Color',
    body_type: 'Body Type',
    view_profile: 'View Profile',
    share: 'Share',
    report: 'Report',
    broken_link: 'Broken Link',
    child_content: 'Child Content',
    no_consent: 'No Consent',
    inappropriate: 'Inappropriate',
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirm_password: 'Confirm Password',
    name: 'Name',
    age_confirmation: 'I confirm that I am 18 years or older',
    verify_email: 'Verify Email',
    forgot_password: 'Forgot Password',
    premium: 'Premium',
    free: 'Free'
  },
  pt: {
    welcome: 'Bem-vindo',
    models: 'Modelos',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    recent: 'Recente',
    popular: 'Popular',
    oldest: 'Mais Antigos',
    random: 'Aleatório',
    ethnicity: 'Etnia',
    age: 'Idade',
    height: 'Altura',
    weight: 'Peso',
    hair_color: 'Cor do Cabelo',
    eye_color: 'Cor dos Olhos',
    body_type: 'Tipo de Corpo',
    view_profile: 'Ver Perfil',
    share: 'Compartilhar',
    report: 'Denunciar',
    broken_link: 'Link Quebrado',
    child_content: 'Conteúdo Infantil',
    no_consent: 'Sem Consentimento',
    inappropriate: 'Inapropriado',
    login: 'Entrar',
    register: 'Registrar',
    email: 'Email',
    password: 'Senha',
    confirm_password: 'Confirmar Senha',
    name: 'Nome',
    age_confirmation: 'Confirmo que tenho 18 anos ou mais',
    verify_email: 'Verificar Email',
    forgot_password: 'Esqueci a Senha',
    premium: 'Premium',
    free: 'Gratuito'
  },
  fr: {
    welcome: 'Bienvenue',
    models: 'Modèles',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    recent: 'Récent',
    popular: 'Populaire',
    oldest: 'Plus Anciens',
    random: 'Aléatoire',
    ethnicity: 'Ethnicité',
    age: 'Âge',
    height: 'Taille',
    weight: 'Poids',
    hair_color: 'Couleur des Cheveux',
    eye_color: 'Couleur des Yeux',
    body_type: 'Type de Corps',
    view_profile: 'Voir le Profil',
    share: 'Partager',
    report: 'Signaler',
    broken_link: 'Lien Cassé',
    child_content: 'Contenu Enfant',
    no_consent: 'Sans Consentement',
    inappropriate: 'Inapproprié',
    login: 'Connexion',
    register: 'S\'inscrire',
    email: 'Email',
    password: 'Mot de Passe',
    confirm_password: 'Confirmer le Mot de Passe',
    name: 'Nom',
    age_confirmation: 'Je confirme avoir 18 ans ou plus',
    verify_email: 'Vérifier l\'Email',
    forgot_password: 'Mot de Passe Oublié',
    premium: 'Premium',
    free: 'Gratuit'
  },
  de: {
    welcome: 'Willkommen',
    models: 'Modelle',
    search: 'Suchen',
    filter: 'Filter',
    sort: 'Sortieren',
    recent: 'Neueste',
    popular: 'Beliebt',
    oldest: 'Älteste',
    random: 'Zufällig',
    ethnicity: 'Ethnizität',
    age: 'Alter',
    height: 'Größe',
    weight: 'Gewicht',
    hair_color: 'Haarfarbe',
    eye_color: 'Augenfarbe',
    body_type: 'Körpertyp',
    view_profile: 'Profil Ansehen',
    share: 'Teilen',
    report: 'Melden',
    broken_link: 'Defekter Link',
    child_content: 'Kinderinhalt',
    no_consent: 'Ohne Zustimmung',
    inappropriate: 'Unangemessen',
    login: 'Anmelden',
    register: 'Registrieren',
    email: 'Email',
    password: 'Passwort',
    confirm_password: 'Passwort Bestätigen',
    name: 'Name',
    age_confirmation: 'Ich bestätige, dass ich 18 Jahre oder älter bin',
    verify_email: 'Email Verifizieren',
    forgot_password: 'Passwort Vergessen',
    premium: 'Premium',
    free: 'Kostenlos'
  },
  ru: {
    welcome: 'Добро пожаловать',
    models: 'Модели',
    search: 'Поиск',
    filter: 'Фильтр',
    sort: 'Сортировать',
    recent: 'Недавние',
    popular: 'Популярные',
    oldest: 'Старые',
    random: 'Случайные',
    ethnicity: 'Этническая принадлежность',
    age: 'Возраст',
    height: 'Рост',
    weight: 'Вес',
    hair_color: 'Цвет волос',
    eye_color: 'Цвет глаз',
    body_type: 'Тип телосложения',
    view_profile: 'Посмотреть профиль',
    share: 'Поделиться',
    report: 'Пожаловаться',
    broken_link: 'Неработающая ссылка',
    child_content: 'Детский контент',
    no_consent: 'Без согласия',
    inappropriate: 'Неподходящий',
    login: 'Войти',
    register: 'Регистрация',
    email: 'Email',
    password: 'Пароль',
    confirm_password: 'Подтвердить пароль',
    name: 'Имя',
    age_confirmation: 'Подтверждаю, что мне 18 лет или больше',
    verify_email: 'Подтвердить Email',
    forgot_password: 'Забыли пароль',
    premium: 'Премиум',
    free: 'Бесплатно'
  }
};

// Detectar idioma baseado no cabeçalho Accept-Language
function detectLanguage(acceptLanguage) {
  if (!acceptLanguage) return 'en';
  
  const languages = acceptLanguage.split(',').map(lang => {
    const [code, quality = '1'] = lang.trim().split(';q=');
    return { code: code.toLowerCase(), quality: parseFloat(quality) };
  }).sort((a, b) => b.quality - a.quality);

  for (const lang of languages) {
    if (supportedLanguages[lang.code]) {
      return lang.code;
    }
    // Tentar apenas o código do idioma (ex: 'en' de 'en-US')
    const baseCode = lang.code.split('-')[0];
    if (supportedLanguages[baseCode]) {
      return baseCode;
    }
  }

  return 'en';
}

// Listar idiomas suportados
router.get('/languages', (req, res) => {
  res.json(supportedLanguages);
});

// Obter traduções para um idioma
router.get('/translations/:lang', (req, res) => {
  const { lang } = req.params;
  
  if (!supportedLanguages[lang]) {
    return res.status(404).json({ error: 'Idioma não suportado' });
  }

  const translation = translations[lang] || translations.en;
  
  res.json({
    language: lang,
    translations: translation
  });
});

// Detectar idioma automaticamente
router.get('/detect', (req, res) => {
  const acceptLanguage = req.headers['accept-language'];
  const detectedLang = detectLanguage(acceptLanguage);
  
  res.json({
    detected: detectedLang,
    supported: supportedLanguages[detectedLang],
    translations: translations[detectedLang] || translations.en
  });
});

// Middleware para adicionar traduções às requisições
router.use('/middleware/:lang', (req, res, next) => {
  const { lang } = req.params;
  
  if (supportedLanguages[lang]) {
    req.translations = translations[lang] || translations.en;
    req.language = lang;
  } else {
    req.translations = translations.en;
    req.language = 'en';
  }
  
  next();
});

module.exports = router;