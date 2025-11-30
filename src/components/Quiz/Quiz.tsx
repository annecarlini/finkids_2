import { useEffect, useState } from "react";
import "./Quiz.css";

interface Question {
  id: number;
  quizId: string;
  pergunta: string;
  opcoes: string[];
  reposta_correta: string;
}

interface QuizProps {
  phaseId: string;      // "Phase1" ou "Phase2"
  quizId: string;       // ex: "quiz1" ou "quiz1_phase2"
  onFinish: (score: number) => void;
  onCoinsUpdate?: () => void; // Callback para atualizar moedas
}

const COINS_PER_CORRECT = 25; // Moedas ganhas por acerto

export function Quiz({ phaseId, quizId, onFinish, onCoinsUpdate }: QuizProps) {
  const [questionsData, setQuestionsData] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Importa o arquivo de perguntas da fase correta dinamicamente
  useEffect(() => {
    setLoading(true);
    setQuestionsData([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setFeedback(null);
    setScore(0);

    // Se o arquivo na phase2 se chama questions2.json, ajuste o path:
    // import(`../../data/${phaseId}/questions2.json`)
    import(`../../data/${phaseId}/questions.json`)
      .then((module) => {
        // módulo default deve ser um array de perguntas
        const allQuestions = module.default as Question[];
        setQuestionsData(allQuestions);
      })
      .catch((err) =>
        console.error("Erro ao carregar perguntas da fase:", phaseId, err)
      )
      .finally(() => setLoading(false));
  }, [phaseId]);

  if (loading) return <p>Carregando perguntas...</p>;

  // filtra apenas perguntas daquele quizId (único por fase)
  const questions = questionsData.filter((q) => q.quizId === quizId);

  if (questions.length === 0)
    return (
      <div>
        <p>Nenhuma pergunta encontrada para este quiz ({quizId}).</p>
        <p>
          Verifique: arquivo <code>data/{phaseId}/questions.json</code> e se o
          campo <code>quizId</code> bate com <code>{quizId}</code>.
        </p>
      </div>
    );

  const question = questions[currentQuestionIndex];

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);

    if (option === question.reposta_correta) {
      setFeedback(`✅ Resposta correta! +${COINS_PER_CORRECT} moedas`);
      setScore((s) => s + 1);
      
      // Salvar moedas imediatamente após acerto
      (async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('Token não encontrado. Usuário precisa fazer login.');
            return;
          }
          
          const res = await fetch('/api/me/progress', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!res.ok) {
            console.error('Erro ao buscar progresso:', res.status, await res.text());
            return;
          }
          
          const data = await res.json();
          
          // Pegar moedas atuais da fase
          let currentPhaseCoins = 0;
          if (data?.success && data.progress?.phases && data.progress.phases[phaseId]) {
            currentPhaseCoins = data.progress.phases[phaseId].progress?.coins || 0;
          }
          
          console.log(`Moedas atuais da fase ${phaseId}:`, currentPhaseCoins);
          console.log(`Adicionando: ${COINS_PER_CORRECT} moedas`);
          
          // Salvar moedas incrementadas
          const saveRes = await fetch('/api/me/progress', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              phase: phaseId, 
              progress: { 
                coins: currentPhaseCoins + COINS_PER_CORRECT,
                quizId: quizId,
                timestamp: new Date().toISOString()
              } 
            }),
          });
          
          if (!saveRes.ok) {
            console.error('Erro ao salvar moedas:', saveRes.status, await saveRes.text());
          } else {
            console.log('Moedas salvas com sucesso! Nova quantidade:', currentPhaseCoins + COINS_PER_CORRECT);
            // Notificar que as moedas foram atualizadas
            onCoinsUpdate?.();
          }
        } catch (err) {
          console.error('Não foi possível salvar moedas automaticamente', err);
        }
      })();
    } else {
      setFeedback(`❌ Resposta correta: ${question.reposta_correta}`);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      // fim do quiz — retorna moedas ganhas (já foram salvas a cada acerto)
      const totalCoins = score * COINS_PER_CORRECT;
      onFinish(totalCoins);
    }
  };

  return (
    <div className="quiz-container">
      <h3 className="quiz-question">{question.pergunta}</h3>

      <div className="quiz-options">
        {question.opcoes.map((opt, idx) => (
          <button
            key={idx}
            className={`quiz-option ${
              selectedOption === opt
                ? opt === question.reposta_correta
                  ? "correct"
                  : "incorrect"
                : ""
            }`}
            onClick={() => handleSelectOption(opt)}
            disabled={!!selectedOption}
          >
            {opt}
          </button>
        ))}
      </div>

      {feedback && <p className="quiz-feedback">{feedback}</p>}

      {selectedOption && (
        <button className="quiz-next-button" onClick={handleNext}>
          {currentQuestionIndex < questions.length - 1 ? "Próxima" : "Finalizar"}
        </button>
      )}
    </div>
  );
}