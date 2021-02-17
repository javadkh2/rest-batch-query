import styled from "styled-components";
import request from "../../../request";
import { fetch, asset, query } from "../../../request/dana";

const Wrapper = styled.div`
  padding: 10px;
  background: #aabfb1;
  margin: 5px;
`;

export default function Article({ id }) {
  const [article] = request(Article.fetchQuery({ id }));
  return (
    <Wrapper>
      <h3>Article</h3>
      <h3>{article.title}</h3>
      {/* <img src={`/assets/imgs/article/${id}.jpg`} alt={`${article.title}`} /> */}
      <p>{article.content}</p>
    </Wrapper>
  );
}

Article.fetchQuery = query(({ id }) => [
  fetch(`/api/article/${id}`),
  asset(`/assets/imgs/article/${id}.jpg`),
]);
