import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Sparkles, Moon, Zap, Heart, Wand2 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black text-white">
      {/* Navigation */}
      <nav className="border-b border-purple-700/30 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {APP_TITLE}
            </span>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <span className="text-sm text-purple-300">Bem-vindo, {user?.name}</span>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Entrar
                </Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            Consultas Esotéricas
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto mb-8">
            Conecte-se com a sabedoria ancestral. Receba orientações profundas do plano espiritual para iluminar seu caminho.
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8">
                Começar Agora
              </Button>
            </a>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Tarot Paid */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 p-8 hover:border-purple-400/60 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Wand2 className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-bold">Leitura de Tarot</h2>
              </div>
              <p className="text-purple-200 mb-6">
                Receba respostas profundas e intuitivas às suas perguntas mais importantes. Cada leitura é uma jornada de autoconhecimento.
              </p>
              <div className="space-y-2 mb-6 text-sm text-purple-300">
                <p>💎 1 pergunta - R$ 3,00</p>
                <p>💎 2 perguntas - R$ 5,00</p>
                <p>💎 3 perguntas - R$ 7,00</p>
                <p>💎 5 perguntas - R$ 10,00</p>
              </div>
              <Link href="/tarot">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Consultar Tarot
                </Button>
              </Link>
            </div>
          </div>

          {/* Astral Maps Paid */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border border-yellow-500/30 p-8 hover:border-yellow-400/60 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/0 to-orange-600/0 group-hover:from-yellow-600/10 group-hover:to-orange-600/10 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold">Mapa Astral</h2>
              </div>
              <p className="text-yellow-200 mb-6">
                Descubra os mistérios do universo no momento do seu nascimento. Signos, planetas e tendências.
              </p>
              <div className="space-y-2 mb-6 text-sm text-yellow-300">
                <p>✨ Mapa Astral + Previsões - R$ 40,00</p>
              </div>
              <Link href="/astral">
                <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                  Gerar Mapa
                </Button>
              </Link>
            </div>
          </div>

          {/* Oracles Paid */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 p-8 hover:border-cyan-400/60 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/0 to-blue-600/0 group-hover:from-cyan-600/10 group-hover:to-blue-600/10 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-cyan-400" />
                <h2 className="text-2xl font-bold">Oráculos</h2>
              </div>
              <p className="text-cyan-200 mb-6">
                Runas, Anjos e Búzios revelam mensagens do universo através de símbolos sagrados.
              </p>
              <div className="space-y-2 mb-6 text-sm text-cyan-300">
                <p>🔮 1 símbolo - R$ 5,00</p>
                <p>🔮 3 símbolos - R$ 12,00</p>
                <p>🔮 5 símbolos - R$ 20,00</p>
              </div>
              <Link href="/oracle">
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                  Consultar Oráculo
                </Button>
              </Link>
            </div>
          </div>

          {/* Numerology Paid */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border border-yellow-500/30 p-8 hover:border-yellow-400/60 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/0 to-amber-600/0 group-hover:from-yellow-600/10 group-hover:to-amber-600/10 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold">Numerologia</h2>
              </div>
              <p className="text-yellow-200 mb-6">
                Descubra os números que definem seu destino, alma e personalidade. Leitura completa com 5 números principais.
              </p>
              <div className="space-y-2 mb-6 text-sm text-yellow-300">
                <p>🔢 Número de Destino</p>
                <p>🔢 Número da Alma</p>
                <p>🔢 Número da Personalidade</p>
                <p>🔢 Número de Expressão</p>
                <p>🔢 Ano Pessoal</p>
              </div>
              <div className="text-lg font-bold text-yellow-400 mb-4">R$ 25,00</div>
              <Link href="/numerology">
                <Button className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700">
                  Gerar Leitura
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Free Services */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {/* Dreams */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30 p-8 hover:border-blue-400/60 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-indigo-600/0 group-hover:from-blue-600/10 group-hover:to-indigo-600/10 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Moon className="w-8 h-8 text-blue-400" />
                <h2 className="text-2xl font-bold">Interpretação de Sonhos</h2>
              </div>
              <p className="text-blue-200 mb-6">
                Descubra o significado profundo de seus sonhos. Explore símbolos, mensagens do inconsciente e orientações espirituais.
              </p>
              <div className="space-y-2 mb-6 text-sm text-blue-300">
                <p>✨ Análise de símbolos</p>
                <p>✨ Significados espirituais</p>
                <p>✨ Mensagens do inconsciente</p>
              </div>
              <Link href="/dreams">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Interpretar Sonho
                </Button>
              </Link>
            </div>
          </div>

          {/* Energy */}
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-900/40 to-rose-900/40 border border-pink-500/30 p-8 hover:border-pink-400/60 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/0 to-rose-600/0 group-hover:from-pink-600/10 group-hover:to-rose-600/10 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-pink-400" />
                <h2 className="text-2xl font-bold">Orientações Energéticas</h2>
              </div>
              <p className="text-pink-200 mb-6">
                Harmonize suas energias e chakras. Receba orientações para transformação pessoal e bem-estar espiritual.
              </p>
              <div className="space-y-2 mb-6 text-sm text-pink-300">
                <p>💫 Análise de chakras</p>
                <p>💫 Harmonização energética</p>
                <p>💫 Orientações de transformação</p>
              </div>
              <Link href="/energy">
                <Button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
                  Receber Orientação
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="text-center p-6 rounded-lg bg-purple-900/20 border border-purple-500/20">
            <Moon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sabedoria Ancestral</h3>
            <p className="text-purple-300 text-sm">
              Mensagens profundas do plano espiritual para guiar sua jornada.
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-pink-900/20 border border-pink-500/20">
            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Autoconhecimento</h3>
            <p className="text-pink-300 text-sm">
              Descubra insights sobre sua vida, relacionamentos e propósito.
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-indigo-900/20 border border-indigo-500/20">
            <Zap className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Energia Transformadora</h3>
            <p className="text-indigo-300 text-sm">
              Harmonize suas energias e alinhe-se com seu verdadeiro eu.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="text-center py-12 px-8 rounded-xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30">
            <h2 className="text-3xl font-bold mb-4">Pronto para sua jornada espiritual?</h2>
            <p className="text-purple-200 mb-8 max-w-2xl mx-auto">
              Crie sua conta gratuitamente e comece a explorar as orientações do universo.
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Criar Conta Agora
              </Button>
            </a>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-700/30 bg-black/40 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-purple-300 text-sm">
          <p>✨ Consultas Esotéricas © 2025 - Sabedoria para sua jornada espiritual</p>
        </div>
      </footer>
    </div>
  );
}

