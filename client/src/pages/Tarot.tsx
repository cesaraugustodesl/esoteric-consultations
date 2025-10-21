import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Tarot() {
  const { user } = useAuth();
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [questions, setQuestions] = useState<string[]>([""]);
  const [submitted, setSubmitted] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);

  const createConsultation = trpc.tarot.createConsultation.useMutation();
  const generateResponses = trpc.tarot.generateResponses.useMutation();
  const createPaymentLink = trpc.payments.createPaymentLink.useMutation();
  const getConsultation = trpc.tarot.getConsultation.useQuery(
    { id: consultationId || "" },
    { enabled: !!consultationId && submitted }
  );

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

  const handleNumberChange = (num: number) => {
    setNumberOfQuestions(num);
    setQuestions(Array(num).fill(""));
  };

  const handleSubmit = async () => {
    const filledQuestions = questions.filter((q) => q.trim());
    if (filledQuestions.length === 0) {
      alert("Por favor, preencha pelo menos uma pergunta");
      return;
    }

    try {
      const result = await createConsultation.mutateAsync({
        questions: filledQuestions,
        numberOfQuestions: filledQuestions.length,
      });

      setConsultationId(result.consultationId);
      setSubmitted(true);

      // Generate responses
      await generateResponses.mutateAsync({
        consultationId: result.consultationId,
      });
    } catch (error) {
      console.error("Erro ao criar consulta:", error);
      alert("Erro ao criar consulta. Tente novamente.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black flex items-center justify-center">
        <p className="text-white">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-purple-700/30 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-purple-300 hover:bg-purple-900/30">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold">Leitura de Tarot</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {!submitted ? (
          <div className="space-y-8">
            {/* Question Selection */}
            <Card className="bg-purple-900/20 border-purple-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Quantas perguntas deseja fazer?</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberChange(num)}
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

            {/* Questions Input */}
            <Card className="bg-purple-900/20 border-purple-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Suas Perguntas</h2>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index}>
                    <label className="block text-sm text-purple-300 mb-2">
                      Pergunta {index + 1}
                    </label>
                    <Textarea
                      value={question}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      placeholder="Formule sua pergunta com clareza e intenção..."
                      className="bg-purple-950/50 border-purple-500/30 text-white placeholder-purple-400/50 focus:border-purple-400"
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Price Summary */}
            <Card className="bg-pink-900/20 border-pink-500/30 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-purple-300">Total a pagar:</p>
                  <p className="text-3xl font-bold text-pink-400">R$ {prices[numberOfQuestions]}</p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={createConsultation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8"
                >
                  {createConsultation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Prosseguir para Pagamento"
                  )}
                </Button>
              </div>
            </Card>

            {/* Info */}
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-6">
              <p className="text-indigo-200">
                ✨ Suas perguntas serão respondidas com sabedoria ancestral e profundidade espiritual. 
                Cada resposta é uma mensagem do plano espiritual para sua jornada.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Loading State */}
            {generateResponses.isPending && (
              <Card className="bg-purple-900/20 border-purple-500/30 p-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
                <p className="text-xl text-purple-200">
                  Conectando com o plano espiritual...
                </p>
                <p className="text-sm text-purple-400 mt-2">
                  Suas respostas estão sendo canalizadas
                </p>
              </Card>
            )}

            {/* Consultation Results */}
            {getConsultation.data && !generateResponses.isPending && (
              <div className="space-y-8">
                <Card className="bg-purple-900/20 border-purple-500/30 p-8">
                  <h2 className="text-2xl font-bold mb-6">Suas Respostas Espirituais</h2>
                  <div className="space-y-8">
                    {getConsultation.data?.questions.map((question: string, index: number) => (
                      <div key={index} className="border-b border-purple-500/20 pb-6 last:border-0">
                        <h3 className="text-lg font-semibold text-purple-300 mb-3">
                          ❓ {question}
                        </h3>
                        <div className="bg-purple-950/50 rounded-lg p-6 border border-purple-500/20">
                          <p className="text-purple-100 leading-relaxed whitespace-pre-wrap">
                            {getConsultation.data?.responses[index]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Payment Info */}
                <Card className="bg-pink-900/20 border-pink-500/30 p-6">
                  <p className="text-pink-200 mb-4">
                    ✨ Suas respostas foram canalizadas do plano espiritual. 
                    Complete o pagamento para confirmar sua consulta.
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-pink-300">Valor da consulta:</p>
                      <p className="text-2xl font-bold text-pink-400">
                        R$ {getConsultation.data?.price}
                      </p>
                    </div>
                    <Button
                      onClick={async () => {
                        if (!getConsultation.data) return;
                        try {
                          const result = await createPaymentLink.mutateAsync({
                            consultationId: getConsultation.data.id,
                            amount: getConsultation.data.price,
                            numberOfQuestions: getConsultation.data.numberOfQuestions,
                          });
                          if (result.paymentLink) {
                            window.location.href = result.paymentLink;
                          }
                        } catch (error) {
                          console.error("Erro ao redirecionar para pagamento:", error);
                          alert("Erro ao processar pagamento. Tente novamente.");
                        }
                      }}
                      disabled={createPaymentLink.isPending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {createPaymentLink.isPending ? "Processando..." : "Pagar Agora"}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

