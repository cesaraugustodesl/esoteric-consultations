import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Moon, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Dreams() {
  const { user } = useAuth();
  const [dreamDescription, setDreamDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dreamId, setDreamId] = useState<string | null>(null);

  const interpretDream = trpc.dreams.interpretDream.useMutation();
  const listDreams = trpc.dreams.listDreams.useQuery();

  const handleSubmit = async () => {
    if (!dreamDescription.trim()) {
      alert("Por favor, descreva seu sonho");
      return;
    }

    try {
      const result = await interpretDream.mutateAsync({
        dreamDescription,
      });
      setDreamId(result.dreamId);
      setSubmitted(true);
      setDreamDescription("");
      listDreams.refetch();
    } catch (error) {
      console.error("Erro ao interpretar sonho:", error);
      alert("Erro ao interpretar sonho. Tente novamente.");
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
            <Moon className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold">Interpretação de Sonhos</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-indigo-900/20 border-indigo-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Descreva seu Sonho</h2>
              <div className="space-y-4">
                <Textarea
                  value={dreamDescription}
                  onChange={(e) => setDreamDescription(e.target.value)}
                  placeholder="Conte cada detalhe do seu sonho... cores, pessoas, emoções, símbolos..."
                  className="bg-indigo-950/50 border-indigo-500/30 text-white placeholder-indigo-400/50 focus:border-indigo-400"
                  rows={6}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={interpretDream.isPending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-lg"
                >
                  {interpretDream.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Interpretando...
                    </>
                  ) : (
                    "Interpretar Sonho"
                  )}
                </Button>
              </div>
            </Card>

            {/* Latest Interpretation */}
            {submitted && interpretDream.data && (
              <Card className="bg-indigo-900/20 border-indigo-500/30 p-8">
                <h3 className="text-xl font-bold mb-4 text-indigo-300">Interpretação Espiritual</h3>
                <div className="bg-indigo-950/50 rounded-lg p-6 border border-indigo-500/20">
                  <p className="text-indigo-100 leading-relaxed whitespace-pre-wrap mb-6">
                    {interpretDream.data.interpretation}
                  </p>
                  {interpretDream.data.symbols.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-indigo-300 mb-3">Símbolos Identificados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {interpretDream.data.symbols.map((symbol: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-600/30 border border-indigo-400/50 rounded-full text-sm text-indigo-200"
                          >
                            ✨ {symbol}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* History Sidebar */}
          <div>
            <Card className="bg-indigo-900/20 border-indigo-500/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Histórico de Sonhos</h3>
              {listDreams.data && listDreams.data.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {listDreams.data.map((dream) => (
                    <div
                      key={dream.id}
                      className="p-3 bg-indigo-950/50 rounded-lg border border-indigo-500/20 hover:border-indigo-400/50 transition-all cursor-pointer"
                      title={dream.dreamDescription}
                    >
                      <p className="text-sm text-indigo-200 line-clamp-2">
                        {dream.dreamDescription}
                      </p>
                      <p className="text-xs text-indigo-400 mt-2">
                        {dream.createdAt ? new Date(dream.createdAt).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-indigo-400">
                  Nenhum sonho interpretado ainda. Comece a explorar o mundo dos sonhos!
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <p className="text-blue-200">
            🌙 A interpretação de sonhos é um caminho poderoso para o autoconhecimento. 
            Cada sonho carrega mensagens do seu inconsciente e do plano espiritual. 
            Este serviço é totalmente gratuito para ajudá-lo em sua jornada.
          </p>
        </div>
      </main>
    </div>
  );
}

