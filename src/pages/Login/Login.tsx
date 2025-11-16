import "./Login.css"
import { Logincard } from "@/components/custom/Login/Logincard";
import { ButtonLink } from "@/components/custom/Buttonlink/buttonlink";

function Login() {
  return (
    <div className="login-page">

        <div className="back-card">
            <h1>Ative Seu Poder Financeiro!</h1>
            <p>Entre na missão, acesse seu perfil e avance rumo a uma vida financeira invencível!</p>
              <Logincard className="login-card-custom"/>
              <ButtonLink />
        </div>    
            
    </div>
  )
}

export default Login