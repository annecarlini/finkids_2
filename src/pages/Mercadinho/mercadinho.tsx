import './mercadinho.css'
import Mysidebar from "../../components/custom/Sidebard/Mysidebar"
import CustomProgressBar from '@/components/custom/OwnprogressBar/GameprogressBar'
import coin from '../../assets/Logotipo.png'
import focus from '../../assets/logotipo-focus.png'
import AvatarN from '../../assets/avatar1-a.png';
import good from '../../assets/tags-good.png'
import attention from '../../assets/tags-attention.png'
import { useState } from "react"
import Modal from '../../components/custom/Modal/Modal'
import Vilain from '../../assets/pigvilan.png'

function mercadinho() {
  
  const [showModal, setShowModal] = useState(false);
  const [villainEffect, setVillainEffect] = useState(false);
  const [showVillain, setShowVillain] = useState(false);
  const [villainEntered, setVillainEntered] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); 
  const [modalTitle, setModalTitle] = useState("");

  const handleChoice3 = () => {
    setVillainEffect(true);
    setShowVillain(true);

    setTimeout(() => {
      setShowModal(true);
    }, 800);

    setTimeout(() => {
      setVillainEffect(false);
      setShowVillain(false);
    }, 20000);
  };

  const handleCloseModal = () => {
    setShowModal(false);      // fecha o modal
    setShowVillain(false);    // animação do vilão some
    setVillainEntered(false); // vilão desaparece da tela
  };



  return (
    <div className={`main ${villainEffect ? "villain-mode" : ""}`}>
      {showVillain && (
      <img 
        src={Vilain} 
        alt="Vilão"
        className={`vilao-img ${showVillain ? "reveal-half" : ""}`}
      />
    )}
      <Mysidebar />


      <div className="content-area">

        <div className="text">
          <h1>Bem vindo ao Labirinto das Escolhas!</h1>
          <h3>Compare os produtos, tome decisões inteligentes e avance com sabedoria. Mas fique atento com o Parcelix. Está cheio de armadilhas para te fazer gastar mais do que precisa!</h3>
        </div>

        <div className="wrap-container">

          <div className="left-container">
            <h2>Progresso</h2>  
            <CustomProgressBar value={50} showLabel={true}/>
            
          </div>
          <div className="right-container">
            <div className="orcamento-container">
              <img src={coin} alt="" />
              <div className="orcamento-text">
                <h2 className='h2-1'>Orçamento</h2>
                <p>Pontos+</p>
              </div>
            </div>

            <div className="focus-container">
              <img className="img-focus" src={focus} alt="" />
              <div className="focus-text"> 
                <h2 className='h2-2'>Foco</h2>
                <p>Pontos+</p>
              </div>
            </div>
          </div>
        </div>

        <div className="choice">
          <h2>É horade escolhar uma nova mochila para iniciar o ano escolar.</h2>
          <p>Você tem [x] moedas. Escolha um [item] e economize.</p>
        </div>


        <div className="bundle-choices">

          <div className="choice-1" onClick={() => {
            setModalTitle(""); // sem título
            setModalMessage("Essa mochila simples é resistente e econômica! Boa escolha para quem quer durar mais e gastar menos.");
            setShowModal(true);
          }}>

            <h2>Mochila Simples</h2>
            <div className="tags">
              <span className="tag tag-custo">
                <img src={good} alt="Ícone bom negócio" />
                 Custo-benefício
              </span>
            </div>
            <p>Resistente, leve e com ótimo custo-benefício. Ideal para quem prioriza durabilidade. Garantia comleta de 1 ano.</p>
            <div className="total">
              <img src={coin} alt="" />
              <h3>25 moedas</h3>
              
            </div>
            
          </div>

          <div className="choice-2" onClick={() => {
            setModalTitle(""); // sem título
            setModalMessage("Mochila com LED chama atenção, mas cuidado: o LED pode desgastar rápido e não possui garantia.");
            setShowModal(true);
          }}>

            <h2>Mochila com LED</h2>
            <p>Chamativa e perfeita para destacar. O LED pode desgastar rápido e não possui garantia para a iluminação.</p>
            <div className="total">
              <img src={coin} alt="" />
              <h3>45 moedas</h3>
            </div>
          </div>

          <div className="choice-3" onClick={() => {
            setShowVillain(true);
            setVillainEntered(true);
            setModalTitle("Atenção!"); 
            setModalMessage("Essa mochila parece estilosa, mas o Parcelix ama quando alguém cai nessa armadilha. Ela pode pesar no seu orçamento.");
            setShowModal(true);
          }}>
            <h2>Mochila Estilosa</h2>
            <div className="tags">
              <span className="tag tag-custo">
                <img src={attention} alt="Ícone bom negócio" />
                 Atenção!
              </span>
            </div>
          
            <p>Visual superatrativo e cheia de detalhes. Pode não resistir ao uso intenso e tende a desgastar mais rápdido
            
            </p>
  
            <div className="total">
              <img src={coin} alt="" />
              <h3>80 moedas.</h3>
            </div>
            <p className='p-2'>Apenas 12x de 8 moedas!!</p>
        </div>
        </div>


        <div className="tips">
  
          <img src={AvatarN } alt="" />
          
          <div className="tip-text">
            <h2>Dicas do seu Mentor:</h2>
            <p>Ei, antes de bater o martelo, dá uma olhadinha nos pontinhos de qualidade. Eles costumam revelar detalhes que passam despercebidos. Escolhas espertas começam por aí.</p>
          </div>
        </div>


    </div>    

    <Modal 
      open={showModal}
      onClose={handleCloseModal}
      title={modalTitle}
      >
      <p>{modalMessage}</p>
    </Modal>
    </div>
    
  )
}

export default mercadinho
