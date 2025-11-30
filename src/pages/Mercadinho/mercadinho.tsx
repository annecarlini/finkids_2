import "./mercadinho.css";
import Mysidebar from "../../components/custom/Sidebard/Mysidebar";
import CustomProgressBar from "@/components/custom/OwnprogressBar/GameprogressBar";

import coin from "../../assets/Logotipo.png";
import focus from "../../assets/logotipo-focus.png";
import AvatarN from "../../assets/avatar1-a.png";

import good from "../../assets/tags-good.png";
import attention from "../../assets/tags-attention.png";

import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth'
import Modal from "../../components/custom/Modal/Modal";
import Vilain from "../../assets/pigvilan.png";

function Mercadinho() {
  // ============================
  // ESTADOS PRINCIPAIS
  // ============================

  const [showModal, setShowModal] = useState(false);
  const [showVillain, setShowVillain] = useState(false);
  const [villainEffect, setVillainEffect] = useState(false);
  const [villainEntered, setVillainEntered] = useState(false);

  const [currentRound, setCurrentRound] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [focusPoints, setFocusPoints] = useState(0);
  const { user } = useAuth();

  // Função para carregar moedas
  const loadCoins = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Token não encontrado');
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
      const data = await res.json();
      if (data && data.success && data.progress) {
        // Progresso do mercadinho
        if (data.progress.phases && data.progress.phases.Mercadinho) {
          const p = data.progress.phases.Mercadinho.progress?.percent ?? 0;
          setProgressPercent(p);
        }
        
        // Calcular moedas totais (soma de todas as fases completadas)
        let coins = 0;
        if (data.progress.phases) {
          Object.values(data.progress.phases).forEach((phase: any) => {
            if (phase.progress?.coins) {
              coins += phase.progress.coins;
            }
          });
        }
        
        // Subtrair moedas gastas no mercadinho
        let spentCoins = 0;
        if (data.progress.phases && data.progress.phases['Mercadinho']) {
          spentCoins = data.progress.phases['Mercadinho'].progress?.spentCoins || 0;
        }
        setTotalCoins(coins - spentCoins);
        
        // Calcular pontos de foco das escolhas do mercadinho
        let focus = 0;
        if (data.progress.phases && data.progress.phases['Mercadinho']) {
          focus = data.progress.phases['Mercadinho'].progress?.focusPoints || 0;
        }
        setFocusPoints(focus);
      }
    } catch (err) {
      console.error('Erro ao carregar progresso:', err);
    }
  };

  // carregar progresso salvo (se houver)
  useEffect(() => {
    loadCoins();
    
    // Recarregar moedas quando a janela recebe foco
    const handleFocus = () => {
      loadCoins();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const [modalInfo, setModalInfo] = useState({
    title: "",
    text: "",
  });

  // ============================
  // RODADAS (EDITÁVEIS)
  // ============================

  const rounds = [
    {
      choiceHeader: {
        title: "Faça sua escolha!",
        subtitle: "Avalie seu orçamento e observe o que cada opção oferece. Algumas mochilas podem acabar custando mais moedas do que parecem à primeira vista. Pense bem no que faz mais sentido para você!.",
      },

      choices: [
        {
          id: "choice-1",
          title: "Mochila Simples",
          description:
            "Resistente, leve e com ótimo custo-benefício. Ideal para quem prioriza durabilidade.",
          price: "25 moedas",
          cost: 25,
          tag: {
            icon: good,
            label: "Custo-benefício",
          },
          modalTitle: "Custo-benefício aprovado!",
          modalText:
            "Essa mochila entrega valor sem estourar o orçamento. Boa escolha!",
          villain: false,
          focusPoints: 10,
        },

        {
          id: "choice-2",
          title: "Mochila com LED",
          description:
            "Chamativa e perfeita para se destacar. O LED esconde detalhes que podem surpreender.",
          price: "45 moedas",
          cost: 45,
          tag: null,
          modalTitle: "Boa escolha!",
          modalText:
            "A mochila com LED chama atenção, mas atenção com a durabilidade!",
          villain: false,
          focusPoints: 5,
        },

        {
          id: "choice-3",
          title: "Mochila Estilosa",
          description:
            "Aparência incrível, mas pode não resistir ao uso intenso. E ainda por cima vem com parcelas.",
          price: "80 moedas",
          cost: 96,
          divider:"ou 12x de 8", 
          tag: {
            icon: attention,
            label: "Atenção!",
          },
          modalTitle: "Atenção!",
          modalText:
            "O Parcelix AMA quando alguém escolhe parcelar! Você pagará 16 moedas a mais no total.",
          villain: true,
          focusPoints: 0,
        },
      ],
    },

    {
      choiceHeader: {
        title: "Escolha o seu Fone de ouvido.",
        subtitle: "Cada modelo oferece uma experiência diferente. Pense no quanto você quer investir e lembre que alguns detalhes podem pesar mais no final do que parecem agora.",
      },

      choices: [
        {
          id: "choice-1",
          title: "Fone de ouvido com Fio",
          description: "Modelo tradicional, direto e funcional. Cumpre o papel sem complexidade.",
          price: "20 moedas",
          cost: 20,
          tag: {
            icon: good,
            label: "Custo-benefício",
          },
          modalTitle: "Boa escolha!",
          modalText: "Entrega o básico sem dor de cabeça.",
          villain: false,
          focusPoints: 10,
        },

        {
          id: "choice-2",
          title: "Fone Wireless",
          description: "Leve, moderno e sem fio. A experiência diferenciado para o seu dia a dia.",
          price: "50 moedas",
          cost: 50,
          tag: null,
          modalTitle: "Conveniência top!",
          modalText: "Mais liberdade no dia a dia!",
          villain: false,
          focusPoints: 5,
        },

        {
          id: "choice-3",
          title: "Headphone Gamer",
          description:
            "Design moderno e robusto. Uma escolha que muda a forma de ouvir.",
          price: "90 moedas",
          cost: 100,
          divider:"ou 5x de 20", 
          tag: {
            icon: attention,
            label: "Atenção!",
          },
          modalTitle: "Atenção!",
          modalText:
            "Você está pagando por luxo. Cuidado para não estourar seu orçamento!",
          villain: true,
          focusPoints: 0,
        },
      ],
    },
    {
      choiceHeader: {
        title: "Escolha seu Lanche",
        subtitle: "Hora do intervalo! Decisões doces.... mas o analise o impacto no orçamento.",
      },

      choices: [
        {
          id: "choice-1",
          title: "Combo Natural",
          description: "Lanche natural e um suco fresco. Saudável para te dar energia no próximo tempo! ",
          price: "25 moedas",
          cost: 25,
          tag: {
            icon: good,
            label: "Custo-benefício",
          },
          modalTitle: "Boa escolha!",
          modalText: "Entrega o básico sem dor de cabeça.",
          villain: false,
          focusPoints: 10,
        },

        {
          id: "choice-2",
          title: "Combo Frito",
          description: "Salgado frito e muito gostoso, acompanhado do refrigerante geladinho.",
          price: "40 moedas",
          cost: 40,
          tag: null,
          modalTitle: "Conveniência top!",
          modalText: "Mais liberdade no dia a dia!",
          villain: false,
          focusPoints: 5,
        },

        {
          id: "choice-3",
          title: "Combo MC",
          description:
            "Hamburguer acompanhado de batata frita e com aquele refrigerante GRANDE, para matar a fome. ",
          price: "75 moedas",
          cost: 84,
          divider:"ou 3x de 28", 
          tag: {
            icon: attention,
            label: "Atenção!",
          },
          modalTitle: "Atenção!",
          modalText:
            "Você está pagando por luxo. Cuidado para não estourar seu orçamento!",
          villain: true,
          focusPoints: 0,
        },
      ],
    },
  ];

  // ============================
  // AO CLICAR EM UMA ESCOLHA
  // ============================

  const handleSelect = (choice: any) => {
    if (choice.villain) {
      setShowVillain(true);
      setVillainEntered(true);
      setVillainEffect(true);

      setTimeout(() => {
        setVillainEffect(false);
      }, 2000);
    }

    setModalInfo({
      title: choice.modalTitle,
      text: choice.modalText,
    });

    // Deduzir moedas do orçamento
    if (choice.cost !== undefined) {
      const newCoins = Math.max(0, totalCoins - choice.cost);
      setTotalCoins(newCoins);
      
      // Salvar moedas gastas no backend
      (async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          
          // Buscar o total de moedas gastas atual
          const res = await fetch('/api/me/progress', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          
          const data = await res.json();
          let currentSpent = 0;
          if (data?.success && data.progress?.phases?.Mercadinho) {
            currentSpent = data.progress.phases.Mercadinho.progress?.spentCoins || 0;
          }
          
          // Adicionar o custo da escolha atual
          const newSpent = currentSpent + choice.cost;
          
          await fetch('/api/me/progress', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              phase: 'Mercadinho', 
              progress: { 
                spentCoins: newSpent
              } 
            }),
          });
        } catch (err) {
          console.error('Erro ao salvar moedas gastas:', err);
        }
      })();
    }

    // Salvar pontos de foco da escolha
    if (choice.focusPoints !== undefined) {
      const newFocusPoints = focusPoints + choice.focusPoints;
      setFocusPoints(newFocusPoints);
      
      // Salvar no backend
      (async () => {
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
            body: JSON.stringify({ 
              phase: 'Mercadinho', 
              progress: { 
                focusPoints: newFocusPoints 
              } 
            }),
          });
        } catch (err) {
          console.error('Erro ao salvar pontos de foco:', err);
        }
      })();
    }

    setShowModal(true);
  };

  // ============================
  // FECHAR MODAL → AVANÇAR RODADA
  // ============================

  const handleCloseModal = () => {
    setShowModal(false);
    setShowVillain(false);
    setVillainEntered(false);
    setVillainEffect(false);

    if (currentRound < rounds.length - 1) {
      const next = currentRound + 1;
      setCurrentRound(next);
      // Calcular progresso: cada rodada completa = 33.33% (3 rodadas no total)
      // next representa a rodada que acabou de ser completada (1, 2 ou 3)
      const percent = Math.round((next / rounds.length) * 100);
      setProgressPercent(percent);
      
      // salvar progresso no backend
      (async () => {
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
            body: JSON.stringify({ phase: 'Mercadinho', step_id: next, progress: { percent } }),
          });
        } catch (err) {
          console.warn('Falha ao salvar progresso do mercadinho', err);
        }
      })();
    } else {
      // Última rodada completa = 100%
      setProgressPercent(100);
      (async () => {
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
            body: JSON.stringify({ phase: 'Mercadinho', step_id: rounds.length, progress: { percent: 100, completed: true } }),
          });
        } catch (err) {
          console.warn('Falha ao salvar progresso final do mercadinho', err);
        }
      })();
    }
  };

  // ============================
  // RENDER
  // ============================

  const choices = rounds[currentRound].choices;
  const choiceHeader = rounds[currentRound].choiceHeader;
  
  // Calcular progresso visual baseado na rodada atual (0, 1, 2)
  // Rodada 0 (início) = 0%, após completar rodada 0 = 33%, após rodada 1 = 67%, após rodada 2 = 100%
  const displayProgress = progressPercent || Math.round(((currentRound) / rounds.length) * 100);

  return (
    <div className={`main ${villainEffect ? "villain-mode" : ""}`}>
      {showVillain && (
        <img
          src={Vilain}
          alt="Vilão"
          className={`vilao-img ${villainEntered ? "reveal-half" : ""}`}
        />
      )}

      <Mysidebar />

      <div className="content-area">
        <div className="text">
          <h1>Bem vindo ao Labirinto das Escolhas!</h1>
          <h3>
            Compare os produtos, tome decisões inteligentes e avance com
            sabedoria. Mas fique atento com o Parcelix — ele adora uma
            armadilha!
          </h3>
        </div>

        <div className="wrap-container">
          <div className="left-container">
            <h2>Progresso</h2>
            <CustomProgressBar value={displayProgress} showLabel={true} />
          </div>

          <div className="right-container">
            <div className="orcamento-container">
              <img src={coin} alt="" />
              <div className="orcamento-text">
                <h2 className="h2-1">Orçamento</h2>
                <p>{totalCoins} moedas</p>
              </div>
            </div>

            <div className="focus-container">
              <img className="img-focus" src={focus} alt="" />
              <div className="focus-text">
                <h2 className="h2-2">Foco</h2>
                <p>{focusPoints} {focusPoints === 1 ? 'ponto' : 'pontos'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================ */}
        {/*        ESTE É O BLOCO        */}
        {/*     QUE AGORA É DINÂMICO     */}
        {/* ============================ */}

        <div className="choice">
          <h2>{choiceHeader.title}</h2>
          <p>{choiceHeader.subtitle}</p>
        </div>

        {/* ============================ */}
        {/*     CARDS DINÂMICOS         */}
        {/* ============================ */}

        <div className="bundle-choices">
          {choices.map((choice) => (
            <div
              key={choice.id}
              className={choice.id}
              onClick={() => handleSelect(choice)}
            >
              <h2>{choice.title}</h2>

              {choice.tag && (
                <div className="tags">
                  <span className="tag tag-custo">
                    <img src={choice.tag.icon} />
                    {choice.tag.label}
                  </span>
                </div>
              )}

              <p>{choice.description}</p>

              <div className="total">
                <img src={coin} alt="" />
                <h3>{choice.price}</h3>
                {choice.divider && (
                  <p className="divider">{choice.divider}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="tips">
          {/* usar avatar do usuário se autenticado */}
          <img src={user?.avatar || AvatarN} alt="" />

          <div className="tip-text">
            <h2>Dicas do seu Mentor:</h2>
            <p>
              Antes de decidir, compare custo, durabilidade e valor real.
              Escolhas inteligentes fazem seu orçamento durar!
            </p>
          </div>
        </div>
      </div>

      <Modal open={showModal} onClose={handleCloseModal} title={modalInfo.title}>
        <p>{modalInfo.text}</p>
      </Modal>
    </div>
  );
}

export default Mercadinho;
