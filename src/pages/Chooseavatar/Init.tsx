import "./Init.css"
import Mysidebar from "../../components/custom/Sidebard/Mysidebar"
import AvatarN from '../../assets/avatar1-a.png';
import AvatarL from '../../assets/avatar4-a.png';
import AvatarD from '../../assets/avatar2.png';
import AvatarG from '../../assets/avatar4.png';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type AvatarItem = {
  id: number;
  nome: string;
  img: string;
}

function Init() {
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Pegar nome do usuário do localStorage
  const rawUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const storedUser = rawUser ? JSON.parse(rawUser) : null;
  const userName = storedUser ? (storedUser.name || storedUser.nome) : null;

  // Avatares locais com IDs do backend
  const avatars: AvatarItem[] = [
    { id: 1, nome: "Capitão Economix", img: AvatarN },
    { id: 2, nome: "Super Poupança", img: AvatarG },
    { id: 3, nome: "Super Controle", img: AvatarD },
    { id: 4, nome: "Super Investidora", img: AvatarL },
  ];

  const handleConfirm = async () => {
    if (!selectedAvatarId) return;
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    setLoading(true);
    try {
      const res = await fetch('/api/avatars/choose', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ avatar_id: selectedAvatarId })
      });
      
      // Tratar erro 429 (Too Many Requests)
      if (res.status === 429) {
        alert('Muitas requisições. Aguarde um momento e tente novamente.');
        return;
      }
      
      // Verificar se a resposta é JSON antes de tentar parsear
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Resposta não é JSON:', await res.text());
        alert('Erro no servidor. Tente novamente.');
        return;
      }
      
      const data = await res.json();
      if (data && data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/phase');
      } else {
        console.error('Escolha de avatar falhou', data);
        if (res.status === 401) {
          
          alert('Sessão expirada. Faça login novamente.');
          navigate('/login');
        } else {
          alert(data.message || 'Não foi possível escolher o avatar');
        }
      }
    } catch (err) {
      console.error('Erro ao escolher avatar', err);
      alert('Erro ao escolher avatar. Veja o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="init-page">
      <Mysidebar />

      <div className="first">
        <div className="main-introduction">
          <div className="introduction">
            <h1>Bem vindo{userName ? `, ${userName}` : ''}!</h1>
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
              key={item.id}
              className={`content-card ${selectedAvatarId === item.id ? "selected" : ""}`}
              onClick={() => setSelectedAvatarId(item.id)}
            >
              <h3>{item.nome}</h3>
              <div className="images">
                <img src={item.img} alt={item.nome} />
              </div>
            </div>
          ))}
        </div>

        {/* BOTÃO DE CONTINUAR */}
        {selectedAvatarId && (
          <button className="continue-btn" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Salvando...' : 'Avançar'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Init;