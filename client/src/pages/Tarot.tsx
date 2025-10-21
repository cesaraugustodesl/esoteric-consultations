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

  const createConsultation = trpc.tarot.createConsultation.useMutation();
  const generateResponses = trpc.tarot.generateResponses.useMutation();

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

    // Teste: remover requisito de autenticação

    try {
      const result = await createConsultation.mutateAsync({
        context,
        questions: filledQuestions,
        numberOfQuestions,
      });

      setConsultationId(result.consultationId);

      // Gera as respostas
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
            <Wand2 className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold">Leitura de Tarot</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
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

            {/* Response */}
            {submitted && response && (
              <Card className="bg-purple-900/30 border-purple-400/50 p-8">
                <h3 className="text-xl font-bold mb-4 text-purple-300">Mensagem do Plano Espiritual</h3>
                <p className="text-purple-100 leading-relaxed">{response}</p>

              </Card>
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
            livremente. O cadastro e pagamento são necessários apenas quando deseja confirmar uma consulta.
          </p>
        </div>
      </main>
    </div>
  );
}

