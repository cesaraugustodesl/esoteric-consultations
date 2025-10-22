import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Numerology() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createReading = trpc.numerology.createReading.useMutation();
  const listReadings = trpc.numerology.listReadings.useQuery();

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      alert("Por favor, insira seu nome completo");
      return;
    }

    if (!birthDate) {
      alert("Por favor, insira sua data de nascimento");
      return;
    }

    try {
      const response = await createReading.mutateAsync({
        fullName,
        birthDate,
      });
      setResult(response);
      setSubmitted(true);
      listReadings.refetch();
    } catch (error) {
      console.error("Erro ao gerar leitura numerológica:", error);
      alert("Erro ao gerar leitura. Tente novamente.");
    }
  };

  const handleNewReading = () => {
    setSubmitted(false);
    setResult(null);
    setFullName("");
    setBirthDate("");
  };

  if (submitted && result) {
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
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h1 className="text-2xl font-bold">Numerologia</h1>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="space-y-8">
            {/* Header Card */}
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-400/50 p-8">
              <h2 className="text-3xl font-bold mb-2">✨ Leitura Numerológica Completa</h2>
              <p className="text-yellow-200">
                <span className="font-semibold">{result.destinyNumber}</span> - Seu número de destino
              </p>
            </Card>

            {/* Numbers Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Destiny Number */}
              <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-400/30 p-6">
                <div className="mb-4">
                  <div className="text-5xl font-bold text-yellow-400 mb-2">{result.destinyNumber}</div>
                  <h3 className="text-xl font-bold text-yellow-300">Número de Destino</h3>
                  <p className="text-xs text-yellow-200 mt-1">Revela a missão de vida e propósito</p>
                </div>
                <p className="text-yellow-100 text-sm leading-relaxed">
                  {result.destinyInterpretation}
                </p>
              </Card>

              {/* Soul Number */}
              <Card className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-400/30 p-6">
                <div className="mb-4">
                  <div className="text-5xl font-bold text-pink-400 mb-2">{result.soulNumber}</div>
                  <h3 className="text-xl font-bold text-pink-300">Número da Alma</h3>
                  <p className="text-xs text-pink-200 mt-1">Desejos profundos e emoções ocultas</p>
                </div>
                <p className="text-pink-100 text-sm leading-relaxed">
                  {result.soulInterpretation}
                </p>
              </Card>

              {/* Personality Number */}
              <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-400/30 p-6">
                <div className="mb-4">
                  <div className="text-5xl font-bold text-purple-400 mb-2">{result.personalityNumber}</div>
                  <h3 className="text-xl font-bold text-purple-300">Número da Personalidade</h3>
                  <p className="text-xs text-purple-200 mt-1">Como você é percebido pelos outros</p>
                </div>
                <p className="text-purple-100 text-sm leading-relaxed">
                  {result.personalityInterpretation}
                </p>
              </Card>

              {/* Expression Number */}
              <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-400/30 p-6">
                <div className="mb-4">
                  <div className="text-5xl font-bold text-cyan-400 mb-2">{result.expressionNumber}</div>
                  <h3 className="text-xl font-bold text-cyan-300">Número de Expressão</h3>
                  <p className="text-xs text-cyan-200 mt-1">Como você se expressa no mundo</p>
                </div>
                <p className="text-cyan-100 text-sm leading-relaxed">
                  {result.expressionInterpretation}
                </p>
              </Card>

              {/* Personal Year */}
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-400/30 p-6 md:col-span-2">
                <div className="mb-4">
                  <div className="text-5xl font-bold text-green-400 mb-2">{result.personalYear}</div>
                  <h3 className="text-xl font-bold text-green-300">Ano Pessoal</h3>
                  <p className="text-xs text-green-200 mt-1">Tendências e oportunidades para este ano</p>
                </div>
                <p className="text-green-100 text-sm leading-relaxed">
                  {result.yearInterpretation}
                </p>
              </Card>
            </div>

            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-400/50 p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-indigo-950/60 p-4 rounded-lg border border-indigo-500/20">
                  <p className="text-indigo-400 font-semibold text-sm">Nome Consultado</p>
                  <p className="text-lg font-bold text-indigo-100 mt-2">{result.fullName}</p>
                </div>
                <div className="bg-indigo-950/60 p-4 rounded-lg border border-indigo-500/20">
                  <p className="text-indigo-400 font-semibold text-sm">Data de Nascimento</p>
                  <p className="text-lg font-bold text-indigo-100 mt-2">
                    {new Date(result.birthDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="bg-indigo-950/60 p-4 rounded-lg border border-indigo-500/20">
                <p className="text-indigo-400 font-semibold text-sm mb-2">Valor da Consulta</p>
                <p className="text-2xl font-bold text-indigo-300">R$ {result.price}</p>
              </div>
            </Card>

            {/* Action Button */}
            <Button
              onClick={handleNewReading}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-lg py-6"
            >
              Gerar Nova Leitura
            </Button>

            {/* Info */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
              <p className="text-yellow-200">
                🔢 A numerologia revela os padrões ocultos do universo através dos números. Cada número carrega uma vibração única que influencia sua vida. Medite sobre estes números e deixe que a sabedoria numerológica guie suas decisões.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold">Numerologia</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Info Card */}
            <Card className="bg-yellow-900/20 border-yellow-500/30 p-8">
              <h2 className="text-2xl font-bold mb-4">🌟 O que a Numerologia Mostra</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-bold text-yellow-300">📍 Número de Destino</p>
                  <p className="text-yellow-100 mt-1">Revela a missão de vida, o propósito e os desafios que você veio enfrentar.</p>
                </div>
                <div>
                  <p className="font-bold text-pink-300">💖 Número da Alma</p>
                  <p className="text-pink-100 mt-1">Indica seus desejos mais profundos e emoções ocultas.</p>
                </div>
                <div>
                  <p className="font-bold text-purple-300">🎭 Número da Personalidade</p>
                  <p className="text-purple-100 mt-1">Mostra como você é percebido pelos outros.</p>
                </div>
                <div>
                  <p className="font-bold text-cyan-300">🗣️ Número de Expressão</p>
                  <p className="text-cyan-100 mt-1">Mostra como você se expressa e se manifesta no mundo.</p>
                </div>
                <div>
                  <p className="font-bold text-green-300">📅 Ano Pessoal</p>
                  <p className="text-green-100 mt-1">Mostra tendências e oportunidades para o ano em curso.</p>
                </div>
              </div>
            </Card>

            {/* Form Card */}
            <Card className="bg-yellow-900/20 border-yellow-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Seus Dados</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    Nome Completo (como registrado em documentos)
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: João da Silva Santos"
                    className="bg-yellow-950/50 border-yellow-500/30 text-white placeholder-yellow-400/50 focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    Data de Nascimento (YYYY-MM-DD)
                  </label>
                  <Input
                    type="text"
                    placeholder="1990-05-15"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-yellow-950/50 border-yellow-500/30 text-white placeholder-yellow-400/50 focus:border-yellow-400"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createReading.isPending || !fullName.trim() || !birthDate}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-lg py-6 mt-4"
                >
                  {createReading.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando Leitura...
                    </>
                  ) : (
                    "Gerar Leitura Numerológica"
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* History Sidebar */}
          <div>
            <Card className="bg-yellow-900/20 border-yellow-500/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Histórico</h3>
              {listReadings.data && listReadings.data.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {listReadings.data.map((reading: any) => (
                    <div
                      key={reading.id}
                      className="p-3 bg-yellow-950/50 rounded-lg border border-yellow-500/20 hover:border-yellow-400/50 transition-all cursor-pointer"
                    >
                      <p className="text-sm text-yellow-200 font-bold">{reading.fullName}</p>
                      <p className="text-xs text-yellow-400 mt-2">
                        {reading.createdAt ? new Date(reading.createdAt).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-yellow-400">Nenhuma leitura realizada ainda.</p>
              )}
            </Card>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <p className="text-yellow-200">
            🔢 A numerologia é uma ciência ancestral que revela os padrões ocultos do universo através dos números. Cada número carrega uma vibração única que influencia sua vida, personalidade e destino. Insira seu nome completo e data de nascimento para descobrir os números que definem sua jornada.
          </p>
        </div>
      </main>
    </div>
  );
}

