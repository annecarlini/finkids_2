import './Navbar.css'
import Logotipo from '../../../assets/Logotipo.png'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <div className='main-navbar'>
    <div className="imagem">
        <img src={Logotipo} alt="Logotipo" />
    </div>

    <div className="titles">
        
        <Link to="about" className='subtitle'>Sobre o projeto</Link>
        <Link to="Login" className='subtitle'>Login</Link>
        
    </div>
</div>

  )
}

export default Navbar