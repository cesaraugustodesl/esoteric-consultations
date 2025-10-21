import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Astral() {
  const { user } = useAuth();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  const [packageType, setPackageType] = useState<"basic" | "premium">("basic");
  const [submitted, setSubmitted] = useState(false);

  const createMap = trpc.astral.createMap.useMutation();
  const listMaps = trpc.astral.listMaps.useQuery();

  const prices: Record<string, string> = {
    basic: "30.00",
    premium: "50.00",
  };

  const handleSubmit = async () => {
    if (!birthDate || !birthTime || !birthLocation) {
      alert("Por favor, preencha todos os dados de nascimento");
      return;
    }

    try {
      await createMap.mutateAsync({
        birthDate,
        birthTime,
        birthLocation,
        packageType,
      });
      setSubmitted(true);
      setBirthDate("");
      setBirthTime("");
      setBirthLocation("");
      // listMaps.refetch();
    } catch (error) {
      console.error("Erro ao criar mapa astral:", error);
      alert("Erro ao criar mapa. Tente novamente.");
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
            <Star className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold">Mapa Astral Simplificado</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-yellow-900/20 border-yellow-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Seus Dados de Nascimento</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-yellow-300 mb-2">Data de Nascimento</label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-yellow-950/50 border-yellow-500/30 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-yellow-300 mb-2">Hora de Nascimento</label>
                  <Input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="bg-yellow-950/50 border-yellow-500/30 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-yellow-300 mb-2">Local de Nascimento</label>
                  <Input
                    value={birthLocation}
                    onChange={(e) => setBirthLocation(e.target.value)}
                    placeholder="Cidade, Estado"
                    className="bg-yellow-950/50 border-yellow-500/30 text-white placeholder-yellow-400/50"
                  />
                </div>
              </div>
            </Card>

            {/* Package Selection */}
            <Card className="bg-yellow-900/20 border-yellow-500/30 p-8">
              <h2 className="text-2xl font-bold mb-6">Escolha seu Pacote</h2>
              <div className="space-y-3">
                {(["basic", "premium"] as const).map((pkg) => (
                  <button
                    key={pkg}
                    onClick={() => setPackageType(pkg)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      packageType === pkg
                        ? "border-yellow-400 bg-yellow-600/30"
                        : "border-yellow-500/30 bg-yellow-900/20 hover:border-yellow-400/60"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">
                          {pkg === "basic" ? "Mapa Astral Básico" : "Mapa Astral + Previsão"}
                        </p>
                        <p className="text-sm text-yellow-300">
                          {pkg === "basic"
                            ? "Signos, posição de planetas e tendências"
                            : "Inclui previsão mensal ou orientação extra"}
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-yellow-400">R$ {prices[pkg]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={createMap.isPending}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-lg py-6"
            >
              {createMap.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Mapa...
                </>
              ) : (
                "Gerar Mapa Astral"
              )}
            </Button>
          </div>

          {/* History Sidebar */}
          <div>
            <Card className="bg-yellow-900/20 border-yellow-500/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Seus Mapas</h3>
              {listMaps.data && listMaps.data.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {listMaps.data.map((map: any) => (
                    <div
                      key={map.id}
                      className="p-3 bg-yellow-950/50 rounded-lg border border-yellow-500/20 hover:border-yellow-400/50 transition-all cursor-pointer"
                    >
                      <p className="text-sm text-yellow-200 font-bold">{map.packageType === "basic" ? "Básico" : "Premium"}</p>
                      <p className="text-xs text-yellow-400 mt-2">
                        {map.createdAt ? new Date(map.createdAt).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-yellow-400">Nenhum mapa gerado ainda.</p>
              )}
            </Card>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <p className="text-yellow-200">
            ✨ Seu mapa astral revela os mistérios do universo no momento do seu nascimento.
            Descubra seus signos, a posição dos planetas e as tendências que moldam seu destino.
            Cada mapa é único e personalizado para você.
          </p>
        </div>
      </main>
    </div>
  );
}

