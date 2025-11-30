import { useEffect, useState } from "react";
import { Quiz } from "./Quiz";
import "./QuizController.css";

interface StepText {
  id: number;
  tipo: "texto";
  titulo?: string;
  conteudo: string;
}

interface StepQuiz {
  id: number;
  tipo: "quiz";
  quizId: string;
}

type Step = StepText | StepQuiz;

interface QuizControllerProps {
  phaseId: string; // ex: "Phase1" ou "Phase2"
  onStepChange?: (currentStep: number, totalSteps: number) => void;
  onPhaseFinish?: (totalScore: number) => void;
  onCoinsUpdate?: () => void; // Callback para atualizar moedas
}

export function QuizController({
  phaseId,
  onStepChange,
  onPhaseFinish,
  onCoinsUpdate,
}: QuizControllerProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega stepsData dinamicamente conforme phaseId
  useEffect(() => {
    setLoading(true);
    setSteps([]);
    setCurrentStep(0);
    setScoreHistory([]);

    import(`../../data/${phaseId}/stepsData${phaseId}.json`)
      .then((module) => {
        const data = module.default as Step[];
        setSteps(data);
      })
      .catch((err) => {
        console.error("Erro ao carregar steps da fase:", phaseId, err);
        setSteps([]);
      })
      .finally(() => setLoading(false));
  }, [phaseId]);

  const totalSteps = steps.length;

  // informa o pai sobre mudança de step
  useEffect(() => {
    onStepChange?.(currentStep, totalSteps);
  }, [currentStep, totalSteps, onStepChange]);

  const handleNext = (coins: number = 0) => {
    // registra moedas do step (quiz retorna moedas, textos passam 0)
    setScoreHistory((prev) => [...prev, coins]);

    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // fase finalizada
      const total = scoreHistory.reduce((a, b) => a + b, 0) + coins;
      onPhaseFinish?.(total);
      // você pode escolher manter o histórico ou resetar
    }
  };

  if (loading) return <p>Carregando fase...</p>;
  if (steps.length === 0) return <p>Não há conteúdo para esta fase.</p>;

  const step = steps[currentStep];

  // Segurança: se for quiz e não tiver quizId, evita crash
  if (step.tipo === "quiz" && !("quizId" in step)) {
    console.error("Step do tipo quiz sem quizId:", step);
    return <p>Erro no step do quiz (falta quizId).</p>;
  }

  return (
    <div className="quiz-controller">
      {step.tipo === "texto" && (
        <div className="quiz-text">
          {step.titulo && <h3 className="quiz-tittle">{step.titulo}</h3>}
          <p className="quiz-content">{step.conteudo}</p>
          <button
            className="quiz-next-button"
            onClick={() => handleNext(0)} // texto não soma pontos
          >
            Próximo
          </button>
        </div>
      )}

      {step.tipo === "quiz" && "quizId" in step && (
        <Quiz
          key={step.id}
          phaseId={phaseId}
          quizId={step.quizId}
          onFinish={(points) => handleNext(points)}
          onCoinsUpdate={onCoinsUpdate}
        />
      )}

      {/* Exemplo de histórico simples (opcional) */}
      {/* {scoreHistory.length > 0 && <div>Histórico: {scoreHistory.join(", ")}</div>} */}
    </div>
  );
}
