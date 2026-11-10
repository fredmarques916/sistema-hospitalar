import "./Card.css";

function Card({ titulo, valor, descricao }) {
  return (
    <div className="card">
      <span>{titulo}</span>
      <h2>{valor}</h2>
      <p>{descricao}</p>
    </div>
  );
}

export default Card;