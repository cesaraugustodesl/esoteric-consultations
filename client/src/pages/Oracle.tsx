import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowLeft, Loader2, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Oracle() {
  const { user } = useAuth();
  const [oracleType, setOracleType] = useState<"runas" | "anjos" | "buzios" | null>(null);
  const [question, setQuestion] = useState("");
  const [numberOfSymbols, setNumberOfSymbols] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    if (!oracleType) {
      alert("Por favor, escolha um tipo de oráculo");
      return;
    }

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
      setOracleType(null);
      // listConsults.refetch();
    } catch (error) {
      console.error("Erro ao consultar oráculo:", error);
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
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold">Oráculos Místicos</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Oracle Type Selection with Descriptions */}
            <Card className="bg-cyan-900/20 border-cyan-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Escolha seu Oráculo</h2>
              <p className="text-cyan-200 text-sm mb-6">Clique em cada oráculo para conhecer como funciona</p>
              <div className="space-y-3">
                {(["runas", "anjos", "buzios"] as const).map((type) => {
                  const info = oracleDescriptions[type];
                  const isExpanded = expandedInfo === type;
                  const isSelected = oracleType === type;

                  return (
                    <div key={type}>
                      <button
                        onClick={() => {
                          setExpandedInfo(isExpanded ? null : type);
                          if (!isExpanded) {
                            setOracleType(type);
                          }
                        }}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-600/30"
                            : "border-cyan-500/30 bg-cyan-900/20 hover:border-cyan-400/60"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-lg">{info.title}</p>
                          {isSelected && <p className="text-xs text-cyan-300 mt-1">✓ Selecionado</p>}
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* Expandable Description */}
                      {isExpanded && (
                        <div className="mt-3 p-4 bg-cyan-950/40 border border-cyan-500/20 rounded-lg">
                          <p className="text-cyan-100 mb-4">{info.description}</p>
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-cyan-300">Benefícios desta consulta:</p>
                            <ul className="space-y-1">
                              {info.benefits.map((benefit, idx) => (
                                <li key={idx} className="text-sm text-cyan-200 flex items-start gap-2">
                                  <span className="text-cyan-400 mt-0.5">✨</span>
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Question Input */}
            {oracleType && (
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
            )}

            {/* Number of Symbols */}
            {oracleType && (
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
            )}

            {/* Submit Button */}
            {oracleType && (
              <Button
                onClick={handleSubmit}
                disabled={createConsult.isPending || !question.trim()}
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
            )}
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
            Escolha seu tipo de oráculo, conheça como funciona e formule sua pergunta com intenção clara para receber
            a orientação que você precisa neste momento.
          </p>
        </div>
      </main>
    </div>
  );
}

