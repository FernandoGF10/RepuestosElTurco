import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

let mpInitializedKey: string | null = null;

interface Props {
  pedidoId: string;
  amount: number;
  payerEmail: string;
  onAprobado: () => void;
  onRechazado: (motivo: string) => void;
}

const MercadoPagoBrick = ({ pedidoId, amount, payerEmail, onAprobado, onRechazado }: Props) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.pagos
      .publicKey()
      .then((r) => {
        // Re-inicializa si la key cambió (p. ej. se actualizó el .env del
        // backend con nuevas credenciales); nunca reutilizar una key vieja
        // cacheada en memoria del navegador.
        if (mpInitializedKey !== r.public_key) {
          initMercadoPago(r.public_key, { locale: "es-CL" });
          mpInitializedKey = r.public_key;
        }
        setPublicKey(r.public_key);
      })
      .catch(() =>
        setError(
          "No se pudo cargar Mercado Pago. Verifica que MP_PUBLIC_KEY esté configurado en el backend."
        )
      );
  }, []);

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        {error}
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando pasarela de pago...
      </div>
    );
  }

  return (
    <Payment
      key={pedidoId}
      initialization={{
        amount,
        payer: payerEmail ? { email: payerEmail } : undefined,
      }}
      customization={{
        paymentMethods: {
          creditCard: "all",
          debitCard: "all",
        },
      }}
      onSubmit={async ({ formData }) =>
        new Promise<void>((resolve, reject) => {
          api.pagos
            .procesar(pedidoId, {
              token: formData.token,
              issuer_id: formData.issuer_id,
              payment_method_id: formData.payment_method_id,
              installments: formData.installments ?? 1,
              payer_email: formData.payer?.email ?? payerEmail,
              identification: formData.payer?.identification,
            })
            .then((res) => {
              resolve();
              if (res.estado_pago === "aprobado") {
                onAprobado();
              } else {
                onRechazado(res.status_detail || res.status);
              }
            })
            .catch((err) => {
              reject();
              onRechazado(err instanceof Error ? err.message : "No se pudo procesar el pago.");
            });
        })
      }
      onError={async (err) => {
        console.error("Mercado Pago Brick error:", err);
      }}
    />
  );
};

export default MercadoPagoBrick;
