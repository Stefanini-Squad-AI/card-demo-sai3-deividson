import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import { MenuBook } from '@mui/icons-material';
import { SystemHeader, type SystemHeaderProps } from './SystemHeader';
import { useLanguage } from '~/hooks/useLanguage';
import type { LoginLanguageCode, LoginTranslation } from '~/data/locales/login';

interface GlobalHeaderProps extends SystemHeaderProps {
  language?: LoginLanguageCode;
  setLanguage?: (language: LoginLanguageCode) => void;
  translation?: LoginTranslation;
  languageOptions?: { code: LoginLanguageCode; label: string }[];
  onDocsOpen?: () => void;
}

export function GlobalHeader(props: GlobalHeaderProps) {
  const theme = useTheme();
  const languageState = useLanguage();

  const {
    language: controlledLanguage,
    setLanguage: controlledSetLanguage,
    translation: controlledTranslation,
    languageOptions: controlledOptions,
    onDocsOpen,
    ...systemHeaderProps
  } = props;

  const language = controlledLanguage ?? languageState.language;
  const setLanguage = controlledSetLanguage ?? languageState.setLanguage;
  const translation = controlledTranslation ?? languageState.translation;
  const languageOptions = controlledOptions ?? languageState.languageOptions;

  const handleLanguageChange = useCallback(
    (event: ChangeEvent<{ value: unknown }>) => {
      const nextLanguage = event.target.value as LoginLanguageCode;
      if (nextLanguage !== language) {
        setLanguage(nextLanguage);
      }
    },
    [language, setLanguage]
  );

  const handleOpenDocs = useCallback(() => {
    if (onDocsOpen) {
      onDocsOpen();
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const baseUrl = import.meta.env.BASE_URL ?? '/';
    const docsUrl = `${window.location.origin}${baseUrl}docs/site/index.html`;
    window.open(docsUrl, '_blank', 'noopener,noreferrer');
  }, [onDocsOpen]);

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: { xs: 1.5, md: 0 },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, pr: { md: 2 } }}>
          <SystemHeader {...systemHeaderProps} />
        </Box>

        <Box
          component="section"
          aria-label="language and documentation controls"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-end', md: 'center' },
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            gap: 1.5,
            width: { xs: '100%', md: 'auto' },
            ml: { md: 2 },
            flexShrink: 0,
          }}
        >
          <FormControl
            size="small"
            variant="outlined"
            sx={{
              width: { xs: '100%', sm: '100%', md: 'auto' },
              minWidth: { md: 150 },
              flexShrink: 0,
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
              onChange={handleLanguageChange}
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
    </Box>
  );
}
