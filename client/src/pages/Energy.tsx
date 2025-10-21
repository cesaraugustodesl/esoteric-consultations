import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Energy() {
  const { isAuthenticated } = useAuth();
  const [topic, setTopic] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [chakraFocus, setChakraFocus] = useState<string | null>(null);

  const getGuidance = trpc.energy.getGuidance.useMutation();
  const listGuidance = trpc.energy.listGuidance.useQuery();

  const handleSubmit = async () => {
    if (!topic.trim()) {
      alert("Por favor, descreva o tópico para orientação");
      return;
    }

    try {
      const result = await getGuidance.mutateAsync({ topic });
      setGuidance(result.guidance);
      setChakraFocus(result.chakraFocus);
      setSubmitted(true);
      setTopic("");
      if (isAuthenticated) {
        listGuidance.refetch();
      }
    } catch (error) {
      console.error("Erro ao obter orientação:", error);
      alert("Erro ao obter orientação. Tente novamente.");
    }
  };

  const suggestedTopics = [
    "Amor e Relacionamentos",
    "Carreira e Propósito",
    "Saúde e Bem-estar",
    "Abundância Financeira",
    "Autoestima e Confiança",
    "Transformação Pessoal",
  ];



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
            <Heart className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl font-bold">Orientações Energéticas</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-rose-900/20 border-rose-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Receba Orientação Energética</h2>
              <div className="space-y-4">
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Qual é o tópico de sua orientação?"
                  className="bg-rose-950/50 border-rose-500/30 text-white placeholder-rose-400/50 focus:border-rose-400"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={getGuidance.isPending}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-lg"
                >
                  {getGuidance.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Canalizando...
                    </>
                  ) : (
                    "Obter Orientação"
                  )}
                </Button>
              </div>

              {/* Suggested Topics */}
              <div className="mt-6 pt-6 border-t border-rose-500/20">
                <p className="text-sm text-rose-300 mb-3">Tópicos sugeridos:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTopics.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className="px-3 py-1 text-sm bg-rose-900/30 border border-rose-500/30 rounded-full text-rose-200 hover:bg-rose-900/50 hover:border-rose-400/50 transition-all"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Guidance Result */}
            {submitted && guidance && (
              <Card className="bg-rose-900/20 border-rose-500/30 p-8">
                <h3 className="text-xl font-bold mb-2 text-rose-300">Orientação Energética</h3>
                {chakraFocus && (
                  <p className="text-sm text-rose-400 mb-4">
                    💫 Foco: <span className="font-semibold">{chakraFocus}</span>
                  </p>
                )}
                <p className="text-rose-100 leading-relaxed">{guidance}</p>
              </Card>
            )}
          </div>

          {/* History Sidebar */}
          <div>
            <Card className="bg-rose-900/20 border-rose-500/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Histórico de Orientações</h3>
              {listGuidance.data && listGuidance.data.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {listGuidance.data.map((guidance) => (
                    <div
                      key={guidance.id}
                      className="p-3 bg-rose-950/50 rounded-lg border border-rose-500/20 hover:border-rose-400/50 transition-all cursor-pointer"
                      title={guidance.topic}
                    >
                      <p className="text-sm text-rose-200 line-clamp-2">
                        {guidance.topic}
                      </p>
                      <p className="text-xs text-rose-400 mt-2">
                        {guidance.createdAt ? new Date(guidance.createdAt).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-rose-400">
                  Nenhuma orientação recebida ainda.
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-pink-900/20 border border-pink-500/30 rounded-lg p-6">
          <p className="text-pink-200">
            💫 As orientações energéticas canalizam a sabedoria do universo para guiar você 
            em sua jornada. Cada orientação é personalizada de acordo com sua energia e necessidades. 
            Este serviço é totalmente gratuito.
          </p>
        </div>
      </main>
    </div>
  );
}

