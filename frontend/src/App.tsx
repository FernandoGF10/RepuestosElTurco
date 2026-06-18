import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cartContext";
import Index from "./pages/Index.tsx";
import Checkout from "./pages/Checkout.tsx";
import PedidoConfirmado from "./pages/PedidoConfirmado.tsx";
import NotFound from "./pages/NotFound.tsx";
import Nosotros from "./pages/Nosotros.tsx";
import AdminLayout from "@/admin/AdminLayout";
import RequireAuth from "@/admin/RequireAuth";
import Login from "@/admin/pages/Login";
import Dashboard from "@/admin/pages/Dashboard";
import Productos from "@/admin/pages/Productos";
import Pedidos from "@/admin/pages/Pedidos";
import Clientes from "@/admin/pages/Clientes";
import Reportes from "@/admin/pages/Reportes";
import Configuracion from "@/admin/pages/Configuracion";
import Usuarios from "@/admin/pages/Usuarios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido/:numero" element={<PedidoConfirmado />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="productos" element={<Productos />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="usuarios" element={<Usuarios />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
