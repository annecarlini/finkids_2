import "./Init.css"
import Mysidebar from "../../components/custom/Sidebard/Mysidebar"
import AvatarN from '../../assets/avatar1-a.png';
import AvatarL from '../../assets/avatar4-a.png';
import AvatarD from '../../assets/avatar2.png';
import AvatarG from '../../assets/avatar4.png';
import { useState } from "react";

function Init() {
  const [activateAvatar, setActivateAvatar] = useState<string | null>(null);

  const avatars = [
    { name: "Capitão Economix", img: AvatarN },
    { name: "Super Poupança", img: AvatarG },
    { name: "Super Controle", img: AvatarD },
    { name: "Super Investidora", img: AvatarL },
  ];

  return (
    <div className="init-page">
      <Mysidebar />

      <div className="first">
        <div className="main-introduction">
          <div className="introduction">
            <h1>Bem vindo, *AQUI VAI O NOME DE QUEM LOGAR*</h1>
          </div>

          <div className="choose-avatar">
            <h2>Escolha seu Super-Herói!</h2>
            <p>A missão começa agora: Aprenda, evolua e vença os desafios do dinheiro!</p>
          </div>
        </div>

        {/* CARDS */}
        <div className="card">
          {avatars.map((item) => (
            <div
              key={item.name}
              className={`content-card ${activateAvatar === item.name ? "selected" : ""}`}
              onClick={() => setActivateAvatar(item.name)}
            >
              <h3>{item.name}</h3>
              <div className="images">
                <img src={item.img} alt={item.name} />
              </div>
            </div>
          ))}
        </div>

        {/* BOTÃO DE CONTINUAR */}
        {activateAvatar && (
          <button className="continue-btn">
            Avançar
          </button>
        )}
      </div>
    </div>
  );
}

export default Init;
