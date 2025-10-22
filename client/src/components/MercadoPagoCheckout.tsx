import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface MercadoPagoCheckoutProps {
  consultationType: "tarot" | "astral" | "oracle" | "numerology";
  amount: number;
  description: string;
  consultationId: string;
  onPaymentSuccess: () => void;
  onPaymentFailure: () => void;
}

export function MercadoPagoCheckout({
  consultationType,
  amount,
  description,
  consultationId,
  onPaymentSuccess,
  onPaymentFailure,
}: MercadoPagoCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const createPreferenceMutation = trpc.payment.createPreference.useMutation();
  const checkPaymentQuery = trpc.payment.checkPaymentStatus.useQuery;

  // Carregar script do Mercado Pago
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // Criar preferência de pagamento
      const result = await createPreferenceMutation.mutateAsync({
        consultationType,
        amount,
        description,
        consultationId,
      });

      setPreferenceId(result.preferenceId);
      setPaymentId(result.paymentId);

      // Redirecionar para Mercado Pago
      if (result.initPoint) {
        window.location.href = result.initPoint;
      }
    } catch (error) {
      console.error("Erro ao criar preferência de pagamento:", error);
      onPaymentFailure();
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar status do pagamento quando retornar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    const savedPaymentId = localStorage.getItem("pendingPaymentId");

    if (status === "approved" && savedPaymentId) {
      const checkPayment = async () => {
        try {
          const response = await fetch(
            `/api/trpc/payment.checkPaymentStatus?input=${JSON.stringify({ paymentId: savedPaymentId })}`
          );
          const data = await response.json();
          if (data.result?.data?.status === "approved") {
            localStorage.removeItem("pendingPaymentId");
            onPaymentSuccess();
          }
        } catch (error) {
          onPaymentFailure();
        }
      };
      checkPayment();
    }
  }, []);

  // Salvar payment ID antes de redirecionar
  useEffect(() => {
    if (paymentId) {
      localStorage.setItem("pendingPaymentId", paymentId);
    }
  }, [paymentId]);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Resumo da Consulta</h3>
        <p className="text-lg mb-4">{description}</p>
        <div className="text-3xl font-bold">R$ {amount.toFixed(2)}</div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
      >
        {isLoading ? "Processando..." : "Pagar com Mercado Pago"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Você será redirecionado para o Mercado Pago para completar o pagamento
      </p>
    </div>
  );
}

