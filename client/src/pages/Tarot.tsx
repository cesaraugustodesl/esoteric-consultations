import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Tarot() {
  const { isAuthenticated } = useAuth();
  const [context, setContext] = useState("");
  const [questions, setQuestions] = useState<string[]>(["", "", "", "", ""]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const createConsultation = trpc.tarot.createConsultation.useMutation();
  const generateResponses = trpc.tarot.generateResponses.useMutation();
  const createPaymentPreference = trpc.payment.createPreference.useMutation();

  const prices: Record<number, string> = {
    1: "3.00",
    2: "5.00",
    3: "7.00",
    5: "10.00",
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

    const filledQuestions = questions.slice(0, numberOfQuestions).filter((q) => q.trim());
    if (filledQuestions.length !== numberOfQuestions) {
      alert(`Por favor, preencha todas as ${numberOfQuestions} pergunta(s)`);
      return;
    }

    try {
      const result = await createConsultation.mutateAsync({
        context,
        questions: filledQuestions,
        numberOfQuestions,
      });

      setConsultationId(result.consultationId);

      const responses = await generateResponses.mutateAsync({
        consultationId: result.consultationId,
      });

      setResponse(responses.responses[0]);
      setSubmitted(true);
    } catch (error) {
      console.error("Erro ao consultar Tarot:", error);
      alert("Erro ao consultar. Tente novamente.");
    }
  };

  const handlePayment = async () => {
    if (!consultationId) return;

    setIsProcessingPayment(true);
    try {
      const result = await createPaymentPreference.mutateAsync({
        consultationType: "tarot",
        amount: parseFloat(prices[numberOfQuestions]),
        description: `Leitura de Tarot - ${numberOfQuestions} pergunta(s)`,
        consultationId,
      });

      // Redirecionar para Mercado Pago
      if (result.initPoint) {
        localStorage.setItem("pendingPaymentId", result.paymentId);
        window.location.href = result.initPoint;
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const parseResponses = (responseText: string) => {
    const parts = responseText.split("---");
    const questionAnswers: Array<{ question: string; answer: string }> = [];
    let contextGeral = "";

    if (parts.length > 0) {
      const mainContent = parts[0];
      const contextContent = parts[1];

      const items = mainContent.split(/\n(?=\*\*\d+\.)/);
      items.forEach((item) => {
        const match = item.match(/\*\*(\d+\.\s[^*]+)\*\*\n([\s\S]*?)(?=\n\n|$)/);
        if (match) {
          questionAnswers.push({
            question: match[1].replace(/\*\*/g, ""),
            answer: match[2].trim(),
          });
        }
      });

      if (contextContent) {
        contextGeral = contextContent.replace(/\*\*Contexto Geral\*\*\n/, "").trim();
      }
    }

    return { questionAnswers, contextGeral };
  };

  const { questionAnswers, contextGeral } = response ? parseResponses(response) : { questionAnswers: [], contextGeral: "" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-purple-700/30 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-purple-300 hover:bg-purple-900/30">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold">Leitura de Tarot</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
            {!submitted ? (
              <>
                {/* Context */}
                <Card className="bg-purple-900/20 border-purple-500/30 p-8">
                  <h2 className="text-2xl font-bold mb-6">Contextualize sua Situação</h2>
                  <Textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Descreva brevemente a situação ou área da vida sobre a qual deseja orientação..."
                    className="bg-purple-950/50 border-purple-500/30 text-white placeholder-purple-400/50 focus:border-purple-400"
                    rows={4}
                  />
                  <p className="text-sm text-purple-300 mt-3">
                    Quanto mais detalhes você fornecer, mais profunda será a leitura.
                  </p>
                </Card>

                {/* Number of Questions */}
                <Card className="bg-purple-900/20 border-purple-500/30 p-8">
                  <h2 className="text-2xl font-bold mb-6">Quantas Perguntas?</h2>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNumberOfQuestions(num)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          numberOfQuestions === num
                            ? "border-purple-400 bg-purple-600/30"
                            : "border-purple-500/30 bg-purple-900/20 hover:border-purple-400/60"
                        }`}
                      >
                        <div className="text-2xl font-bold mb-2">{num}</div>
                        <div className="text-sm text-purple-300">R$ {prices[num]}</div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Questions */}
                <Card className="bg-purple-900/20 border-purple-500/30 p-8">
                  <h2 className="text-2xl font-bold mb-6">Suas Perguntas</h2>
                  <div className="space-y-4">
                    {Array.from({ length: numberOfQuestions }).map((_, index) => (
                      <div key={index}>
                        <label className="block text-sm text-purple-300 mb-2">
                          Pergunta {index + 1}
                        </label>
                        <Textarea
                          value={questions[index]}
                          onChange={(e) => handleQuestionChange(index, e.target.value)}
                          placeholder={`Formule sua pergunta com clareza e intenção...`}
                          className="bg-purple-950/50 border-purple-500/30 text-white placeholder-purple-400/50 focus:border-purple-400"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={createConsultation.isPending || generateResponses.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                >
                  {createConsultation.isPending || generateResponses.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    `Consultar Tarot - R$ ${prices[numberOfQuestions]}`
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Response Cards */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Mensagem do Plano Espiritual</h2>
                  
                  {questionAnswers.map((item, index) => (
                    <Card key={index} className="bg-purple-900/30 border-purple-400/50 p-6 hover:border-purple-300/80 transition-all">
                      <h3 className="text-lg font-bold mb-3 text-purple-200">{item.question}</h3>
                      <p className="text-purple-100 leading-relaxed">{item.answer}</p>
                    </Card>
                  ))}

                  {contextGeral && (
                    <Card className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 border-pink-400/50 p-8 mt-8">
                      <h3 className="text-xl font-bold mb-4 text-pink-300">✨ Contexto Geral</h3>
                      <p className="text-purple-100 leading-relaxed">{contextGeral}</p>
                    </Card>
                  )}
                </div>

                {/* Payment Section */}
                <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-400/50 p-8">
                  <h3 className="text-xl font-bold mb-4 text-yellow-300">💳 Confirmar Consulta</h3>
                  <p className="text-purple-100 mb-6">
                    Para confirmar esta leitura e apoiar nosso trabalho espiritual, realize o pagamento:
                  </p>
                  <div className="text-3xl font-bold text-yellow-300 mb-6">
                    R$ {prices[numberOfQuestions]}
                  </div>
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Pagar com Mercado Pago"
                    )}
                  </Button>
                </Card>

                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setResponse(null);
                    setContext("");
                    setQuestions(["", "", "", "", ""]);
                    setNumberOfQuestions(1);
                    setConsultationId(null);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6 mt-6"
                >
                  Nova Consulta
                </Button>
              </>
            )}
          </div>

          {/* Info Sidebar */}
          <div>
            <Card className="bg-purple-900/20 border-purple-500/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Como Funciona</h3>
              <div className="space-y-4 text-sm text-purple-200">
                <div>
                  <p className="font-bold text-purple-300 mb-1">1. Contexto</p>
                  <p>Descreva a situação ou área de interesse</p>
                </div>
                <div>
                  <p className="font-bold text-purple-300 mb-1">2. Perguntas</p>
                  <p>Formule suas perguntas com clareza</p>
                </div>
                <div>
                  <p className="font-bold text-purple-300 mb-1">3. Leitura</p>
                  <p>Receba respostas profundas do plano espiritual</p>
                </div>
                <div>
                  <p className="font-bold text-purple-300 mb-1">4. Pagamento</p>
                  <p>Confirme a consulta com segurança</p>
                </div>
                <div className="pt-4 border-t border-purple-500/30">
                  <p className="font-bold text-purple-300 mb-2">Tabela de Preços</p>
                  <div className="space-y-1 text-purple-300">
                    <p>💎 1 pergunta: R$ 3,00</p>
                    <p>💎 2 perguntas: R$ 5,00</p>
                    <p>💎 3 perguntas: R$ 7,00</p>
                    <p>💎 5 perguntas: R$ 10,00</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
          <p className="text-purple-200">
            🔮 Cada leitura de Tarot é uma jornada de autoconhecimento. As respostas vêm do plano espiritual,
            trazendo orientação profunda e intuitiva para suas questões mais importantes. Você pode explorar
            livremente. O pagamento é opcional e serve para confirmar sua consulta.
          </p>
        </div>
      </main>
    </div>
  );
}

