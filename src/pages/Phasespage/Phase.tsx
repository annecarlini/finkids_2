import { useState } from "react";
import { ProgressBar } from '@/components/custom/ProgressBar/Progressbar';
import { QuizController } from '@/components/Quiz/QuizController';
import './Phase.css';
import Mysidebar from '@/components/custom/Sidebard/Mysidebar';
import AvatarN from "../../assets/avatar1-a.png";

function Phase() {
  const [currentPhase, setCurrentPhase] = useState<string>("Inicio");
  const [progressValue, setProgressValue] = useState(0);
  const [showQuizCard, setShowQuizCard] = useState(false);
  const [isPhaseFinished, setIsPhaseFinished] = useState(false);

  const handleOpenPhases = () => {
    setShowQuizCard(true);
    setCurrentPhase("Inicio");
    setIsPhaseFinished(false);
  };

  const handleSelectPhase = (phase: string) => {
    setCurrentPhase(phase);
    setProgressValue(0);
    setIsPhaseFinished(false);
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
              <img src={AvatarN} alt="Avatar" />
            </div>

            <div className="quote-content">
              <h2>Oi, eu sou o Capitão Economix!</h2>

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
                  Cada pergunta certa turbina sua carteira com +50 moedas.
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

                  <div className="progress-wrapper">
                    <ProgressBar value={progressValue} />
                  </div>
                </div>

                <QuizController
                  phaseId={currentPhase}
                  onStepChange={(currentStep: number, totalSteps: number) => {
                    const progress = ((currentStep + 1) / totalSteps) * 100;
                    setProgressValue(progress);

                    // Se o quiz terminou
                    if (currentStep + 1 === totalSteps) {
                      handlePhaseFinished();
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
