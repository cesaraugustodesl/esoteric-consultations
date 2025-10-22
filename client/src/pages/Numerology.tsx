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

    // Converter DD/MM/YYYY para YYYY-MM-DD
    let formattedDate = birthDate;
    if (birthDate.includes('/')) {
      const parts = birthDate.split('/');
      if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        alert('Por favor, insira a data no formato DD/MM/YYYY');
        return;
      }
    }

    try {
      const response = await createReading.mutateAsync({
        fullName,
        birthDate: formattedDate,
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
    setFullName("");
    setBirthDate("");
    setSubmitted(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              Numerologia
            </h1>
          </div>
        </div>

        {submitted && result ? (
          <div className="space-y-6">
            {/* Title */}
            <Card className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-400/50 p-6">
              <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Leitura Numerológica Completa
              </h2>
              <p className="text-yellow-200 text-sm mt-2">{result.summary}</p>
            </Card>

            {/* Numbers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Destiny Number */}
              <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-400/30 p-6">
                <div className="mb-4">
                  <div className="text-5xl font-bold text-yellow-400 mb-2">{result.destinyNumber}</div>
                  <h3 className="text-xl font-bold text-yellow-300">Número de Destino</h3>
                  <p className="text-xs text-yellow-200 mt-1">Revela a missão de vida</p>
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
                  <p className="text-lg font-bold text-indigo-100 mt-2">{result.fullName || "N/A"}</p>
                </div>
                <div className="bg-indigo-950/60 p-4 rounded-lg border border-indigo-500/20">
                  <p className="text-indigo-400 font-semibold text-sm">Data de Nascimento</p>
                  <p className="text-lg font-bold text-indigo-100 mt-2">
                    {result.birthDate ? new Date(result.birthDate + "T00:00:00").toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                </div>
              </div>
              <div className="bg-indigo-950/60 p-4 rounded-lg border border-indigo-500/20">
                <p className="text-indigo-400 font-semibold text-sm mb-2">Valor da Consulta</p>
                <p className="text-2xl font-bold text-indigo-300">R$ {typeof result.price === 'number' ? result.price.toFixed(2) : '25.00'}</p>
              </div>
            </Card>

            {/* Action Button */}
            <Button
              onClick={handleNewReading}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-lg py-6"
            >
              Gerar Nova Leitura
            </Button>

            {/* History */}
            <Card className="bg-purple-900/30 border-purple-400/30 p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-4">Histórico</h3>
              {listReadings.data && listReadings.data.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {listReadings.data.map((reading: any) => (
                    <div key={reading.id} className="bg-purple-950/40 p-3 rounded border border-purple-500/20">
                      <p className="text-purple-200 font-semibold">{reading.fullName}</p>
                      <p className="text-xs text-purple-400 mt-2">
                        {reading.createdAt ? new Date(reading.createdAt).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-purple-400">Nenhuma leitura realizada ainda.</p>
              )}
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* What Numerology Shows */}
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h2 className="text-2xl font-bold text-yellow-300 mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  O que a Numerologia Mostra
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="text-2xl">📍</div>
                    <div>
                      <h3 className="font-bold text-yellow-300">Número de Destino</h3>
                      <p className="text-sm text-purple-200">Revela a missão de vida, o propósito e os desafios que você veio enfrentar.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-2xl">💖</div>
                    <div>
                      <h3 className="font-bold text-pink-300">Número da Alma</h3>
                      <p className="text-sm text-purple-200">Indica seus desejos mais profundos e emoções ocultas.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-2xl">🎭</div>
                    <div>
                      <h3 className="font-bold text-purple-300">Número da Personalidade</h3>
                      <p className="text-sm text-purple-200">Mostra como você é percebido pelos outros.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-2xl">🗣️</div>
                    <div>
                      <h3 className="font-bold text-cyan-300">Número de Expressão</h3>
                      <p className="text-sm text-purple-200">Mostra como você se expressa e se manifesta no mundo.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-2xl">📅</div>
                    <div>
                      <h3 className="font-bold text-green-300">Ano Pessoal</h3>
                      <p className="text-sm text-purple-200">Mostra tendências e oportunidades para o ano em curso.</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Form Section */}
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-6">Seus Dados</h3>
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
                      Data de Nascimento (DD/MM/YYYY)
                    </label>
                    <Input
                      type="text"
                      placeholder="DD/MM/YYYY (ex: 15/05/1990)"
                      value={birthDate}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Remover caracteres não numéricos
                        value = value.replace(/\D/g, '');
                        // Adicionar barras automaticamente
                        if (value.length <= 2) {
                          setBirthDate(value);
                        } else if (value.length <= 4) {
                          setBirthDate(value.slice(0, 2) + '/' + value.slice(2));
                        } else if (value.length <= 8) {
                          setBirthDate(value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8));
                        } else {
                          setBirthDate(value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8));
                        }
                      }}
                      maxLength="10"
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
              <Card className="bg-purple-900/30 border-purple-400/30 p-6 sticky top-8">
                <h3 className="text-lg font-bold text-purple-300 mb-4">Histórico</h3>
                {listReadings.data && listReadings.data.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {listReadings.data.map((reading: any) => (
                      <div key={reading.id} className="bg-purple-950/40 p-3 rounded border border-purple-500/20">
                        <p className="text-purple-200 font-semibold text-sm">{reading.fullName}</p>
                        <p className="text-xs text-purple-400 mt-2">
                          {reading.createdAt ? new Date(reading.createdAt).toLocaleDateString("pt-BR") : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-purple-400">Nenhuma leitura realizada ainda.</p>
                )}
              </Card>
            </div>
          </div>
        )}

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

