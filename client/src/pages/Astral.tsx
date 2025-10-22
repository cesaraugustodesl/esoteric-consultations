import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

// Lista de principais cidades brasileiras com coordenadas
const BRAZILIAN_CITIES = [
  { name: "São Paulo, SP", lat: -23.5505, lng: -46.6333 },
  { name: "Rio de Janeiro, RJ", lat: -22.9068, lng: -43.1729 },
  { name: "Belo Horizonte, MG", lat: -19.9167, lng: -43.9345 },
  { name: "Brasília, DF", lat: -15.7942, lng: -47.8822 },
  { name: "Salvador, BA", lat: -12.9714, lng: -38.5014 },
  { name: "Fortaleza, CE", lat: -3.7319, lng: -38.5267 },
  { name: "Manaus, AM", lat: -3.1190, lng: -60.0217 },
  { name: "Curitiba, PR", lat: -25.4284, lng: -49.2733 },
  { name: "Recife, PE", lat: -8.0476, lng: -34.8770 },
  { name: "Porto Alegre, RS", lat: -30.0346, lng: -51.2177 },
  { name: "Goiânia, GO", lat: -15.7939, lng: -48.0694 },
  { name: "Belém, PA", lat: -1.4558, lng: -48.4915 },
  { name: "Guarulhos, SP", lat: -23.4621, lng: -46.4827 },
  { name: "Campinas, SP", lat: -22.9056, lng: -47.0608 },
  { name: "São Bernardo do Campo, SP", lat: -23.6955, lng: -46.5733 },
  { name: "Santo André, SP", lat: -23.6628, lng: -46.5354 },
  { name: "Osasco, SP", lat: -23.5308, lng: -46.7918 },
  { name: "Sorocaba, SP", lat: -23.5006, lng: -47.4522 },
  { name: "Mogi das Cruzes, SP", lat: -23.5019, lng: -46.1881 },
  { name: "Jundiaí, SP", lat: -23.1809, lng: -46.8779 },
  { name: "Piracicaba, SP", lat: -22.7297, lng: -47.6496 },
  { name: "Ribeirão Preto, SP", lat: -21.1767, lng: -47.8098 },
  { name: "Santos, SP", lat: -23.9608, lng: -46.3334 },
  { name: "São José dos Campos, SP", lat: -23.1791, lng: -45.8877 },
  { name: "Taubaté, SP", lat: -23.0259, lng: -45.5549 },
];

