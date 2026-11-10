import "./Card.css";

function Card({ titulo, valor, descricao, badge, variante }) {
  return (
    <div className={`ds-stat-card ${variante ? `stat-${variante}` : ""}`}>
      <div className="stat-card-top">
        <span className="ds-stat-label">{titulo}</span>
        {badge && <span className="stat-mini-badge">{badge}</span>}
      </div>
      <div className="ds-stat-value">{valor}</div>
      {descricao && <div className="ds-stat-desc">{descricao}</div>}
    </div>
  );
}

export default Card;
