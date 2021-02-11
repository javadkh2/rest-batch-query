const profiles = {
  1: { id: 1, name: "Ivo", lastName: "Wijnker", blogId: 3 },
  2: { id: 2, name: "Hossein", lastName: "Bababie", blogId: 1 },
  3: { id: 3, name: "Javad", lastName: "Khalilian", blogId: 2 },
  4: { id: 4, name: "Stafan", lastName: "Mirck", blogId: 2 },
};

const blogs = {
  1: {
    id: 1,
    title: "Hossein's Blog",
    articles: [1, 2],
    images: ["1.jpg", "2.jpg"],
  },
  2: { id: 2, title: "Graydon", articles: [3], images: ["3.jpg"] },
  3: { id: 3, title: "Ivo's nots", articles: [4], images: ["4.jpg", "5.jpg"] },
};

const articles = {
  1: { id: 1, title: "Typescript", content: "its awesome" },
  2: { id: 2, title: "Front end security check list", content: "some content" },
  3: {
    id: 3,
    title: "How we generate company network graph",
    content: "with d3",
  },
  4: {
    id: 4,
    title: "Ivo script",
    content: "the best programing language ever",
  },
};

module.exports = { profiles, blogs, articles };
