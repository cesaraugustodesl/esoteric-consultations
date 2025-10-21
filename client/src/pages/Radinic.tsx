import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Zap, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Radinic() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const consult = trpc.radinic.consult.useMutation();
  const listConsults = trpc.radinic.listConsults.useQuery();

  const handleSubmit = async () => {
    if (!question.trim()) {
      alert("Por favor, formule uma pergunta");
      return;
    }

    try {
      await consult.mutateAsync({ question });
      setSubmitted(true);
      setQuestion("");
      listConsults.refetch();
    } catch (error) {
      console.error("Erro ao consultar mesa radiônica:", error);
      alert("Erro ao consultar. Tente novamente.");
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
            <Zap className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold">Mesas Radiônicas</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-yellow-900/20 border-yellow-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Consulte a Mesa Radiônica</h2>
              <div className="space-y-4">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Formule sua pergunta sobre energia, saúde ou situações..."
                  className="bg-yellow-950/50 border-yellow-500/30 text-white placeholder-yellow-400/50 focus:border-yellow-400"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={consult.isPending}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-lg"
                >
                  {consult.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    "Consultar Mesa"
                  )}
                </Button>
              </div>
            </Card>

            {/* Latest Response */}
            {submitted && consult.data && (
              <Card className="bg-yellow-900/20 border-yellow-500/30 p-8">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">Resposta Radiônica</h3>
                <div className="bg-yellow-950/50 rounded-lg p-6 border border-yellow-500/20 mb-4">
                  <p className="text-yellow-100 leading-relaxed whitespace-pre-wrap">
                    {consult.data.response}
                  </p>
                </div>
                <div className="bg-yellow-950/30 rounded-lg p-4 border border-yellow-500/20">
                  <p className="text-sm text-yellow-300">
                    <strong>Frequência Energética:</strong> {consult.data.energyFrequency}
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* History Sidebar */}
          <div>
            <Card className="bg-yellow-900/20 border-yellow-500/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Histórico de Consultas</h3>
              {listConsults.data && listConsults.data.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {listConsults.data.map((consult) => (
                    <div
                      key={consult.id}
                      className="p-3 bg-yellow-950/50 rounded-lg border border-yellow-500/20 hover:border-yellow-400/50 transition-all cursor-pointer"
                      title={consult.question}
                    >
                      <p className="text-sm text-yellow-200 line-clamp-2">
                        {consult.question}
                      </p>
                      <p className="text-xs text-yellow-400 mt-2">
                        {consult.createdAt ? new Date(consult.createdAt).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-yellow-400">
                  Nenhuma consulta realizada ainda.
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-orange-900/20 border border-orange-500/30 rounded-lg p-6">
          <p className="text-orange-200">
            ⚡ As mesas radiônicas são ferramentas ancestrais de diagnóstico energético. 
            Elas funcionam através de frequências vibracionais para revelar informações sobre saúde, 
            energia e situações. Este serviço é totalmente gratuito.
          </p>
        </div>
      </main>
    </div>
  );
}

