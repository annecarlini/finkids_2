import { useState, useEffect } from "react";
import { ProgressBar } from '@/components/custom/ProgressBar/Progressbar';
import { QuizController } from '@/components/Quiz/QuizController';
import './Phase.css';
import Mysidebar from '@/components/custom/Sidebard/Mysidebar';
import coin from '../../assets/Logotipo.png';

function Phase() {
  const [selectPhase, setSelectPhase] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0); // 0 a 100
  const [totalCoins, setTotalCoins] = useState<number>(0);

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
      if (data?.success && data.progress?.phases) {
        let total = 0;
        Object.entries(data.progress.phases).forEach(([_, info]: [string, any]) => {
          const phaseCoins = info?.progress?.coins || 0;
          total += phaseCoins;
        });
        setTotalCoins(total);
      }
    } catch (err) {
      console.error('Erro ao carregar moedas:', err);
    }
  };

  useEffect(() => {
    loadCoins();
  }, [selectPhase]);

  return (
    <div className="main-page">
      <div className="trail">
        <Mysidebar />
        <h1>Trilha de aprendizado</h1>
      </div>

      <div className="phases">
        <h3 onClick={() => setSelectPhase(selectPhase === "Inicio" ? null : "Inicio")}>Inicio</h3>
        <h3 onClick={() => setSelectPhase(selectPhase === "Phase1" ? null : "Phase1")}>Fase 1</h3>
      </div>

      {selectPhase && (
        <>
          <div className="card-progress2">
            <h2>
              {selectPhase === "Phase1" ? "Orçamento pessoal e familiar" : selectPhase}
            </h2>
            {selectPhase && (
              <div className="coins-display" style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={coin} alt="moeda" style={{ width: '30px', height: '30px' }} />
                <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
                  Total: {totalCoins} moedas
                </span>
              </div>
            )}
            <ProgressBar value={progressValue} />
          </div>

          <div className="card-quizz">
            <QuizController
              phaseId={selectPhase} // PASSANDO O ID DA FASE
              onCoinsUpdate={loadCoins}
              onStepChange={async (currentStep: number, totalSteps: number) => {
                const percent = ((currentStep + 1) / totalSteps) * 100;
                setProgressValue(percent);
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
                    body: JSON.stringify({ phase: selectPhase, step_id: currentStep, progress: { percent } }),
                  });
                  await loadCoins();
                } catch (err) {
                  console.error('Não foi possível salvar progresso:', err);
                }
              }}
              onPhaseFinish={async (totalScore: number) => {
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
                    body: JSON.stringify({ phase: selectPhase, progress: { percent: 100, completed: true, score: totalScore } }),
                  });
                  await loadCoins();
                } catch (err) {
                  console.error('Não foi possível salvar progresso final:', err);
                }
              }}
            />
          </div>
        </>
      )}

      <div className="right-side-container">
        <div className="content"></div>
      </div>
    </div>
  );
}

export default Phase;
