
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Tarot() {

  const [, setLocation] = useLocation();
  const [context, setContext] = useState("");
  const [questions, setQuestions] = useState<string[]>(["", "", "", "", ""]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [stage, setStage] = useState<"form" | "payment" | "response">("form");
  const [response, setResponse] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const createConsultation = trpc.tarot.createConsultation.useMutation();
  const generateResponses = trpc.tarot.generateResponses.useMutation();
  const createPaymentPreference = trpc.payment.createPreference.useMutation();

  const prices: Record<number, string> = {
    1: "3.00",
    2: "5.00",
    3: "7.00",
    5: "10.00",
  };

  // Check if returning from payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("paid");
    const consultId = params.get("consultation");

    if (paid === "true" && consultId) {
      setConsultationId(consultId);
      setStage("response");
      loadResponse(consultId);
    }
  }, []);

  const getConsultation = trpc.tarot.getConsultation.useQuery(
    { id: consultationId || "" },
    { enabled: !!consultationId && stage === "response" }
  );

  useEffect(() => {
    if (getConsultation.data?.responses && getConsultation.data.responses.length > 0) {
      setResponse(getConsultation.data.responses[0]);
    }
  }, [getConsultation.data]);

  const loadResponse = (consultId: string) => {
    // Response will be loaded via useQuery hook
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!context.trim()) {
      alert("Por favor, contextualize sua situação");
      return;
    }

    if (context.trim().length < 5) {
      alert("Contexto deve ter no mínimo 5 caracteres");
      return;
    }

    const filledQuestions = questions.slice(0, numberOfQuestions).filter((q) => q.trim());
    if (filledQuestions.length !== numberOfQuestions) {
      alert(`Por favor, preencha todas as ${numberOfQuestions} pergunta(s)`);
      return;
    }

    // Validate that all questions have at least 3 characters
    for (let i = 0; i < filledQuestions.length; i++) {
      if (filledQuestions[i].trim().length < 3) {
        alert(`Pergunta ${i + 1} deve ter no mínimo 3 caracteres`);
        return;
      }
    }

    setIsProcessing(true);
    try {
      const result = await createConsultation.mutateAsync({
        context,
        questions: filledQuestions,
        numberOfQuestions,
      });

      setConsultationId(result.consultationId);
      setStage("payment");
    } catch (error) {
      console.error("Erro ao criar consulta:", error);
      alert("Erro ao criar consulta. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!consultationId) return;

    setIsProcessing(true);
    try {
      const result = await createPaymentPreference.mutateAsync({
        consultationType: "tarot",
        amount: parseFloat(prices[numberOfQuestions]),
        description: `Leitura de Tarot - ${numberOfQuestions} pergunta(s)`,
        consultationId,
      });

      if (result.initPoint) {
        // Store info for callback
        localStorage.setItem("currentConsultationId", consultationId);
        localStorage.setItem("currentConsultationType", "tarot");
        localStorage.setItem("pendingPaymentId", result.paymentId);
        
        // Redirect to Mercado Pago
        window.location.href = result.initPoint;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Erro ao processar pagamento:", errorMessage);
      console.error("Erro completo:", error);
      alert(`Erro ao processar pagamento: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseResponses = (responseText: string) => {
    const parts = responseText.split("---");
    const questionAnswers: Array<{ question: string; answer: string }> = [];
    let contextGeral = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.startsWith("Pergunta")) {
        const match = part.match(/Pergunta \d+: ([\s\S]*?)\n\n([\s\S]*)/);
        if (match) {
          questionAnswers.push({
            question: match[1].trim(),
            answer: match[2].trim(),
          });
        }
      } else if (part.startsWith("Contexto Geral")) {
        contextGeral = part.replace("Contexto Geral:", "").trim();
      }
    }

    return { questionAnswers, contextGeral };
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
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 flex items-center gap-2">
            <Wand2 className="w-8 h-8" />
            Leitura de Tarot
          </h1>
        </div>

        {/* Form Stage */}
        {stage === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-6">Como Funciona</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="text-2xl">1️⃣</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Contexto</h4>
                      <p className="text-sm text-purple-200">Descreva a situação ou área de interesse</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-2xl">2️⃣</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Perguntas</h4>
                      <p className="text-sm text-purple-200">Formule suas perguntas com clareza</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-2xl">3️⃣</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Pagamento</h4>
                      <p className="text-sm text-purple-200">Confirme a consulta com segurança</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-2xl">4️⃣</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Leitura</h4>
                      <p className="text-sm text-purple-200">Receba a mensagem do plano espiritual</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Pricing */}
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">Tabela de Preços</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-purple-200">
                    <span>1 pergunta</span>
                    <span className="font-bold text-yellow-300">R$ 3,00</span>
                  </div>
                  <div className="flex justify-between text-purple-200">
                    <span>2 perguntas</span>
                    <span className="font-bold text-yellow-300">R$ 5,00</span>
                  </div>
                  <div className="flex justify-between text-purple-200">
                    <span>3 perguntas</span>
                    <span className="font-bold text-yellow-300">R$ 7,00</span>
                  </div>
                  <div className="flex justify-between text-purple-200">
                    <span>5 perguntas</span>
                    <span className="font-bold text-yellow-300">R$ 10,00</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-xl font-bold text-pink-300 mb-4">Sua Consulta</h3>

                {/* Context */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    Contexto da Situação
                  </label>
                  <Textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Descreva a situação ou área de interesse..."
                    className="bg-purple-800/30 border-purple-400/30 text-purple-100 placeholder:text-purple-400"
                    rows={3}
                  />
                </div>

                {/* Number of Questions */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    Quantas perguntas? ({numberOfQuestions})
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNumberOfQuestions(num)}
                        className={`flex-1 py-2 rounded font-bold transition ${
                          numberOfQuestions === num
                            ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                            : "bg-purple-800/30 text-purple-200 hover:bg-purple-700/30"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-3 mb-6">
                  {Array.from({ length: numberOfQuestions }).map((_, i) => (
                    <div key={i}>
                      <label className="block text-sm font-semibold text-yellow-300 mb-1">
                        Pergunta {i + 1}
                      </label>
                      <Input
                        value={questions[i]}
                        onChange={(e) => handleQuestionChange(i, e.target.value)}
                        placeholder={`Digite sua pergunta ${i + 1}...`}
                        className="bg-purple-800/30 border-purple-400/30 text-purple-100 placeholder:text-purple-400"
                      />
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-lg py-6"
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
        {stage === "payment" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-400/50 p-8">
              <h2 className="text-2xl font-bold text-yellow-300 mb-4">💳 Confirmar Consulta de Tarot</h2>
              <p className="text-yellow-100 mb-6">
                Para receber a leitura profunda do Tarot sobre suas perguntas, realize o pagamento:
              </p>

              <div className="bg-yellow-950/60 p-6 rounded-lg border border-yellow-500/20 mb-6">
                <p className="text-yellow-400 font-semibold text-sm mb-2">Valor da Consulta</p>
                <p className="text-4xl font-bold text-yellow-300">R$ {prices[numberOfQuestions]}</p>
                <p className="text-yellow-200 text-sm mt-2">{numberOfQuestions} pergunta(s)</p>
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
                Após confirmar o pagamento, você receberá a leitura completa do Tarot.
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
        {stage === "response" && response && (() => {
          const { questionAnswers, contextGeral } = parseResponses(response);
          return (
            <div className="space-y-6">
              {/* Title */}
              <Card className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border-pink-400/50 p-6">
                <h2 className="text-2xl font-bold text-pink-300 flex items-center gap-2">
                  <Wand2 className="w-6 h-6" />
                  Mensagem do Plano Espiritual
                </h2>
              </Card>

              {/* Questions and Answers */}
              <div className="space-y-4">
                {questionAnswers.map((qa, index) => (
                  <Card key={index} className="bg-purple-900/30 border-purple-400/30 p-6">
                    <h3 className="text-lg font-bold text-pink-300 mb-3">
                      {index + 1}. {qa.question}
                    </h3>
                    <p className="text-purple-100 leading-relaxed">{qa.answer}</p>
                  </Card>
                ))}
              </div>

              {/* Context */}
              {contextGeral && (
                <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-400/50 p-6">
                  <h3 className="text-lg font-bold text-indigo-300 mb-3">✨ Contexto Geral</h3>
                  <p className="text-purple-100 leading-relaxed">{contextGeral}</p>
                </Card>
              )}

              {/* New Consultation Button */}
              <Button
                onClick={() => {
                  setContext("");
                  setQuestions(["", "", "", "", ""]);
                  setNumberOfQuestions(1);
                  setStage("form");
                  setResponse(null);
                  setConsultationId(null);
                  window.history.replaceState({}, "", "/tarot");
                }}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-lg py-6"
              >
                Nova Consulta
              </Button>
            </div>
          );
        })()}
      </main>
    </div>
  );
}

