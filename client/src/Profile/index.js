import request from "../request";
import Blog from "./Blog";

export default function Profile({ id }) {
  const [user] = request(Profile.fetchQuery({ id }));

  return (
    <div>
      <h2>Profile</h2>
      <h3>{user.name}</h3>
      <p>{user.username}</p>
      <img src={`/avatar/${user.id}.png`} alt={`${user.name}'s profile pic`} />
      <Blog id={user.blogId} />
    </div>
  );
}

// TODO: convert it to a composable general approach that supports REST/GraphGL or ...
Profile.fetchQuery = ({ id }) => [
  {
    path: `/profile/${id}`,
    children: [...Blog.fetchQuery({ id: "<blogId>" })],
    assets: [`/avatar/${id}.png`],
  },
];

