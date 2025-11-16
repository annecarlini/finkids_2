/* rfce cria o componete react funcional ---- ES7 */
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import AvatarFrontpage from '../../assets/squad1.png';
import './Homepage.css' /* Importando CSS */
import Navbar from '@/components/custom/Navbar/Navbar';
import Footer from '../Footer/Footer'
import vilan from '../../assets/pigvilan.png'
import badge1 from '../../assets/card-1.png'
import badge2 from '../../assets/card-2.png'
import badge3 from '../../assets/card-3.png'
import badge4 from '../../assets/card-4.png'
import badge5 from '../../assets/card-5.png'
import badge6 from '../../assets/win-badge-1.png'
// import bgAudio from '../../audio/backgroud-music.mp3'


function Homepage() {

  {/* essa const é pra scrollar a página para onde quero */}
  const instructionRef = useRef<HTMLDivElement | null>(null);
  const handleScrollToInstructions = () => {
    instructionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  {/* Aqui é para clicar no botão e ir para página de login */}
  const navigate = useNavigate();
  const goToLogin =() => {
    navigate('/login');
  };



  return (
    <>
      {/* <audio autoPlay loop>
        <source src={bgAudio} type='audio/mpeg'/>
      </audio>
     */}
      <div className="home">
        <Navbar />
    
        <img src={vilan} alt="vilan" className="vilan" />

        {/* Container para alinhar texto e imagem lado a lado */}
        <div className="home_content">

        
            <div className="home_subtitle">
              <h1>
                Aprender sobre dinheiro nunca foi tão épico!
              </h1>
              <h2>
                Aqui na <strong>FinHero!</strong> cada decisão te aproxima de derrotar o vilão das finanças: o Desperdício — aquele que tenta roubar suas moedas, bagunçar seu orçamento e atrasar sua evolução.
              </h2>
              <div className="btns">
                <button className='btn1' onClick={goToLogin}>Começar aventura</button> {/* linkar para login */}
                <button className='btn2' onClick={handleScrollToInstructions}>Como funciona?</button> {/* scrollar a página */}
              </div>
            </div>

          <div className="img_frontpage">
            <img src={AvatarFrontpage} alt="Avatar Frontpage" />
          </div>

        </div>

        <div className="card-tittle" ref={instructionRef}>
            <h2>Passo a passo da missão</h2>
        </div>



        <div className="instruction">
          <div className="card1">
            <h3>Cadastro simplificado </h3>
            <img src={badge1} alt="" />
            <p>Crie sua conta em segundo se prepara-se para o desafio.</p>
          </div>

          <div className="card2">
            <h3>Escolha seu Super Herói</h3>
            <img src={badge2} alt="" />
            <p>Selecione o avatar que vai te acompanhar ao longo da sua jornada!</p> 
          </div>

          <div className="card3">
            <h3>Aprenda conceitos</h3>
            <img src={badge3} alt="" />
            <p>Um Quiz em 5 fases que te ensina os conceitos básicos da educação financeira.</p>
          </div>

          <div className="card4">
            <h3>Ganhe moedas e evolua</h3>
            <img src={badge4} alt="" />
            <p>Acumule moedas durante o aprendizado e acompanhe seu progresso até virar um mestre!</p>
          </div>
        
          <div className="card5">
            <h3>Aplique seu conhecimento jogando</h3>
            <img src={badge5} alt="" />
            <p>Continue seu aprendizado aplicando os conceitos sobre dinheiro em situações similares a realidade. </p>
          </div>

          <div className="card6">
            <h3>Ganhe sua badge</h3>
            <img src={badge6} alt="" />
            <p>Complete todos os desafios, vença o inimigo e estampe sua badge.</p>
          </div>        
        </div> 

        <Footer />
      </div>
    </>
  );
}

export default Homepage;