export default function Astral() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  const [filteredCities, setFilteredCities] = useState<typeof BRAZILIAN_CITIES>([]);
  const [showCities, setShowCities] = useState(false);
  const [packageType, setPackageType] = useState<"basic" | "premium">("basic");
  const [submitted, setSubmitted] = useState(false);
  const [mapContent, setMapContent] = useState<string | null>(null);

  const createMap = trpc.astral.createMap.useMutation();
  const listMaps = trpc.astral.listMaps.useQuery();

  const prices: Record<string, string> = {
    basic: "30.00",
    premium: "50.00",
  };

  const handleLocationChange = (value: string) => {
    setBirthLocation(value);
    if (value.length > 0) {
      const filtered = BRAZILIAN_CITIES.filter((city) =>
        city.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowCities(true);
    } else {
      setShowCities(false);
    }
  };

  const selectCity = (city: typeof BRAZILIAN_CITIES[0]) => {
    setBirthLocation(city.name);
    setShowCities(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Por favor, digite seu nome");
      return;
    }
    if (!birthDate || !birthTime || !birthLocation) {
      alert("Por favor, preencha todos os dados de nascimento");
      return;
    }

    try {
      const result = await createMap.mutateAsync({
        birthDate,
        birthTime,
        birthLocation,
        packageType,
      });
      setMapContent(result.mapContent);
      setSubmitted(true);
      // Não limpa os dados para permitir nova consulta
    } catch (error) {
      console.error("Erro ao criar mapa astral:", error);
      alert("Erro ao criar mapa. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-950 via-orange-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-yellow-700/30 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-yellow-300 hover:bg-yellow-900/30">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold">Mapa Astral Personalizado</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
            {!submitted ? (
              <>
                {/* Name */}
                <Card className="bg-yellow-900/20 border-yellow-500/30 p-8">
                  <h2 className="text-2xl font-bold mb-6">Seus Dados Pessoais</h2>
                  <div>
                    <label className="block text-sm text-yellow-300 mb-2">Seu Nome</label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="bg-yellow-950/50 border-yellow-500/30 text-white placeholder-yellow-400/50"
                    />
                    <p className="text-xs text-yellow-400 mt-2">
                      Seu nome será usado para personalizar o mapa astral
                    </p>
                  </div>
                </Card>

                {/* Birth Data */}
                <Card className="bg-yellow-900/20 border-yellow-500/30 p-8">
                  <h2 className="text-2xl font-bold mb-6">Dados de Nascimento</h2>
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
                      <p className="text-xs text-yellow-400 mt-2">
                        Se não souber a hora exata, use 12:00 (meio-dia)
                      </p>
                    </div>
                    <div className="relative">
                      <label className="block text-sm text-yellow-300 mb-2">Local de Nascimento</label>
                      <Input
                        type="text"
                        value={birthLocation}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        onFocus={() => birthLocation.length > 0 && setShowCities(true)}
                        placeholder="Digite sua cidade..."
                        className="bg-yellow-950/50 border-yellow-500/30 text-white placeholder-yellow-400/50"
                      />
                      {showCities && filteredCities.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-yellow-950 border border-yellow-500/50 rounded-lg z-50 max-h-48 overflow-y-auto">
                          {filteredCities.map((city) => (
                            <button
                              key={city.name}
                              onClick={() => selectCity(city)}
                              className="w-full text-left px-4 py-2 hover:bg-yellow-900/50 text-yellow-200 text-sm border-b border-yellow-500/20 last:border-b-0"
                            >
                              {city.name}
                            </button>
                          ))}
                        </div>
                      )}
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
                              {pkg === "basic" ? "📖 Mapa Astral Básico" : "📚 Mapa Astral Premium"}
                            </p>
                            <p className="text-sm text-yellow-300">
                              {pkg === "basic"
                                ? "20 páginas com análise completa"
                                : "30 páginas de mapa + 10 de previsões"}
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
                      Gerando Mapa Astral...
                    </>
                  ) : (
                    `Gerar Mapa - R$ ${prices[packageType]}`
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Result */}
                <Card className="bg-yellow-900/30 border-yellow-400/50 p-8">
                  <h2 className="text-2xl font-bold mb-4 text-yellow-300">✨ Seu Mapa Astral</h2>
                  <p className="text-yellow-200 mb-4">
                    <strong>{name}</strong>, seu mapa astral foi gerado com sucesso!
                  </p>
                  {mapContent && (
                    <div className="bg-yellow-950/50 border border-yellow-500/30 rounded-lg p-6 max-h-96 overflow-y-auto mb-6">
                      <p className="text-yellow-100 leading-relaxed whitespace-pre-wrap">{mapContent}</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                      📥 Baixar PDF
                    </Button>
                    <Button
                      onClick={() => {
                        setSubmitted(false);
                        setMapContent(null);
                      }}
                      variant="outline"
                      className="w-full border-yellow-500/30 text-yellow-300 hover:bg-yellow-900/30"
                    >
                      Gerar Outro Mapa
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Info Sidebar */}
          <div>
            <Card className="bg-yellow-900/20 border-yellow-500/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">ℹ️ Sobre o Mapa</h3>
              <div className="space-y-4 text-sm text-yellow-200">
                <div>
                  <p className="font-bold text-yellow-300 mb-1">Pacote Básico</p>
                  <ul className="text-xs space-y-1 text-yellow-300">
                    <li>✓ Signo Solar</li>
                    <li>✓ Signo Lunar</li>
                    <li>✓ Ascendente</li>
                    <li>✓ Posição dos Planetas</li>
                    <li>✓ Análise de Casas</li>
                    <li>✓ 20 páginas</li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-yellow-500/30">
                  <p className="font-bold text-yellow-300 mb-1">Pacote Premium</p>
                  <ul className="text-xs space-y-1 text-yellow-300">
                    <li>✓ Tudo do Básico</li>
                    <li>✓ Aspectos Planetários</li>
                    <li>✓ Nodos Lunares</li>
                    <li>✓ Previsões Anuais</li>
                    <li>✓ 30 + 10 páginas</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <p className="text-yellow-200">
            ✨ Seu mapa astral é um retrato único do céu no momento exato do seu nascimento.
            Ele revela seus dons naturais, desafios e o caminho do seu destino. Quanto mais precisos
            forem seus dados (especialmente a hora), mais preciso será seu mapa.
          </p>
        </div>
      </main>
    </div>
  );
}

