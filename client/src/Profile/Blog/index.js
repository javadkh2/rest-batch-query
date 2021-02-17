import request from "../../request";
import Article from "./Article";
import { fetch, asset, query } from "../../request/dana";
import { Suspense } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  padding: 10px;
  background: #ffdede;
  margin: 5px;
`;

export default function Blog({ id }) {
  const [blog] = request(Blog.fetchQuery({ id }));

  return (
    <Wrapper>
      <h2>Blog</h2>
      <h3>{blog.title}</h3>
      {/* {Array.isArray(blog.images) &&
        blog.images.map((img) => (
          <img key={img} src={`/assets/imgs/${img}`} alt={`${blog.title}'`} />
        ))} */}
      {blog.articles.map((articleId) => (
        <div key={articleId}>
          <Suspense fallback={`Loading Article ${articleId}`}>
            <Article id={articleId} />
          </Suspense>
        </div>
      ))}
    </Wrapper>
  );
}

// TODO: convert it to a composable general approach that supports REST/GraphGL or ...
// TODO: check the possibility of this API
// even we can replace this code with another code in build time

Blog.fetchQuery = query(({ id }) =>
  fetch(`/api/blog/${id}`).then((prop) => [
    Article.fetchQuery({ id: prop("articles") }),
    asset(`/assets/imgs/${prop("images")}`),
  ])
);
