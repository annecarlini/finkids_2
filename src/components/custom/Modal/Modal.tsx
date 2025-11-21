import React from "react";
import "./Modal.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {title && <h2>{title}</h2>}
        <div className="modal-body">{children}</div>
        <button className="modal-btn" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}


export default Modal;
