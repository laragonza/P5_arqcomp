export const typeDefs = `#graphql
type Ability {
  name: String!
}

type Move {
  name: String!
}

type Pokemon {
  id: ID!
  name: String!
  abilities: [Ability!]!
  moves: [Move!]!
}

type Query {
  pokemon(id: ID, name: String): Pokemon
}
`;