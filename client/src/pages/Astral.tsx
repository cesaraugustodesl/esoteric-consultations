import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, ArrowLeft, Loader2, Download } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

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
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  const [filteredCities, setFilteredCities] = useState<typeof BRAZILIAN_CITIES>([]);
  const [showCities, setShowCities] = useState(false);
  const [stage, setStage] = useState<"form" | "payment" | "response">("form");
  const [mapContent, setMapContent] = useState<string | null>(null);
  const [mapId, setMapId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const createMap = trpc.astral.createMap.useMutation();
  const generatePDF = trpc.astral.generatePDF.useMutation();
  const createPaymentPreference = trpc.payment.createPreference.useMutation();

  const price = "40.00";

  // Check if returning from payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("paid");
    const mapIdParam = params.get("map");

    if (paid === "true" && mapIdParam) {
      setMapId(mapIdParam);
      setStage("response");
    }
  }, []);

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
      alert("Por favor, insira seu nome");
      return;
    }
    if (!birthDate) {
      alert("Por favor, insira sua data de nascimento");
      return;
    }
    if (!birthTime) {
      alert("Por favor, insira sua hora de nascimento");
      return;
    }
    if (!birthLocation.trim()) {
      alert("Por favor, selecione sua cidade de nascimento");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createMap.mutateAsync({
        birthDate,
        birthTime,
        birthLocation,
        packageType: "premium",
      });

      setMapId(result.mapId);
      setMapContent(result.mapContent);
      setStage("payment");
    } catch (error) {
      console.error("Erro ao criar mapa:", error);
      alert("Erro ao criar mapa. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!mapId) return;

    setIsProcessing(true);
    try {
      const result = await createPaymentPreference.mutateAsync({
        consultationType: "astral",
        amount: parseFloat(price),
        description: "Mapa Astral + Previsões",
        consultationId: mapId,
      });

      if (result.initPoint) {
        // Store info for callback
        localStorage.setItem("currentConsultationId", mapId);
        localStorage.setItem("currentConsultationType", "astral");
        localStorage.setItem("pendingPaymentId", result.paymentId);
        
        // Redirect to Mercado Pago
        window.location.href = result.initPoint;
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = async () => {
    if (!mapContent || !name) return;
    
    try {
      setIsProcessing(true);
      
      const result = await generatePDF.mutateAsync({
        name,
        birthDate,
        birthTime,
        birthLocation,
        packageType: "premium",
        mapContent,
      });

      if (result.success && result.pdf) {
        // Converter base64 para blob
        const binaryString = atob(result.pdf);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Mapa_Astral_${name.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      alert("Erro ao baixar PDF. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center gap-2">
            <Star className="w-8 h-8" />
            Mapa Astral + Previsões
          </h1>
        </div>

        {/* Form Stage */}
        {stage === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">O que é um Mapa Astral?</h3>
                <p className="text-purple-200 mb-4">
                  Um mapa astral é um retrato do céu no momento exato do seu nascimento. Ele revela sua essência espiritual, potenciais e desafios.
                </p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="text-2xl">🌟</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Signo Solar</h4>
                      <p className="text-sm text-purple-200">Sua personalidade e essência</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-2xl">🌙</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Signo Lunar</h4>
                      <p className="text-sm text-purple-200">Suas emoções e mundo interior</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-2xl">🔮</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Ascendente</h4>
                      <p className="text-sm text-purple-200">Como você é visto pelos outros</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-2xl">✨</div>
                    <div>
                      <h4 className="font-bold text-yellow-300">Previsões</h4>
                      <p className="text-sm text-purple-200">Ciclos planetários para seu futuro</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">Pacote Premium</h3>
                <p className="text-purple-200 mb-4">
                  Análise completa com 10+ páginas incluindo:
                </p>
                <ul className="space-y-2 text-purple-200 text-sm">
                  <li>✓ Análise de todos os 10 planetas</li>
                  <li>✓ Interpretação das 12 casas astrológicas</li>
                  <li>✓ Aspectos planetários e influências</li>
                  <li>✓ Previsões para o próximo ano</li>
                  <li>✓ Orientações espirituais práticas</li>
                  <li>✓ PDF para download e arquivo pessoal</li>
                </ul>
              </Card>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <Card className="bg-purple-900/30 border-purple-400/30 p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">Seus Dados</h3>

                {/* Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    Nome Completo
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome..."
                    className="bg-purple-800/30 border-purple-400/30 text-purple-100 placeholder:text-purple-400"
                  />
                </div>

                {/* Birth Date */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    Data de Nascimento
                  </label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-purple-800/30 border-purple-400/30 text-purple-100"
                  />
                </div>

                {/* Birth Time */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    Hora de Nascimento
                  </label>
                  <Input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="bg-purple-800/30 border-purple-400/30 text-purple-100"
                  />
                </div>

                {/* Birth Location */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-yellow-300 mb-2">
                    Cidade de Nascimento
                  </label>
                  <div className="relative">
                    <Input
                      value={birthLocation}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      onFocus={() => birthLocation && setShowCities(true)}
                      placeholder="Digite sua cidade..."
                      className="bg-purple-800/30 border-purple-400/30 text-purple-100 placeholder:text-purple-400"
                    />
                    {showCities && filteredCities.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-purple-800 border border-purple-400/30 rounded mt-1 max-h-48 overflow-y-auto z-10">
                        {filteredCities.map((city) => (
                          <button
                            key={city.name}
                            onClick={() => selectCity(city)}
                            className="w-full text-left px-4 py-2 hover:bg-purple-700 text-purple-100 text-sm"
                          >
                            {city.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="bg-yellow-950/60 p-4 rounded-lg border border-yellow-500/20 mb-6">
                  <p className="text-yellow-400 font-semibold text-sm mb-1">Valor da Consulta</p>
                  <p className="text-3xl font-bold text-yellow-300">R$ {price}</p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-lg py-6"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Prosseguir para Pagamento"
                  )}
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Payment Stage */}
        {stage === "payment" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-400/50 p-8">
              <h2 className="text-2xl font-bold text-yellow-300 mb-4">💳 Confirmar Mapa Astral</h2>
              <p className="text-yellow-100 mb-6">
                Finalize o pagamento para receber seu mapa astral completo com previsões personalizadas:
              </p>

              <div className="bg-yellow-950/60 p-6 rounded-lg border border-yellow-500/20 mb-6">
                <p className="text-yellow-400 font-semibold text-sm mb-2">Valor da Consulta</p>
                <p className="text-4xl font-bold text-yellow-300">R$ {price}</p>
                <p className="text-yellow-200 text-sm mt-2">Mapa Astral + Previsões (10+ páginas)</p>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg text-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Pagar com Mercado Pago"
                )}
              </Button>

              <p className="text-yellow-200 text-xs mt-4 text-center">
                Após confirmar o pagamento, você receberá seu mapa astral em PDF.
              </p>

              <Button
                variant="ghost"
                onClick={() => setStage("form")}
                className="w-full mt-4 text-yellow-300 hover:text-yellow-200"
              >
                ← Voltar ao Formulário
              </Button>
            </Card>
          </div>
        )}

        {/* Response Stage */}
        {stage === "response" && mapContent && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-400/50 p-8">
              <h2 className="text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6" />
                Seu Mapa Astral
              </h2>
              <p className="text-yellow-100 mb-6">
                Aqui está sua análise astrológica completa. Você pode fazer download do PDF para guardar.
              </p>

              <Button
                onClick={downloadPDF}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-lg py-6 mb-6"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Baixar PDF
                  </>
                )}
              </Button>

              <div className="bg-purple-900/30 border border-purple-400/30 p-6 rounded-lg max-h-96 overflow-y-auto">
                <div className="text-purple-100 whitespace-pre-wrap text-sm leading-relaxed">
                  {mapContent}
                </div>
              </div>
            </Card>

            {/* New Consultation Button */}
            <Button
              onClick={() => {
                setName("");
                setBirthDate("");
                setBirthTime("");
                setBirthLocation("");
                setMapContent(null);
                setMapId(null);
                setStage("form");
                window.history.replaceState({}, "", "/astral");
              }}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-lg py-6"
            >
              Novo Mapa Astral
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

