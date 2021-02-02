import request from "../../request";
import Article from "./Article";

export default function Blog({ id }) {
  const [blog] = request(Blog.fetchQuery({ id }));

  return (
    <div>
      <h2>Blog</h2>
      <h3>{blog.title}</h3>
      {Array.isArray(blog.images) &&
        blog.images.map((img) => (
          <img src={`/imgs/${img}`} alt={`${blog.title}'`} />
        ))}
      {blog.articles.map((articleId) => (
        <Article key={articleId} id={articleId} />
      ))}
    </div>
  );
}

// TODO: convert it to a composable general approach that supports REST/GraphGL or ...
Blog.fetchQuery = ({ id }) => [
  {
    path: `/blog/${id}`,
    children: [...Article.fetchQuery({ id: "<articles>" })],
    assets: [`/imgs/<images>.png`],
  },
];
// TODO: check the possibility of this API
// even we can replace this code with another code in build time
function fetchQuery({ id }) {
  return [
    fetch(`/blog/${id}`).then(({ articles, images }) => [
      Article.fetchQuery({ id: articles }),
      prep(`/imgs/${images}.png`),
    ]),
  ];
}

