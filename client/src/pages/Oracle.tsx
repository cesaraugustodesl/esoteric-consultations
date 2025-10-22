import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowLeft, Loader2, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Oracle() {
  const [, setLocation] = useLocation();
  const [oracleType, setOracleType] = useState<"runas" | "anjos" | "buzios" | null>(null);
  const [question, setQuestion] = useState("");
  const [numberOfSymbols, setNumberOfSymbols] = useState(1);
  const [stage, setStage] = useState<"form" | "payment" | "response">("form");
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [oracleId, setOracleId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const createConsult = trpc.oracle.createConsult.useMutation();
  const createPaymentPreference = trpc.payment.createPreference.useMutation();

  const prices: Record<number, string> = {
    1: "5.00",
    3: "12.00",
    5: "20.00",
  };

  const oracleNames: Record<string, string> = {
    runas: "Runas",
    anjos: "Anjos",
    buzios: "Búzios",
  };

  const oracleDescriptions: Record<string, { title: string; description: string; benefits: string[] }> = {
    runas: {
      title: "Runas Nórdicas",
      description: "As Runas são símbolos ancestrais da tradição nórdica que representam forças da natureza e do universo. Cada runa carrega significados profundos relacionados a energia, transformação e orientação. Quando consultadas, revelam mensagens sobre sua situação atual e caminhos possíveis.",
      benefits: [
        "Clareza sobre situações presentes",
        "Orientação para decisões importantes",
        "Compreensão de padrões energéticos",
        "Conexão com sabedoria ancestral"
      ]
    },
    anjos: {
      title: "Oráculos dos Anjos",
      description: "Os Anjos são seres de luz que transmitem mensagens de amor, proteção e orientação divina. O oráculo dos anjos conecta você com a energia celestial, oferecendo conforto, esperança e direcionamento espiritual. Cada mensagem vem carregada de compaixão e sabedoria divina.",
      benefits: [
        "Conforto e proteção espiritual",
        "Mensagens de amor e esperança",
        "Orientação divina para sua jornada",
        "Conexão com seres de luz"
      ]
    },
    buzios: {
      title: "Búzios (Jogo de Búzios)",
      description: "O Jogo de Búzios é uma tradição ancestral africana que utiliza búzios como instrumentos de adivinhação. Os búzios revelam mensagens através de suas posições, conectando você com a sabedoria ancestral e as forças da natureza. É um oráculo profundo e transformador.",
      benefits: [
        "Revelações profundas sobre seu destino",
        "Conexão com sabedoria ancestral africana",
        "Mensagens da natureza e do universo",
        "Orientação para transformação pessoal"
      ]
    }
  };

  // Check if returning from payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("paid");
    const oracleIdParam = params.get("oracle");

    if (paid === "true" && oracleIdParam) {
      setOracleId(oracleIdParam);
      setStage("response");
      loadOracleResult(oracleIdParam);
    }
  }, []);

  const loadOracleResult = async (id: string) => {
    try {
      // The result should already be in the database from createConsult
      // We'll fetch it if needed
    } catch (error) {
      console.error("Erro ao carregar resultado:", error);
    }
  };

  const handleSubmit = async () => {
    if (!oracleType) {
      alert("Por favor, escolha um tipo de oráculo");
      return;
    }

    if (!question.trim()) {
      alert("Por favor, formule uma pergunta");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createConsult.mutateAsync({
        oracleType,
        question,
        numberOfSymbols,
      });
      setOracleId(result.oracleId);
      setResult(result);
      setStage("payment");
    } catch (error) {
      console.error("Erro ao consultar oráculo:", error);
      alert("Erro ao consultar. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!oracleId) return;

    setIsProcessing(true);
    try {
      const result = await createPaymentPreference.mutateAsync({
        consultationType: "oracle",
        amount: parseFloat(prices[numberOfSymbols]),
        description: `Oráculo de ${oracleNames[oracleType!]} - ${numberOfSymbols} símbolo(s)`,
        consultationId: oracleId,
      });

      if (result.initPoint) {
        // Store info for callback
        localStorage.setItem("currentConsultationId", oracleId);
        localStorage.setItem("currentConsultationType", "oracle");
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

  // Form Stage
  if (stage === "form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black text-white">
        {/* Header */}
        <header className="border-b border-purple-700/30 bg-black/40 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-purple-300 hover:bg-purple-900/30">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold">Oráculos Místicos</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="space-y-8">
            {/* Info Section */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-400/50 p-8">
              <h2 className="text-2xl font-bold mb-6 text-purple-300">Escolha seu Oráculo</h2>
              <p className="text-purple-200 mb-8">
                Os oráculos são ferramentas ancestrais de sabedoria que conectam você com mensagens do universo. Escolha o tipo que mais ressoa com você:
              </p>

              <div className="space-y-4">
                {Object.entries(oracleDescriptions).map(([key, oracle]) => (
                  <div key={key}>
                    <button
                      onClick={() => {
                        setOracleType(key as "runas" | "anjos" | "buzios");
                        setExpandedInfo(expandedInfo === key ? null : key);
                      }}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        oracleType === key
                          ? "border-cyan-400 bg-cyan-900/40"
                          : "border-purple-400/30 bg-purple-900/20 hover:bg-purple-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-cyan-300">{oracle.title}</h3>
                        <ChevronDown
                          className={`w-5 h-5 transition ${
                            expandedInfo === key ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {expandedInfo === key && (
                      <div className="bg-purple-900/20 border border-purple-400/30 border-t-0 p-4 rounded-b-lg">
                        <p className="text-purple-200 mb-4">{oracle.description}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-purple-300">Benefícios:</p>
                          <ul className="space-y-1">
                            {oracle.benefits.map((benefit, i) => (
                              <li key={i} className="text-sm text-purple-200 flex items-center gap-2">
                                <span className="text-cyan-400">✓</span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Form Card */}
            {oracleType && (
              <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-400/50 p-8">
                <h3 className="text-xl font-bold text-cyan-300 mb-6">Sua Consulta</h3>

                {/* Question */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    Sua Pergunta
                  </label>
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Formule sua pergunta com clareza..."
                    className="bg-cyan-800/30 border-cyan-400/30 text-cyan-100 placeholder:text-cyan-400"
                    rows={4}
                  />
                </div>

                {/* Number of Symbols */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-cyan-300 mb-3">
                    Quantos símbolos? ({numberOfSymbols})
                  </label>
                  <div className="flex gap-2">
                    {[1, 3, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNumberOfSymbols(num)}
                        className={`flex-1 py-2 rounded font-bold transition ${
                          numberOfSymbols === num
                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                            : "bg-cyan-800/30 text-cyan-200 hover:bg-cyan-700/30"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="bg-cyan-950/60 p-4 rounded-lg border border-cyan-500/20 mb-6">
                  <p className="text-cyan-400 font-semibold text-sm mb-1">Valor da Consulta</p>
                  <p className="text-3xl font-bold text-cyan-300">R$ {prices[numberOfSymbols]}</p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing || !question.trim()}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-lg py-6"
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
            )}
          </div>
        </main>
      </div>
    );
  }

  // Payment Stage
  if (stage === "payment" && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black text-white">
        {/* Header */}
        <header className="border-b border-purple-700/30 bg-black/40 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => setStage("form")}
              className="text-purple-300 hover:text-purple-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold">Confirmar Pagamento</h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12">
          <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-400/50 p-8">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">💳 Confirmar Consulta</h2>
            <p className="text-yellow-100 mb-6">
              Para receber a interpretação dos {oracleNames[oracleType!]}, realize o pagamento:
            </p>

            <div className="bg-yellow-950/60 p-6 rounded-lg border border-yellow-500/20 mb-6">
              <p className="text-yellow-400 font-semibold text-sm mb-2">Valor da Consulta</p>
              <p className="text-4xl font-bold text-yellow-300">R$ {prices[numberOfSymbols]}</p>
              <p className="text-yellow-200 text-sm mt-2">{oracleNames[oracleType!]} - {numberOfSymbols} símbolo(s)</p>
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
              Após confirmar o pagamento, você receberá a interpretação completa.
            </p>

            <Button
              variant="ghost"
              onClick={() => setStage("form")}
              className="w-full mt-4 text-yellow-300 hover:text-yellow-200"
            >
              ← Voltar ao Formulário
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  // Response Stage
  if (stage === "response" && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black text-white">
        {/* Header */}
        <header className="border-b border-purple-700/30 bg-black/40 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-purple-300 hover:bg-purple-900/30">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold">Oráculos Místicos</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="space-y-8">
            {/* Result Card */}
            <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-400/50 p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">✨ {oracleNames[oracleType!]}</h2>
                <p className="text-cyan-200">Sua pergunta: <span className="italic">{question}</span></p>
              </div>

              <div className="bg-cyan-950/60 rounded-lg p-6 mb-6 border border-cyan-500/30">
                <p className="text-lg text-cyan-50 leading-relaxed whitespace-pre-wrap">
                  {result.interpretation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-cyan-950/40 p-4 rounded-lg border border-cyan-500/20">
                  <p className="text-cyan-400 font-semibold">Símbolos Consultados</p>
                  <p className="text-2xl font-bold text-cyan-300 mt-2">{numberOfSymbols}</p>
                </div>
                <div className="bg-cyan-950/40 p-4 rounded-lg border border-cyan-500/20">
                  <p className="text-cyan-400 font-semibold">Valor da Consulta</p>
                  <p className="text-2xl font-bold text-cyan-300 mt-2">R$ {result.price}</p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setOracleType(null);
                  setQuestion("");
                  setNumberOfSymbols(1);
                  setStage("form");
                  setResult(null);
                  setOracleId(null);
                  window.history.replaceState({}, "", "/oracle");
                }}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-lg py-6"
              >
                Novo Oráculo
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

