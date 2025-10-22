import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Numerology() {
  const [, setLocation] = useLocation();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [stage, setStage] = useState<"form" | "payment" | "response">("form");
  const [result, setResult] = useState<any>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const createReading = trpc.numerology.createReading.useMutation();
  const createPaymentPreference = trpc.payment.createPreference.useMutation();

  const price = "25.00";

  // Check if returning from payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("paid");
    const readingIdParam = params.get("reading");

    if (paid === "true" && readingIdParam) {
      setReadingId(readingIdParam);
      setStage("response");
    }
  }, []);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      alert("Por favor, insira seu nome completo");
      return;
    }

    if (!birthDate) {
      alert("Por favor, insira sua data de nascimento");
      return;
    }

    // Converter DD/MM/YYYY para YYYY-MM-DD
    let formattedDate = birthDate;
    if (birthDate.includes('/')) {
      const parts = birthDate.split('/');
      if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        alert('Por favor, insira a data no formato DD/MM/YYYY');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const response = await createReading.mutateAsync({
        fullName,
        birthDate: formattedDate,
      });
      setReadingId(response.numerologyId);
      setResult(response);
      setStage("payment");
    } catch (error) {
      console.error("Erro ao gerar leitura numerológica:", error);
      alert("Erro ao gerar leitura. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!readingId) return;

    setIsProcessing(true);
    try {
      const result = await createPaymentPreference.mutateAsync({
        consultationType: "numerology",
        amount: parseFloat(price),
        description: "Leitura Numerológica Completa",
        consultationId: readingId,
      });

      if (result.initPoint) {
        // Store info for callback
        localStorage.setItem("currentConsultationId", readingId);
        localStorage.setItem("currentConsultationType", "numerology");
        localStorage.setItem("pendingPaymentId", result.paymentId);
        
        // Redirect to Mercado Pago
        window.location.href = result.initPoint;
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center gap-2">
            <Sparkles className="w-8 h-8" />
            Numerologia
          </h1>
        </div>

        {/* Form Stage */}
        {stage === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">O que é Numerologia?</h3>
                <p className="text-purple-200 mb-4">
                  A Numerologia é uma ciência ancestral que estuda o significado dos números e sua influência na vida. Cada número carrega uma vibração energética única que revela aspectos profundos da sua personalidade, destino e propósito de vida.
                </p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="text-2xl">🔢</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Número de Destino</h4>
                      <p className="text-sm text-purple-200">Seu propósito de vida e missão</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-2xl">💫</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Número da Alma</h4>
                      <p className="text-sm text-purple-200">Seus desejos e motivações profundas</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-2xl">✨</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Número da Personalidade</h4>
                      <p className="text-sm text-purple-200">Como você é visto pelo mundo</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-2xl">🌟</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Número de Expressão</h4>
                      <p className="text-sm text-purple-200">Seus talentos e habilidades</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-2xl">📅</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Ano Pessoal</h4>
                      <p className="text-sm text-purple-200">Influências para o ano atual</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">Sua Leitura Inclui</h3>
                <ul className="space-y-2 text-purple-200 text-sm">
                  <li>✓ Cálculo de 5 números principais</li>
                  <li>✓ Interpretação detalhada de cada número</li>
                  <li>✓ Análise de compatibilidade</li>
                  <li>✓ Orientações para o ano pessoal</li>
                  <li>✓ Dicas práticas para harmonizar energias</li>
                </ul>
              </Card>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">Seus Dados</h3>

                {/* Full Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    Nome Completo
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo..."
                    className="bg-purple-800/30 border-purple-400/30 text-purple-100 placeholder:text-purple-400"
                  />
                </div>

                {/* Birth Date */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    Data de Nascimento (DD/MM/YYYY)
                  </label>
                  <Input
                    value={birthDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2);
                      }
                      if (value.length > 5) {
                        value = value.slice(0, 5) + '/' + value.slice(5, 9);
                      }
                      setBirthDate(value);
                    }}
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    className="bg-purple-800/30 border-purple-400/30 text-purple-100 placeholder:text-purple-400"
                  />
                </div>

                {/* Price */}
                <div className="bg-yellow-950/60 p-4 rounded-lg border border-yellow-500/20 mb-6">
                  <p className="text-yellow-400 font-semibold text-sm mb-1">Valor da Leitura</p>
                  <p className="text-3xl font-bold text-yellow-300">R$ {price}</p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-lg py-6"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Prosseguir para Pagamento"
                  )}
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Payment Stage */}
        {stage === "payment" && result && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-400/50 p-8">
              <h2 className="text-2xl font-bold text-yellow-300 mb-4">💳 Confirmar Leitura</h2>
              <p className="text-yellow-100 mb-6">
                Finalize o pagamento para receber sua leitura numerológica completa:
              </p>

              <div className="bg-yellow-950/60 p-6 rounded-lg border border-yellow-500/20 mb-6">
                <p className="text-yellow-400 font-semibold text-sm mb-2">Valor da Leitura</p>
                <p className="text-4xl font-bold text-yellow-300">R$ {price}</p>
                <p className="text-yellow-200 text-sm mt-2">Leitura Numerológica Completa (5 números)</p>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg text-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Pagar com Mercado Pago"
                )}
              </Button>

              <p className="text-yellow-200 text-xs mt-4 text-center">
                Após confirmar o pagamento, você receberá sua leitura numerológica.
              </p>

              <Button
                variant="ghost"
                onClick={() => setStage("form")}
                className="w-full mt-4 text-yellow-300 hover:text-yellow-200"
              >
                ← Voltar ao Formulário
              </Button>
            </Card>
          </div>
        )}

        {/* Response Stage */}
        {stage === "response" && result && (
          <div className="space-y-6">
            {/* Title */}
            <Card className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-400/50 p-6">
              <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Leitura Numerológica Completa
              </h2>
              <p className="text-yellow-200 text-sm mt-2">{result.summary}</p>
            </Card>

            {/* Numbers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Destiny Number */}
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-lg font-bold text-yellow-300 mb-3">🔢 Número de Destino</h3>
                <p className="text-4xl font-bold text-pink-400 mb-4">{result.destinyNumber}</p>
                <p className="text-purple-200 leading-relaxed">{result.destinyInterpretation}</p>
              </Card>

              {/* Soul Number */}
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-lg font-bold text-yellow-300 mb-3">💫 Número da Alma</h3>
                <p className="text-4xl font-bold text-pink-400 mb-4">{result.soulNumber}</p>
                <p className="text-purple-200 leading-relaxed">{result.soulInterpretation}</p>
              </Card>

              {/* Personality Number */}
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-lg font-bold text-yellow-300 mb-3">✨ Número da Personalidade</h3>
                <p className="text-4xl font-bold text-pink-400 mb-4">{result.personalityNumber}</p>
                <p className="text-purple-200 leading-relaxed">{result.personalityInterpretation}</p>
              </Card>

              {/* Expression Number */}
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-lg font-bold text-yellow-300 mb-3">🌟 Número de Expressão</h3>
                <p className="text-4xl font-bold text-pink-400 mb-4">{result.expressionNumber}</p>
                <p className="text-purple-200 leading-relaxed">{result.expressionInterpretation}</p>
              </Card>

              {/* Personal Year */}
              <Card className="bg-purple-900/30 border-purple-400/30 p-6 md:col-span-2">
                <h3 className="text-lg font-bold text-yellow-300 mb-3">📅 Ano Pessoal</h3>
                <p className="text-4xl font-bold text-pink-400 mb-4">{result.personalYearNumber}</p>
                <p className="text-purple-200 leading-relaxed">{result.personalYearInterpretation}</p>
              </Card>
            </div>

            {/* New Reading Button */}
            <Button
              onClick={() => {
                setFullName("");
                setBirthDate("");
                setStage("form");
                setResult(null);
                setReadingId(null);
                window.history.replaceState({}, "", "/numerology");
              }}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-lg py-6"
            >
              Nova Leitura
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

