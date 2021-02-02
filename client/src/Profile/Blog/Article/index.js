import request from "../../../request";

export default function Article({ id }) {
  const [article] = request(Article.fetchQuery({ id }));
  return (
    <div>
      <h3>Article</h3>
      <h3>{article.title}</h3>
      <img src={`/imgs/article/${id}.jpg`} alt={`${article.title}`} />
      <p>{article.description}</p>
    </div>
  );
}

Article.fetchQuery = ({ id }) => [
  {
    path: `/article/${id}`,
    assets: [`/imgs/article/${id}.jpg`],
  },
];
