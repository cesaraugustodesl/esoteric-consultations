import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Oracle() {
  const { user } = useAuth();
  const [oracleType, setOracleType] = useState<"runas" | "anjos" | "buzios">("runas");
  const [question, setQuestion] = useState("");
  const [numberOfSymbols, setNumberOfSymbols] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const createConsult = trpc.oracle.createConsult.useMutation();
  const listConsults = trpc.oracle.listConsults.useQuery();

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

  const handleSubmit = async () => {
    if (!question.trim()) {
      alert("Por favor, formule uma pergunta");
      return;
    }

    try {
      await createConsult.mutateAsync({
        oracleType,
        question,
        numberOfSymbols,
      });
      setSubmitted(true);
      setQuestion("");
      listConsults.refetch();
    } catch (error) {
      console.error("Erro ao consultar oráculo:", error);
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
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold">Oráculos Místicos</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Oracle Type Selection */}
            <Card className="bg-cyan-900/20 border-cyan-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Escolha seu Oráculo</h2>
              <div className="space-y-3">
                {(["runas", "anjos", "buzios"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOracleType(type)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      oracleType === type
                        ? "border-cyan-400 bg-cyan-600/30"
                        : "border-cyan-500/30 bg-cyan-900/20 hover:border-cyan-400/60"
                    }`}
                  >
                    <p className="font-bold text-lg">{oracleNames[type]}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Question Input */}
            <Card className="bg-cyan-900/20 border-cyan-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Sua Pergunta</h2>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Formule sua pergunta com clareza e intenção..."
                className="bg-cyan-950/50 border-cyan-500/30 text-white placeholder-cyan-400/50 focus:border-cyan-400"
                rows={4}
              />
            </Card>

            {/* Number of Symbols */}
            <Card className="bg-cyan-900/20 border-cyan-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Quantos Símbolos?</h2>
              <div className="grid grid-cols-3 gap-4">
                {[1, 3, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNumberOfSymbols(num)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      numberOfSymbols === num
                        ? "border-cyan-400 bg-cyan-600/30"
                        : "border-cyan-500/30 bg-cyan-900/20 hover:border-cyan-400/60"
                    }`}
                  >
                    <div className="text-2xl font-bold mb-2">{num}</div>
                    <div className="text-sm text-cyan-300">R$ {prices[num]}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={createConsult.isPending}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-lg py-6"
            >
              {createConsult.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Consultando...
                </>
              ) : (
                "Consultar Oráculo"
              )}
            </Button>
          </div>

          {/* History Sidebar */}
          <div>
            <Card className="bg-cyan-900/20 border-cyan-500/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Histórico</h3>
              {listConsults.data && listConsults.data.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {listConsults.data.map((consult: any) => (
                    <div
                      key={consult.id}
                      className="p-3 bg-cyan-950/50 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer"
                    >
                      <p className="text-sm text-cyan-200 font-bold">{oracleNames[consult.oracleType]}</p>
                      <p className="text-xs text-cyan-400 mt-2">
                        {consult.createdAt ? new Date(consult.createdAt).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-cyan-400">Nenhuma consulta realizada ainda.</p>
              )}
            </Card>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-6">
          <p className="text-cyan-200">
            🔮 Os oráculos ancestrais revelam mensagens do universo através de símbolos sagrados.
            Escolha seu tipo de oráculo e formule sua pergunta com intenção clara para receber
            a orientação que você precisa neste momento.
          </p>
        </div>
      </main>
    </div>
  );
}

