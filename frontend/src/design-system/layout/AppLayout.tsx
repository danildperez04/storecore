import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Boxes,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  ShoppingCart,
  Tag,
  Truck,
  UserRound,
  Users,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useAuthStore } from '@/app/stores/auth.store';

/** Ancho del menu lateral, fijo para que las tablas no se recalculen. */
const DRAWER_WIDTH = 248;

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  /** Solo visible para el ADMIN (RF-02). Ocultar no es seguridad: el server valida. */
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', to: '/', icon: LayoutDashboard },
  { label: 'Punto de venta', to: '/pos', icon: ShoppingCart },
  { label: 'Productos', to: '/productos', icon: Package },
  { label: 'Categorías', to: '/categorias', icon: Tag, adminOnly: true },
  { label: 'Inventario', to: '/inventario', icon: Boxes },
  { label: 'Compras', to: '/compras', icon: ClipboardList, adminOnly: true },
  { label: 'Proveedores', to: '/proveedores', icon: Truck, adminOnly: true },
  { label: 'Clientes', to: '/clientes', icon: Users, adminOnly: true },
  { label: 'Sucursales', to: '/sucursales', icon: Building2, adminOnly: true },
  { label: 'Usuarios', to: '/usuarios', icon: UserRound, adminOnly: true },
  { label: 'Reportes', to: '/reportes', icon: Receipt, adminOnly: true },
];

export interface AppLayoutProps {
  children?: ReactNode;
}

/**
 * Layout principal con menu lateral.
 *
 * Objetivo de uso: en una tablet del mostrador, el menu debe ser alcanzable con
 * el pulgar sin tapar el contenido, por eso se puede plegar.
 */
export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, clearSession } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const navigation = (
    <Box sx={{ overflowY: 'auto' }}>
      <Stack direction="row" spacing={1.5} sx={{ px: 2, py: 2, alignItems: 'center' }}>
        <Package size={26} style={{ color: '#2e7d32' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          StoreCore
        </Typography>
      </Stack>
      <Divider />
      <List sx={{ py: 1 }}>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setMobileOpen(false)}
            sx={{
              mx: 1,
              borderRadius: 1.5,
              '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
              <item.icon size={19} />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { sx: { fontWeight: 600 } } }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </IconButton>
          <Typography variant="body1" sx={{ fontWeight: 600, flexGrow: 1 }} noWrap>
            {user ? `Hola, ${user.fullName}` : 'StoreCore'}
          </Typography>
          <Tooltip title="Cerrar sesion">
            <Button color="inherit" startIcon={<LogOut size={18} />} onClick={handleLogout}>
              Salir
            </Button>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {navigation}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {navigation}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          p: { xs: 2, md: 3 },
          pt: { xs: 10, md: 11 },
        }}
      >
        {children ?? <Outlet />}
      </Box>
    </Box>
  );
}
