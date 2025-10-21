import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Sparkles, Moon, Zap, Heart, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-purple-700/30 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-purple-900/30 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Consultas Esotéricas
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-purple-300">{user.name}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-purple-500 text-purple-300 hover:bg-purple-900/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-black/40 border-r border-purple-700/30 p-6 h-screen sticky top-16 overflow-y-auto">
            <nav className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
                  Serviços Pagos
                </h3>
                <Link href="/tarot">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-purple-200 hover:bg-purple-900/30 hover:text-purple-100"
                  >
                    <Sparkles className="w-4 h-4 mr-3" />
                    Leitura de Tarot
                  </Button>
                </Link>
                <Link href="/astral">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-yellow-200 hover:bg-yellow-900/30 hover:text-yellow-100"
                  >
                    <Sparkles className="w-4 h-4 mr-3" />
                    Mapa Astral
                  </Button>
                </Link>
                <Link href="/oracle">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100"
                  >
                    <Sparkles className="w-4 h-4 mr-3" />
                    Oráculos
                  </Button>
                </Link>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                  Serviços Gratuitos
                </h3>
                <Link href="/dreams">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-indigo-200 hover:bg-indigo-900/30 hover:text-indigo-100"
                  >
                    <Moon className="w-4 h-4 mr-3" />
                    Interpretação de Sonhos
                  </Button>
                </Link>

                <Link href="/energy">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-indigo-200 hover:bg-indigo-900/30 hover:text-indigo-100"
                  >
                    <Heart className="w-4 h-4 mr-3" />
                    Orientações Energéticas
                  </Button>
                </Link>
              </div>

              <div className="pt-6 border-t border-purple-700/30">
                <h3 className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-3">
                  Histórico
                </h3>
                <Link href="/history">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-pink-200 hover:bg-pink-900/30 hover:text-pink-100"
                  >
                    Minhas Consultas
                  </Button>
                </Link>
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Bem-vindo ao seu espaço sagrado
              </h1>
              <p className="text-purple-200">
                Escolha um serviço para começar sua jornada de autoconhecimento e orientação espiritual.
              </p>
            </div>

            {/* Quick Access Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tarot Card */}
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 p-8 hover:border-purple-400/60 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all" />
                <div className="relative z-10">
                  <Sparkles className="w-10 h-10 text-purple-400 mb-4" />
                  <h2 className="text-2xl font-bold mb-3">Leitura de Tarot</h2>
                  <p className="text-purple-200 mb-6">
                    Receba respostas profundas às suas perguntas. Escolha entre 1 a 5 perguntas.
                  </p>
                  <div className="space-y-2 text-sm text-purple-300 mb-6">
                    <p>💎 1 pergunta - R$ 3,00</p>
                    <p>💎 2 perguntas - R$ 5,00</p>
                    <p>💎 3 perguntas - R$ 7,00</p>
                    <p>💎 5 perguntas - R$ 10,00</p>
                  </div>
                  <Link href="/tarot">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Consultar Agora
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Free Services Card */}
              <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-8 hover:border-indigo-400/60 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-blue-600/0 group-hover:from-indigo-600/10 group-hover:to-blue-600/10 transition-all" />
                <div className="relative z-10">
                  <Heart className="w-10 h-10 text-indigo-400 mb-4" />
                  <h2 className="text-2xl font-bold mb-3">Serviços Gratuitos</h2>
                  <p className="text-indigo-200 mb-6">
                    Explore orientações espirituais sem custo.
                  </p>
                  <ul className="space-y-2 text-sm text-indigo-300 mb-6">
                    <li>🌙 Interpretação de Sonhos</li>
                    <li>⚡ Mesas Radiônicas</li>
                    <li>💫 Orientações Energéticas</li>
                  </ul>
                  <Link href="/dreams">
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
                      Explorar
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

