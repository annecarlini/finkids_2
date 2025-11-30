import { useState, useEffect } from "react";
import { ProgressBar } from '@/components/custom/ProgressBar/Progressbar';
import { QuizController } from '@/components/Quiz/QuizController';
import './Phase.css';
import Mysidebar from '@/components/custom/Sidebard/Mysidebar';
import { useAuth } from '@/hooks/useAuth'
import coin from '../../assets/Logotipo.png';

function Phase() {
  const { user } = useAuth();
  const [currentPhase, setCurrentPhase] = useState<string>("Inicio");
  const [progressValue, setProgressValue] = useState(0);
  const [showQuizCard, setShowQuizCard] = useState(false);
  const [isPhaseFinished, setIsPhaseFinished] = useState(false);
  const [avatarName, setAvatarName] = useState<string>("Capitão Economix");
  const [totalCoins, setTotalCoins] = useState<number>(0);

  // Buscar nome do avatar escolhido
  useEffect(() => {
    const fetchAvatarName = async () => {
      try {
        if (user?.avatar) {
          const res = await fetch('/api/avatars', { credentials: 'include' });
          const data = await res.json();
          if (data?.success && data.avatars) {
            const avatar = data.avatars.find((a: any) => 
              a.public_url === user.avatar || a.caminho_imagem === user.avatar
            );
            if (avatar?.nome) setAvatarName(avatar.nome);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar nome do avatar', err);
      }
    };
    fetchAvatarName();
  }, [user?.avatar]);

  // Carregar moedas do backend
  const loadCoins = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/me/progress', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) return;
      const data = await res.json();
      
      console.log('Dados de progresso recebidos:', data);
      
      if (data?.success && data.progress?.phases) {
        let total = 0;
        
        Object.entries(data.progress.phases).forEach(([phase, info]: [string, any]) => {
          const phaseCoins = info?.progress?.coins || 0;
          console.log(`Fase ${phase}: ${phaseCoins} moedas`);
          total += phaseCoins;
        });
        
        console.log('Total de moedas calculado:', total);
        setTotalCoins(total);
      }
    } catch (err) {
      console.error('Erro ao carregar moedas:', err);
    }
  };

  // Carregar moedas ao montar e ao mudar de fase
  useEffect(() => {
    loadCoins();
  }, [currentPhase]);

  const handleOpenPhases = () => {
    setShowQuizCard(true);
    setCurrentPhase("Inicio");
    setIsPhaseFinished(false);
  };

  const handleSelectPhase = (phase: string) => {
    setCurrentPhase(phase);
    setProgressValue(0);
    setIsPhaseFinished(false);
    setShowQuizCard(true);
  };

  const handlePhaseFinished = () => {
    setIsPhaseFinished(true);
  };

  const handleNextPhase = () => {
    setIsPhaseFinished(false);
    if (currentPhase === "Phase1") setCurrentPhase("Inicio");
    else if (currentPhase === "Phase2") setCurrentPhase("Inicio");
    else if (currentPhase === "Phase3") setCurrentPhase("Inicio");
    setProgressValue(0);
  };

  return (
    <div className="layout">
      <Mysidebar />

      <div className="main-page">
        <div className="trail"></div>

        {/* AVATAR — aparece apenas na tela inicial */}
        {currentPhase === "Inicio" && (
          <div className="avatar-quote fixed-block">
            <div className="avatar-box">
              {/* Mostrar avatar do usuário autenticado se disponível */}
              <img src={user?.avatar || '/avatars/shadcn.jpg'} alt="Avatar" />
            </div>

            <div className="quote-content">
              <h2>Oi, eu sou {avatarName}!</h2>

              {!showQuizCard && (
                <>
                  <h3>Está na hora de iniciar o aprendizado!</h3>
                  <p>
                    Embarque em uma aventura incrível para aprender sobre dinheiro de uma forma divertida.
                  </p>

                  <div className="quote-buttons">
                    <button className="btn-outline" onClick={handleOpenPhases}>
                      Entenda as Fases!
                    </button>
                    <button className="btn-primary" onClick={() => handleSelectPhase("Phase1")}>
                      Começar o Quiz!
                    </button>
                  </div>
                </>
              )}

              {showQuizCard && (
                <>
                  <h3>Estou por aqui caso precise de ajuda!</h3>
                  <p>Selecione uma fase ou continue seu progresso.</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* CARD-QUIZZ — aparece após clicar em "Entenda as Fases" */}
        {showQuizCard && (
          <div
            className={`card-quizz full-height 
               ${currentPhase !== "Inicio" ? "card-quizz-quizmode" : ""}`}
          >
            {/* TELA COM AS FASES */}
            {currentPhase === "Inicio" && (
              <div className="phase-instructions">
                <h2>Entenda como iniciar o desafio!</h2>
                <p>
                  Cada pergunta certa turbina sua carteira com +25 moedas.
                  Escolha uma fase, clique no botão e mostre que você manda muito bem nas finanças!
                </p>

                <div className="phase-buttons">
                  <button className="btn-primary phase-btn" onClick={() => handleSelectPhase("Phase1")}>
                    Fase 1 — Orçamento Pessoal e Familiar
                  </button>

                  <button className="btn-primary phase-btn" onClick={() => handleSelectPhase("Phase2")}>
                    Fase 2 — Poupança Financeira
                  </button>

                  <button className="btn-primary phase-btn" onClick={() => handleSelectPhase("Phase3")}>
                    Fase 3 — Investimentos
                  </button>
                </div>
              </div>
            )}

            {/* QUIZ */}
            {currentPhase !== "Inicio" && (
              <>
                <div className="card-progress2">
                  <h2>
                    {currentPhase === "Phase1" && "Orçamento pessoal e familiar"}
                    {currentPhase === "Phase2" && "Poupança Financeira"}
                    {currentPhase === "Phase3" && "Investimentos"}
                  </h2>

                  <div className="coins-display" style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={coin} alt="moeda" style={{ width: '30px', height: '30px' }} />
                    <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
                      Total: {totalCoins} moedas
                    </span>
                  </div>

                  <div className="progress-wrapper">
                    <ProgressBar value={progressValue} />
                  </div>
                </div>

                <QuizController
                  phaseId={currentPhase}
                  onCoinsUpdate={loadCoins}
                  onStepChange={async (currentStep: number, totalSteps: number) => {
                    const percent = ((currentStep + 1) / totalSteps) * 100;
                    setProgressValue(percent);
                    // salvar progresso no backend (não bloqueante)
                    try {
                      const token = localStorage.getItem('token');
                      if (!token) return;
                      await fetch('/api/me/progress', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ phase: currentPhase, step_id: currentStep, progress: { percent } }),
                      });
                      await loadCoins();
                } catch (err) {
                  console.error('Não foi possível salvar progresso:', err);
                }                    // Se o quiz terminou
                    if (currentStep + 1 === totalSteps) {
                      handlePhaseFinished();
                    }
                  }}
                  onPhaseFinish={async (totalCoins: number) => {
                    // marcar fase como completa e salvar moedas ganhas
                    setProgressValue(100);
                    try {
                      const token = localStorage.getItem('token');
                      if (!token) return;
                      await fetch('/api/me/progress', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ phase: currentPhase, progress: { percent: 100, completed: true, coins: totalCoins } }),
                      });
                      await loadCoins();
                    } catch (err) {
                      console.warn('Não foi possível salvar progresso final', err);
                    }
                  }}
                />

                {/* BOTÃO PARA PRÓXIMA FASE */}
                {isPhaseFinished && (
                  <div className="next-phase-button">
                    <button className="btn-primary" onClick={handleNextPhase}>
                      {currentPhase === "Phase1" && "Ir para Início e escolher Fase 2"}
                      {currentPhase === "Phase2" && "Ir para Início e escolher Fase 3"}
                      {currentPhase === "Phase3" && "Voltar para Início"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Phase;
