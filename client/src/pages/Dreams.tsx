import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Moon, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Dreams() {
  const { isAuthenticated } = useAuth();
  const [dreamDescription, setDreamDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [symbols, setSymbols] = useState<string[]>([]);

  const interpretDream = trpc.dreams.createInterpretation.useMutation();
  const listDreams = trpc.dreams.listInterpretations.useQuery();

  const handleSubmit = async () => {
    if (!dreamDescription.trim()) {
      alert("Por favor, descreva seu sonho");
      return;
    }

    // Se não está autenticado, ainda permite usar o serviço
    try {
      const result = await interpretDream.mutateAsync({
        dreamDescription,
      });
      setInterpretation(result.interpretation);
      setSymbols(result.symbols);
      setSubmitted(true);
      setDreamDescription("");
      if (isAuthenticated) {
        listDreams.refetch();
      }
    } catch (error) {
      console.error("Erro ao interpretar sonho:", error);
      alert("Erro ao interpretar sonho. Tente novamente.");
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
            <Moon className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold">Interpretação de Sonhos</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Dream Input */}
            <Card className="bg-blue-900/20 border-blue-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Descreva seu Sonho</h2>
              <Textarea
                value={dreamDescription}
                onChange={(e) => setDreamDescription(e.target.value)}
                placeholder="Conte-nos sobre seu sonho em detalhes. Quanto mais informações, melhor a interpretação..."
                className="bg-blue-950/50 border-blue-500/30 text-white placeholder-blue-400/50 focus:border-blue-400"
                rows={6}
              />
              <p className="text-sm text-blue-300 mt-3">
                Inclua cores, pessoas, sentimentos e qualquer detalhe que se lembre.
              </p>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={interpretDream.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6"
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

            {/* Interpretation Result */}
            {submitted && interpretation && (
              <Card className="bg-blue-900/30 border-blue-400/50 p-8">
                <h3 className="text-xl font-bold mb-4 text-blue-300">Interpretação do Seu Sonho</h3>
                <p className="text-blue-100 leading-relaxed mb-6">{interpretation}</p>
                
                {symbols.length > 0 && (
                  <div>
                    <h4 className="font-bold text-blue-300 mb-3">Símbolos Identificados:</h4>
                    <div className="flex flex-wrap gap-2">
                      {symbols.map((symbol, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-600/30 border border-blue-400/50 rounded-full text-sm text-blue-200"
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* History Sidebar */}
          <div>
            <Card className="bg-blue-900/20 border-blue-500/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Sobre Sonhos</h3>
              <div className="space-y-4 text-sm text-blue-200">
                <div>
                  <p className="font-bold text-blue-300 mb-1">🌙 Significado</p>
                  <p>Os sonhos revelam mensagens do seu inconsciente e do plano espiritual.</p>
                </div>
                <div>
                  <p className="font-bold text-blue-300 mb-1">✨ Símbolos</p>
                  <p>Cada símbolo tem significado único baseado em sua vida e experiências.</p>
                </div>
                <div>
                  <p className="font-bold text-blue-300 mb-1">💫 Orientação</p>
                  <p>Use as interpretações para autoconhecimento e crescimento pessoal.</p>
                </div>
                <div className="pt-4 border-t border-blue-500/30">
                  <p className="font-bold text-blue-300 mb-2">✅ Serviço Gratuito</p>
                  <p>Interprete quantos sonhos desejar sem custo.</p>
                </div>
              </div>
            </Card>

            {isAuthenticated && listDreams.data && listDreams.data.length > 0 && (
              <Card className="bg-blue-900/20 border-blue-500/30 p-6 sticky top-96 mt-6">
                <h3 className="text-lg font-bold mb-4">Seu Histórico</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {listDreams.data.map((dream: any) => (
                    <div
                      key={dream.id}
                      className="p-3 bg-blue-950/50 rounded-lg border border-blue-500/20 hover:border-blue-400/50 transition-all cursor-pointer"
                      title={dream.dreamDescription}
                    >
                      <p className="text-sm text-blue-200 line-clamp-2">
                        {dream.dreamDescription}
                      </p>
                      <p className="text-xs text-blue-400 mt-2">
                        {dream.createdAt ? new Date(dream.createdAt).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <p className="text-blue-200">
            🌙 A interpretação de sonhos é um serviço gratuito e acessível a todos. Explore os mistérios
            do seu inconsciente sem limitações. Cada sonho é único e pessoal - use essas interpretações
            como guia para seu autoconhecimento e desenvolvimento espiritual.
          </p>
        </div>
      </main>
    </div>
  );
}

