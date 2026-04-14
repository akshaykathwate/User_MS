import { MdWarning, MdClose } from 'react-icons/md';

const ConfirmModal = ({ title, message, confirmText, confirmClass = 'btn-danger', onConfirm, onClose }) => {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdWarning color="var(--color-danger)" /> {title}
          </h2>
          <button className="modal-close" onClick={onClose}><MdClose size={20} /></button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button id="confirm-action-btn" className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
