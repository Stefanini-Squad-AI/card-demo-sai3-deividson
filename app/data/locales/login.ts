export type LoginLanguageCode = 'es' | 'en';

export interface LoginTranslation {
  headerTitle: string;
  headerSubtitle: string;
  docTooltip: string;
  languageLabel: string;
  heroPrompt: string;
  userIdLabel: string;
  passwordLabel: string;
  helperMaxChars: string;
  buttonLabel: string;
  buttonLoading: string;
  correctionAlert: string;
  sampleTitle: string;
  sampleAdmin: string;
  sampleBackOffice: string;
  footerText: string;
  validations: {
    userIdRequired: string;
    userIdMax: string;
    passwordRequired: string;
    passwordMax: string;
  };
  backendErrors: Record<string, string>;
  backendErrorFallback: string;
}

export const loginTranslations: Record<LoginLanguageCode, LoginTranslation> = {
  es: {
    headerTitle: 'CardDemo - Aplicación de demostración de tarjetas',
    headerSubtitle: 'Modernización de mainframe',
    docTooltip: 'Ver documentación',
    languageLabel: 'Idioma',
    heroPrompt: 'Ingrese su identificación de usuario y contraseña, luego presione ENTER:',
    userIdLabel: 'ID de usuario',
    passwordLabel: 'Contraseña',
    helperMaxChars: '(Máximo 8 caracteres)',
    buttonLabel: 'ENTER = Iniciar sesión',
    buttonLoading: 'Iniciando sesión...',
    correctionAlert: 'Por favor, corrija los errores anteriores.',
    sampleTitle: 'Credenciales de ejemplo:',
    sampleAdmin: 'Admin: ADMIN001 / PASSWORD',
    sampleBackOffice: 'Back-Office: USER001 / PASSWORD',
    footerText: 'ENTER = Iniciar sesión • F3 = Salir',
    validations: {
      userIdRequired: 'Ingrese su ID de usuario.',
      userIdMax: 'El ID de usuario debe tener como máximo 8 caracteres.',
      passwordRequired: 'Ingrese su contraseña.',
      passwordMax: 'La contraseña debe tener como máximo 8 caracteres.',
    },
    backendErrors: {
      'Invalid credentials': 'Credenciales inválidas. Intente nuevamente.',
      'User not found': 'Usuario no encontrado. Verifique su identificación.',
      'Please check your input': 'Revise su ID de usuario y contraseña.',
      'Network error occurred': 'No se pudo verificar. Revise su conexión.',
    },
    backendErrorFallback: 'Ocurrió un error inesperado. Intente nuevamente.',
  },
  en: {
    headerTitle: 'CardDemo - Card Demo Application',
    headerSubtitle: 'Mainframe Modernization',
    docTooltip: 'View documentation',
    languageLabel: 'Language',
    heroPrompt: 'Enter your User ID and password, then press ENTER:',
    userIdLabel: 'User ID',
    passwordLabel: 'Password',
    helperMaxChars: '(Max 8 characters)',
    buttonLabel: 'ENTER = Sign in',
    buttonLoading: 'Signing in...',
    correctionAlert: 'Please correct the errors above.',
    sampleTitle: 'Sample credentials:',
    sampleAdmin: 'Admin: ADMIN001 / PASSWORD',
    sampleBackOffice: 'Back-Office: USER001 / PASSWORD',
    footerText: 'ENTER = Sign in • F3 = Exit',
    validations: {
      userIdRequired: 'Please enter your user ID.',
      userIdMax: 'User ID must be 8 characters or less.',
      passwordRequired: 'Please enter your password.',
      passwordMax: 'Password must be 8 characters or less.',
    },
    backendErrors: {
      'Invalid credentials': 'Incorrect credentials. Please try again.',
      'User not found': 'User not found. Please verify your ID.',
      'Please check your input': 'Please check your user ID and password.',
      'Network error occurred': 'Unable to verify credentials. Check your connection.',
    },
    backendErrorFallback: 'An unexpected error occurred. Please try again.',
  },
};

export const loginLanguageOptions: { code: LoginLanguageCode; label: string }[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'Inglés' },
];
