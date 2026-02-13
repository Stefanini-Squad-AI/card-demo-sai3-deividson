import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  CreditCard,
  MenuBook, // ✅ NUEVO: Icono para documentación
} from '@mui/icons-material';
import { SystemHeader } from '~/components/layout/SystemHeader';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { 
  loginUser, 
  selectAuthLoading, 
  selectAuthError, 
  clearError,
  selectIsAuthenticated,
  selectCurrentUser
} from '~/features/auth/authSlice';
import { useLanguage } from '~/hooks/useLanguage';
import type { LoginCredentials } from '~/types';
import type { LoginLanguageCode, LoginTranslation } from '~/data/locales/login';

type FieldValidationKey = keyof LoginTranslation['validations'];

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const { language, setLanguage, translation, languageOptions } = useLanguage();

  const [formData, setFormData] = useState<LoginCredentials>({
    userId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginCredentials, FieldValidationKey>>>({});
  
  const hasRedirected = useRef(false);
  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

  // ✅ NUEVO: Función para abrir documentación
  const handleOpenDocs = useCallback(() => {
    // Abrir en nueva pestaña la documentación
    const docsUrl = `${window.location.origin}${import.meta.env.BASE_URL || '/'}docs/site/index.html`;
    window.open(docsUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // ✅ CORRECCIÓN: Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user && !hasRedirected.current) {
      console.log('🔄 User already authenticated, redirecting...', { role: user.role });
      
      hasRedirected.current = true;
      
      // Obtener la ruta de destino desde location.state o usar la ruta por defecto
      const from = location.state?.from?.pathname;
      
      // Redirigir según el rol
      const targetPath = from && from !== '/login' 
        ? from 
        : user.role === 'admin' 
          ? '/menu/admin' 
          : '/menu/main';
      
      console.log('🎯 Redirecting to:', targetPath);
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  // Resetear el flag cuando el usuario se desautentica
  useEffect(() => {
    if (!isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated]);

  const validateForm = useCallback(() => {
    const errors: Partial<Record<keyof LoginCredentials, FieldValidationKey>> = {};
    
    if (!formData.userId.trim()) {
      errors.userId = 'userIdRequired';
    } else if (formData.userId.length > 8) {
      errors.userId = 'userIdMax';
    }

    if (!formData.password.trim()) {
      errors.password = 'passwordRequired';
    } else if (formData.password.length > 8) {
      errors.password = 'passwordMax';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof LoginCredentials) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    
    if (value.length <= 8) {
      setFormData(prev => ({ ...prev, [field]: value.toUpperCase() }));
      
      if (fieldErrors[field]) {
        setFieldErrors(prev => ({ ...prev, [field]: undefined }));
      }
      
      if (authError) {
        dispatch(clearError());
      }
    }
  }, [fieldErrors, authError, dispatch]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🔐 Attempting login with:', { userId: formData.userId });
      const result = await dispatch(loginUser(formData)).unwrap();
      console.log('✅ Login successful, result:', result);
      
    } catch (error) {
      console.error('❌ Login failed:', error);
    }
  }, [formData, validateForm, dispatch]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'F3' || event.key === 'Escape') {
      event.preventDefault();
      if (window.confirm('Are you sure you want to exit the system?')) {
        window.close();
      }
    }
  }, []);

  const handleAlertClose = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const getErrorMessage = useCallback(
    (error: string) => translation.backendErrors[error] ?? translation.backendErrorFallback,
    [translation]
  );

  // ✅ CORRECCIÓN: No mostrar el formulario si ya está autenticado
  if (isAuthenticated && user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Redirecting...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You are already signed in. Redirecting to your dashboard.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box onKeyDown={handleKeyDown} tabIndex={-1}>
        {/* SystemHeader y controles responsivos */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'flex-start' },
              justifyContent: { xs: 'flex-start', md: 'space-between' },
              gap: { xs: 1.5, md: 2 },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <SystemHeader
                transactionId="CC00"
                programName="COSGN00C"
                title={translation.headerTitle}
                subtitle={translation.headerSubtitle}
                showNavigation={false}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-end', md: 'center' },
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                gap: 1.5,
                width: { xs: '100%', md: 'auto' },
                mt: { xs: 1.5, md: 0 },
                alignSelf: { md: 'flex-start' },
                ml: { md: 2 },
              }}
            >
              <FormControl
                size="small"
                variant="outlined"
                sx={{
                  width: { xs: '100%', md: 'auto' },
                  minWidth: { md: 150 },
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.divider, 0.3),
                  },
                }}
              >
                <InputLabel>{translation.languageLabel}</InputLabel>
                <Select
                  value={language}
                  label={translation.languageLabel}
                  onChange={(event) =>
                    setLanguage(event.target.value as LoginLanguageCode)
                  }
                >
                  {languageOptions.map(option => (
                    <MenuItem key={option.code} value={option.code}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title={translation.docTooltip} arrow>
                <IconButton
                  onClick={handleOpenDocs}
                  size="small"
                  sx={{
                    alignSelf: { xs: 'flex-end', md: 'center' },
                    width: 44,
                    height: 44,
                    color: 'text.secondary',
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(4px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.2s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 0,
                  }}
                >
                  <MenuBook fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.1)})`,
            width: 'clamp(320px, 90vw, 1100px)',
            mx: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              alignItems: 'stretch',
              gap: { xs: 0, lg: 4 },
            }}
          >
            <Box
              sx={{
                flex: { xs: '1 1 auto', lg: '1 1 50%' },
                minWidth: { lg: 0 },
                maxWidth: { lg: '55%' },
                p: { xs: 3, md: 4 },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                  textAlign: 'left',
                  mb: { xs: 3, md: 4 },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                    border: `1px solid ${alpha(theme.palette.common.white, 0.4)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
                  }}
                >
                  <CreditCard fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                    {translation.cardBrandName}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {translation.cardBrandTagline}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  lineHeight: 1.2,
                  whiteSpace: 'pre',
                  textAlign: 'center',
                  overflow: 'auto',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {`+========================================+
|%%%%%%%  NATIONAL RESERVE NOTE  %%%%%%%%|
|%(1)  THE UNITED STATES OF KICSLAND (1)%|
|%$$              ___       ********  $$%|
|%$    {x}       (o o)                 $%|
|%$     ******  (  V  )      O N E     $%|
|%(1)          ---m-m---             (1)%|
|%%~~~~~~~~~~~ ONE DOLLAR ~~~~~~~~~~~~~%%|
+========================================+`}
              </Box>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                flex: { xs: '1 1 auto', lg: '1 1 50%' },
                minWidth: { lg: 0 },
                maxWidth: { lg: '55%' },
                py: { xs: 3, md: 4 },
                px: { xs: 3, md: 4 },
              }}
            >
              <Typography
                variant="h6"
                color="primary.main"
                textAlign="center"
                gutterBottom
                sx={{ mb: 3 }}
              >
                {translation.heroPrompt}
              </Typography>

              <Stack spacing={3}>
                <TextField
                  label={translation.userIdLabel}
                  value={formData.userId}
                  onChange={handleInputChange('userId')}
                  error={!!fieldErrors.userId}
                  helperText={
                    fieldErrors.userId
                      ? translation.validations[fieldErrors.userId]
                      : translation.helperMaxChars
                  }
                  disabled={isLoading}
                  autoFocus
                  inputProps={{
                    maxLength: 8,
                    style: { textTransform: 'uppercase' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  label={translation.passwordLabel}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={!!fieldErrors.password}
                  helperText={
                    fieldErrors.password
                      ? translation.validations[fieldErrors.password]
                      : translation.helperMaxChars
                  }
                  disabled={isLoading}
                  autoComplete="current-password"
                  inputProps={{
                    maxLength: 8,
                    style: { textTransform: 'uppercase' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                {(authError || hasFieldErrors) && (
                  <>
                    {authError ? (
                      <Alert
                        severity="error"
                        onClose={handleAlertClose}
                        sx={{ borderRadius: 2 }}
                      >
                        {getErrorMessage(authError)}
                      </Alert>
                    ) : (
                      <Alert
                        severity="error"
                        sx={{ borderRadius: 2 }}
                      >
                        {translation.correctionAlert}
                      </Alert>
                    )}
                  </>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  startIcon={<LoginIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: theme.palette.primary.contrastText,
                    border: 'none',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.secondary.main, 0.9)})`,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                    '&:active': {
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
                    },
                    '&:disabled': {
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.5)}, ${alpha(theme.palette.secondary.main, 0.5)})`,
                      color: alpha(theme.palette.primary.contrastText, 0.7),
                    },
                  }}
                >
                  {isLoading ? translation.buttonLoading : translation.buttonLabel}
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {translation.sampleTitle}
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                  <Typography variant="caption" sx={{ 
                    bgcolor: 'warning.main', 
                    color: 'warning.contrastText',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}>
                    {translation.sampleAdmin}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    bgcolor: 'success.main', 
                    color: 'success.contrastText',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}>
                    {translation.sampleBackOffice}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.grey[100], 0.5),
              borderTop: `1px solid ${theme.palette.divider}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {translation.footerText}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
