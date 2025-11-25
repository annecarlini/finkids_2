import './Battle.css';
import Mysidebar from '@/components/custom/Sidebard/Mysidebar';
import CustomProgressBar from '@/components/custom/OwnprogressBar/GameprogressBar';
import { ShoppingCart } from 'lucide-react';
import { useState } from "react";
import { createPortal } from "react-dom";
import AvatarN from "../../assets/avatar1-a.png";

function Battle() {
    type CartItem = {
        id: number;
        type: string;
        label: string;
        value: number;
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [selectedType, setSelectedType] = useState("");
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");

    const itemNames: Record<number, string> = {
        1: "🥛 Leite", 2: "🍞 Pão", 3: "🍎 Frutas", 4: "🪥 Escova de Dentes", 5: "🧼 Sabonete",
        6: "📒 Caderno", 7: "🚰 Garrafa de água", 8: "🥤 Refrigerante", 9: "🍟 Salgado", 10: "🍬 Balas",
        11: "🪀 Brinquedo", 12: "📚 Álbum de figurinha", 13: "🖊️ Boobie Goods", 14: "📙 Livro",
        15: "🎲 Jogos Educativos", 16: "🎸 Instrumento musical", 17: "🍫 Chocolate", 18: "🎒 Mochila",
        19: "🎨 Kit de artes", 20: "🛼 Patins", 21: "📱 Celular",
    };

    const itemValues: Record<number, number> = {
        1: 12, 2: 8, 3: 10, 4: 6, 5: 5, 6: 15, 7: 7,
        8: 14, 9: 9, 10: 4, 11: 18, 12: 13, 13: 10,
        14: 18, 15: 20, 16: 22,
        17: 8, 18: 40, 19: 16, 20: 45, 21: 120
    };

    const itemTypes: Record<number, string> = {
        1: "essencial", 2: "essencial", 3: "essencial", 4: "essencial", 5: "essencial",
        6: "essencial", 7: "essencial", 8: "superfluo", 9: "superfluo", 10: "superfluo",
        11: "desejo", 12: "desejo", 13: "desejo", 14: "investimento", 15: "investimento",
        16: "investimento", 17: "superfluo", 18: "desejo", 19: "investimento", 20: "desejo",
        21: "desejo",
    };

    const handleCardClick = (cardId: number) => {
        setSelectedCard(cardId);
        setIsModalOpen(true);
    };

    const handleConfirm = () => {
        if (selectedCard === null || !selectedType) return;

        const newItem: CartItem = {
            id: selectedCard,
            type: selectedType,
            label: itemNames[selectedCard] ?? `Item ${selectedCard}`,
            value: itemValues[selectedCard] ?? 0,
        };

        setCartItems(prev => [...prev, newItem]);
        setIsModalOpen(false);
        setSelectedType("");
        setSelectedCard(null);
    };

    const totalGasto = cartItems.reduce((sum, item) => sum + item.value, 0);
    const economia = 100 - totalGasto;

    const countEssencial = cartItems.filter(item => item.type === "essencial").length;
    const countDesejo = cartItems.filter(item => item.type === "desejo").length;
    const countInvestimento = cartItems.filter(item => item.type === "investimento").length;
    const economiaOk = economia >= 20;

    const handleFinalizarCarrinho = () => {
        const requisitosCumpridos = countEssencial >= 2 && countDesejo >= 1 && countInvestimento >= 1 && economiaOk;

        if (!requisitosCumpridos) {
            setFeedbackMessage("Você ainda não cumpriu todos os requisitos. Complete-os antes de finalizar!");
            setShowFeedbackModal(true);
            return;
        }

        let feedback = "Confira seu carrinho:\n";
        cartItems.forEach(item => {
            const correto = item.type === itemTypes[item.id] ? "✅ Correto" : "❌ Incorreto";
            feedback += `${item.label} - Tipo declarado: ${item.type}, Tipo real: ${itemTypes[item.id]} -> ${correto}\n`;
        });

        feedback += `\nEconomia final: ${economia} moedas`;
        setFeedbackMessage(feedback);
        setShowFeedbackModal(true);
    };

    const handleResetCart = () => {
        setCartItems([]);
        setSelectedCard(null);
        setSelectedType("");
    };

    return (
        <div className="main-2">
            <Mysidebar />
            <div className="main-area">
                <h1>Missão: Carrinho Inteligente</h1>
                <h3>Seu poder está nas escolhas. Decida com sabedoria e maximize sua economia.</h3>

                <div className="main-content">
                    <div className="block-1">
                        <h2>Orçamento:</h2>
                        <p>Moedas Totais</p>
                        <h3>100</h3>
                    </div>

                    <div className="block-2">
                        <h2>Gastou</h2>
                        <h3>{totalGasto}</h3>
                        <div className="progress-bar">
                            <CustomProgressBar value={totalGasto} showLabel={false} />
                        </div>
                    </div>

                    <div className="block-3">
                        <h2>Economiza</h2>
                        <p>Meta: acima de 40 moedas</p>
                        <h3>{economia}</h3>
                    </div>
                </div>

                <div className="second-area">
                    <div className="area-choice">
                        {Object.entries(itemNames).map(([id, label]) => (
                            <div
                                key={id}
                                className={`select-${id}`}
                                onClick={() => handleCardClick(Number(id))}
                            >
                                <h4>{label}</h4>
                                <p>{itemValues[Number(id)]} moedas</p>
                            </div>
                        ))}
                    </div>

                    <div className="cart">
                        <div className="cart-title">
                            <p>Seu carrinho</p>
                            <ShoppingCart style={{ cursor: 'pointer' }} onClick={handleResetCart} />
                        </div>

                        <div className="cart-items-inline">
                            {cartItems.length === 0 ? (
                                <p className="empty-cart">Nenhum item selecionado ainda.</p>
                            ) : (
                                cartItems.map((item, i) => (
                                    <div key={i} className="cart-item">
                                        <span className={`tag-${item.type}`}>{item.type}</span>
                                        <span className="cart-item-label">{item.label}</span>
                                        <span className="cart-item-value">{item.value} moedas</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="total-gasto">
                            <p>Total gasto:</p>
                            <p>{totalGasto} moedas</p>
                        </div>

                        <div className="economia">
                            <p>Economizando:</p>
                            <p className='total'><strong>{economia} moedas</strong></p>
                        </div>

                        <div className="btn">
                            <button onClick={handleFinalizarCarrinho}>Finalizar carrinho</button>
                        </div>

                        <div className="req">
                            <h3 className="req-title">Requisitos:</h3>
                            <div className="req-list">
                                <p>2 ou mais itens essenciais {countEssencial >= 2 ? "✅" : "⚪"}</p>
                                <p>1 desejo {countDesejo >= 1 ? "✅" : "⚪"}</p>
                                <p>1 investimento {countInvestimento >= 1 ? "✅" : "⚪"}</p>
                                <p>Economizar 20 moedas {economiaOk ? "✅" : "⚪"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de seleção de tipo */}
                {isModalOpen && createPortal(
                    <div className="modal-overlay">
                        <div className="modal-box">
                            <h2>Qual tipo de compra é este item?</h2>
                            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                <option value="">Selecione...</option>
                                <option value="essencial">Essencial</option>
                                <option value="desejo">Desejo</option>
                                <option value="superfluo">Supérfluo</option>
                                <option value="investimento">Investimento</option>
                            </select>
                            <div className="modal-buttons">
                                <button onClick={handleConfirm} className="btn-confirm">Confirmar</button>
                                <button onClick={() => setIsModalOpen(false)} className="btn-cancel">Cancelar</button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Modal de feedback */}
                {showFeedbackModal && createPortal(
                    <div className="feedback-modal-overlay">
                        <div className="feedback-modal-box">
                            <div className="feedback-header">
                                <img src={AvatarN} alt="Avatar do jogador" className="feedback-avatar"/>
                                <h2>Feedback da Missão</h2>
                            </div>
                            <div className="feedback-body">
                                <pre>{feedbackMessage}</pre>
                            </div>
                            <button onClick={() => setShowFeedbackModal(false)} className="btn-confirm">Fechar</button>
                        </div>
                    </div>,
                    document.body
                )}

            </div>
        </div>
    );
}

export default Battle;
