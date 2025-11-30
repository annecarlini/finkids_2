import { useState, useEffect } from "react";
import { ProgressBar } from '@/components/custom/ProgressBar/Progressbar';
import { QuizController } from '@/components/Quiz/QuizController';
import './Phase.css';
import Mysidebar from '@/components/custom/Sidebard/Mysidebar';
import coin from '../../assets/Logotipo.png';

function Phase2() {
  const [progressValue, setProgressValue] = useState(0);
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
  }, []);

  return (
    <div className="main-page">
      <div className="trail">
        <Mysidebar />
        <h1>Trilha de aprendizado - Fase 2</h1>
      </div>

      <div className="card-progress2">
        <h2>Investimentos iniciais</h2>
        <div className="coins-display" style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={coin} alt="moeda" style={{ width: '30px', height: '30px' }} />
          <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
            Total: {totalCoins} moedas
          </span>
        </div>
        <ProgressBar value={progressValue} />
      </div>

      <div className="card-quizz">
        <QuizController
          phaseId="Phase2" // Passa o ID da fase
          onCoinsUpdate={loadCoins}
          onStepChange={async (currentStep, totalSteps) => {
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
                body: JSON.stringify({ phase: 'Phase2', step_id: currentStep, progress: { percent } }),
              });
              await loadCoins();
            } catch (err) {
              console.error('Não foi possível salvar progresso:', err);
            }
          }}
          onPhaseFinish={async (totalScore) => {
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
                body: JSON.stringify({ phase: 'Phase2', progress: { percent: 100, completed: true, score: totalScore } }),
              });
              await loadCoins();
            } catch (err) {
              console.error('Não foi possível salvar progresso final:', err);
            }
          }}
        />
      </div>
    </div>
  );
}

export default Phase2;
