import request from "../request";
import Blog from "./Blog";
import { fetch, asset, query } from "../request/dana";
import { Suspense } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  padding: 10px;
  background: #def9ff;
  margin: 5px;
`;

export default function Profile({ id }) {
  const [user] = request(Profile.fetchQuery({ id }));

  return (
    <Wrapper>
      <h2>Profile</h2>
      <h3>{user.name}</h3>
      <p>{user.username}</p>
      <img
        src={`/assets/avatar/${user.id}.png`}
        alt={`${user.name}'s profile pic`}
      />
      <Suspense fallback="Loading Blog">
        <Blog id={user.blogId} />
      </Suspense>
    </Wrapper>
  );
}

// TODO: convert it to a composable general approach that supports REST/GraphGL or ...
Profile.fetchQuery = ({ id }) => [
  {
    path: `/api/profile/${id}`,
    children: [...Blog.fetchQuery({ id: "<blogId>" })],
  },
  {
    asset: `/assets/avatar/${id}.png`,
  },

];

Profile.fetchQuery2 = ({ id }) => [
  fetch(`/profile/${id}`).then((prop) =>
    Blog.fetchQuery2({ id: prop("blogId") })
  ),
  asset(`/avatar/${id}.png`),
];

Profile.fetchQuery3 = query(({ id }) => [
  fetch(`/profile/${id}`).then((prop) =>
    Blog.fetchQuery3({ id: prop("blogId") })
  ),
  asset(`/avatar/${id}.png`),
]);
