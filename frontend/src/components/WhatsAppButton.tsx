import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/56977424442?text=Hola, necesito ayuda con un repuesto"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-whatsapp text-primary-foreground font-heading font-bold text-sm pl-4 pr-5 py-3 rounded-full shadow-lg hover:brightness-110 hover:scale-105 transition-all"
  >
    <MessageCircle className="w-5 h-5" />
    <span className="hidden sm:inline">¿Necesitas ayuda?</span>
  </a>
);

export default WhatsAppButton;
