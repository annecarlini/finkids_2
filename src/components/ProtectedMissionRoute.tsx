import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedMissionRouteProps {
  children: React.ReactNode;
  requiredCoins?: number;
}

const REQUIRED_COINS = 200;

export function ProtectedMissionRoute({ 
  children, 
  requiredCoins = REQUIRED_COINS 
}: ProtectedMissionRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCoins = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
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
          navigate('/phase');
          return;
        }

        const data = await res.json();
        
        if (data?.success && data.progress?.phases) {
          let total = 0;
          Object.values(data.progress.phases).forEach((phase: any) => {
            if (phase.progress?.coins) {
              total += phase.progress.coins;
            }
          });
          
          setCurrentCoins(total);
          
          if (total >= requiredCoins) {
            setHasAccess(true);
          } else {
            setHasAccess(false);
          }
        } else {
          navigate('/phase');
        }
      } catch (error) {
        console.error('Erro ao verificar moedas:', error);
        navigate('/phase');
      } finally {
        setIsChecking(false);
      }
    };

    checkCoins();
  }, [navigate, requiredCoins]);

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '1.2em'
      }}>
        Verificando moedas...
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Poppins, sans-serif',
        backgroundColor: '#f6e9da',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ 
            color: '#E97E34', 
            fontSize: '1.8rem',
            marginBottom: '1rem'
          }}>
            Missão Bloqueada!
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#666',
            marginBottom: '0.5rem'
          }}>
            Você precisa de <strong style={{ color: '#E97E34' }}>{requiredCoins} moedas</strong> para acessar as missões.
          </p>
          <p style={{ 
            fontSize: '1.3rem', 
            color: '#333',
            marginBottom: '1.5rem',
            fontWeight: 'bold'
          }}>
            Você tem {currentCoins} moedas 💰
          </p>
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#888',
            marginBottom: '2rem'
          }}>
            Complete mais fases para ganhar moedas e desbloquear!
          </p>
          <button 
            onClick={() => navigate('/phase')}
            style={{
              backgroundColor: '#E97E34',
              color: 'white',
              padding: '0.8rem 2rem',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#cf6b2a'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E97E34'}
          >
            Voltar para Fases
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
