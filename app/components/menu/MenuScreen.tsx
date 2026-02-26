import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Alert,
  Divider,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  ArrowForwardIos,
  KeyboardReturn,
  ExitToApp,
  AdminPanelSettings,
  Dashboard,
} from '@mui/icons-material';
import { GlobalHeader } from '~/components/layout/GlobalHeader';
import { useAppDispatch } from '~/store/hooks';
import { logoutUser } from '~/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import type { MenuData, MenuOption } from '~/types/menu';

interface MenuScreenProps {
  menuData: MenuData;
  onOptionSelect: (option: MenuOption) => void;
  onExit?: () => void;
  error?: string | null;
  loading?: boolean;
}

export function MenuScreen({
  menuData,
  onOptionSelect,
  onExit,
  error,
  loading = false,
}: MenuScreenProps) {
  const theme = useTheme();
  const isWideViewport = useMediaQuery('(min-width:1360px)');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectedInput, setSelectedInput] = useState('');
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === 'undefined' ? 0 : window.innerHeight
  );
  const headerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Only allow numbers and maximum 2 digits
    if (/^\d{0,2}$/.test(value)) {
      setSelectedInput(value);
    }
  }, []);

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedInput) return;
    
    const optionIndex = parseInt(selectedInput) - 1;
    const selectedOption = menuData.options[optionIndex];
    
    if (selectedOption && !selectedOption.disabled) {
      onOptionSelect(selectedOption);
    }
  }, [selectedInput, menuData.options, onOptionSelect]);

  const handleOptionClick = useCallback((option: MenuOption) => {
    if (!option.disabled) {
      onOptionSelect(option);
    }
  }, [onOptionSelect]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'F3' || (event.key === 'Escape')) {
      event.preventDefault();
      if (onExit) {
        onExit();
      } else {
        // Default logout if no onExit provided
        dispatch(logoutUser());
        navigate('/login');
      }
    }
  }, [onExit, dispatch, navigate]);

  const measureElementHeight = (element: HTMLDivElement | null) => {
    if (!element || typeof window === 'undefined') {
      return 0;
    }

    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    const marginTop = parseFloat(styles.marginTop || '0') || 0;
    const marginBottom = parseFloat(styles.marginBottom || '0') || 0;

    return rect.height + marginTop + marginBottom;
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateMeasurements = () => {
      setHeaderHeight(measureElementHeight(headerRef.current));
      setFooterHeight(measureElementHeight(footerRef.current));
    };

    updateMeasurements();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(updateMeasurements);

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const shouldCapList =
    viewportHeight > 0 &&
    viewportHeight < 720 &&
    headerHeight > 0 &&
    footerHeight > 0;

  const listHeightLimit = viewportHeight - headerHeight - footerHeight - 40;
  const adjustedListHeight = Math.max(listHeightLimit, 0);
  const baseListMaxHeight =
    shouldCapList && adjustedListHeight > 0 ? `${adjustedListHeight}px` : undefined;
  const listMaxHeight = isWideViewport ? '80vh' : baseListMaxHeight;

  return (
    <Container
      maxWidth={false}
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <Box
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        sx={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box ref={headerRef}>
          <GlobalHeader
            transactionId={menuData.transactionId}
            programName={menuData.programName}
            title={menuData.title}
            subtitle={menuData.subtitle || undefined}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
          }}
        >
          <Paper
            elevation={2}
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'hidden',
              width: '100%',
              background: `linear-gradient(145deg, ${alpha(
                theme.palette.background.paper,
                0.9
              )}, ${alpha(theme.palette.background.default, 0.1)})`,
            }}
          >
            {/* Menu Title */}
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                {menuData.title.includes('Admin') ? (
                  <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
                ) : (
                  <Dashboard sx={{ mr: 1, verticalAlign: 'middle' }} />
                )}
                Select an Option
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                px: { xs: 2, sm: 3 },
                py: { xs: 2, sm: 3 },
                overflow: 'hidden',
              }}
            >
              <Box
                component="nav"
                aria-label="System back-office options"
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  maxHeight: listMaxHeight,
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: 6,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.25),
                    borderRadius: 999,
                  },
                }}
              >
                <List
                  sx={{
                    mb: 0,
                    display: 'grid',
                    gridTemplateColumns: isWideViewport ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                    columnGap: isWideViewport ? '16px' : 0,
                    rowGap: isWideViewport ? '12px' : '8px',
                  }}
                >
                  {menuData.options.map((option, index) => (
                    <ListItem key={option.id} disablePadding sx={{ width: '100%' }}>
                      <ListItemButton
                        onClick={() => handleOptionClick(option)}
                        disabled={option.disabled || loading}
                        onMouseEnter={() => setHoveredOption(option.id)}
                        onMouseLeave={() => setHoveredOption(null)}
                        sx={{
                          width: '100%',
                          borderRadius: 2,
                          py: 1.5,
                          px: 2,
                          transition: 'all 0.2s ease-in-out',
                          border: `1px solid ${theme.palette.divider}`,
                          '&:hover': {
                            transform: 'translateX(8px)',
                            boxShadow: theme.shadows[4],
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5,
                            bgcolor: alpha(theme.palette.grey[500], 0.1),
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Chip
                            label={index + 1}
                            size="small"
                            color={hoveredOption === option.id ? 'primary' : 'default'}
                            sx={{
                              fontWeight: 600,
                              minWidth: 28,
                              height: 28,
                            }}
                          />
                        </ListItemIcon>

                        <ListItemText
                          primary={option.label}
                          secondary={option.description}
                          primaryTypographyProps={{
                            fontWeight: 500,
                            color: option.disabled ? 'text.disabled' : 'text.primary',
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.875rem',
                            color: option.disabled ? 'text.disabled' : 'text.secondary',
                          }}
                        />

                        {option.adminOnly && (
                          <Chip
                            label="Admin"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )}

                        <ArrowForwardIos
                          sx={{
                            fontSize: 16,
                            color: option.disabled ? 'text.disabled' : 'action.active',
                            opacity: hoveredOption === option.id ? 1 : 0.5,
                            transition: 'opacity 0.2s',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.6) }} />

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="body1" color="primary.main" fontWeight={600}>
                  Enter your selection:
                </Typography>

                <TextField
                  value={selectedInput}
                  onChange={handleInputChange}
                  placeholder="01"
                  size="small"
                  disabled={loading}
                  inputProps={{
                    maxLength: 2,
                    style: { textAlign: 'center', fontSize: '1.1rem', fontWeight: 600 },
                  }}
                  sx={{
                    width: 80,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!selectedInput || loading}
                  startIcon={<KeyboardReturn />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 600,
                  }}
                >
                  Continue
                </Button>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontWeight: 500,
                    },
                  }}
                >
                  {error}
                </Alert>
              )}
            </Box>

            <Box
              ref={footerRef}
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.grey[100], 0.5),
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                <Typography variant="body2" color="text.secondary">
                  <KeyboardReturn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  ENTER = Continue
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ExitToApp />}
                  onClick={onExit || (() => {
                    dispatch(logoutUser());
                    navigate('/login');
                  })}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  F3 = Exit
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
