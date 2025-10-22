import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function PaymentCallback() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkPaymentStatus = trpc.payment.checkPaymentStatus.useQuery(
    { paymentId: localStorage.getItem("pendingPaymentId") || "" },
    {
      enabled: !!localStorage.getItem("pendingPaymentId"),
      refetchInterval: 2000, // Poll every 2 seconds
      refetchIntervalInBackground: true,
    }
  );

  const generateResponses = trpc.tarot.generateResponses.useMutation();
  const generateAstralMap = trpc.astral.generateMap.useMutation();
  const generateOracle = trpc.oracle.generateInterpretation.useMutation();
  const generateNumerology = trpc.numerology.createReading.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment_id");
    const preferenceId = params.get("preference_id");
    const externalRef = params.get("external_reference");

    if (paymentId || preferenceId) {
      localStorage.setItem("pendingPaymentId", paymentId || preferenceId || "");
    }
  }, []);

  useEffect(() => {
    if (checkPaymentStatus.data?.status === "approved") {
      handlePaymentApproved();
    }
  }, [checkPaymentStatus.data?.status]);

  const handlePaymentApproved = async () => {
    try {
      // Get consultation info from localStorage
      const storedConsultationId = localStorage.getItem("currentConsultationId");
      const storedConsultationType = localStorage.getItem("currentConsultationType");

      if (!storedConsultationId || !storedConsultationType) {
        setStatus("error");
        setErrorMessage("Informações de consulta não encontradas");
        return;
      }

      setConsultationId(storedConsultationId);
      setConsultationType(storedConsultationType);

      // Generate response based on consultation type
      if (storedConsultationType === "tarot") {
        await generateResponses.mutateAsync({
          consultationId: storedConsultationId,
        });
      } else if (storedConsultationType === "astral") {
        await generateAstralMap.mutateAsync({
          mapId: storedConsultationId,
        });
      } else if (storedConsultationType === "oracle") {
        await generateOracle.mutateAsync({
          oracleId: storedConsultationId,
        });
      } else if (storedConsultationType === "numerology") {
        // Numerology creates reading immediately, no separate generation needed
        // Just mark as paid
        localStorage.setItem("numerologyPaid", "true");
      }

      // Clear localStorage
      localStorage.removeItem("pendingPaymentId");
      localStorage.removeItem("currentConsultationId");
      localStorage.removeItem("currentConsultationType");

      setStatus("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        if (storedConsultationType === "tarot") {
          setLocation(`/tarot?consultation=${storedConsultationId}&paid=true`);
        } else if (storedConsultationType === "astral") {
          setLocation(`/astral?consultation=${storedConsultationId}&paid=true`);
        } else if (storedConsultationType === "oracle") {
          setLocation(`/oracle?consultation=${storedConsultationId}&paid=true`);
        } else if (storedConsultationType === "numerology") {
          setLocation(`/numerology?consultation=${storedConsultationId}&paid=true`);
        }
      }, 2000);
    } catch (error) {
      console.error("Erro ao processar pagamento aprovado:", error);
      setStatus("error");
      setErrorMessage("Erro ao gerar resposta. Por favor, tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 flex items-center justify-center p-4">
      <Card className="bg-purple-900/40 border-purple-400/30 p-8 max-w-md w-full text-center">
        {status === "checking" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-purple-200 mb-2">Verificando Pagamento</h1>
            <p className="text-purple-300 mb-4">Aguarde enquanto confirmamos sua transação...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-300 mb-2">Pagamento Confirmado!</h1>
            <p className="text-purple-300 mb-4">Sua consulta foi processada com sucesso.</p>
            <p className="text-purple-400 text-sm">Redirecionando para sua leitura...</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-300 mb-2">Erro ao Processar</h1>
            <p className="text-purple-300 mb-4">{errorMessage}</p>
            <Button
              onClick={() => setLocation("/")}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              Voltar para Home
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

