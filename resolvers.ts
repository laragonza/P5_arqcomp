import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";

// Definición de tipos para GraphQL
export const typeDefs = `#graphql
type Ability {
  name: String!
  effect: String!
}

type Move {
  name: String!
  power: String!
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

// Base URL de PokeAPI
const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";

// Resolvers para procesar las consultas
export const resolvers = {
  Query: {
    pokemon: async (_: unknown, args: { id?: string; name?: string }) => {
      const identifier = args.id || args.name;

      if (!identifier) {
        throw new GraphQLError("Debes proporcionar un ID o un nombre.");
      }

      const normalizedIdentifier = String(identifier).trim().toLowerCase();
      const url = BASE_URL + normalizedIdentifier;

      const response = await fetch(url);
      if (!response.ok) {
        throw new GraphQLError('No se encontró el Pokémon}');
      }

      const data = await response.json();

      return {
        id: data.id,
        name: data.name,
        abilities: data.abilities,
        moves: data.moves,
      };
    },
  },
  Pokemon: {
    abilities: async (parent: any) => {
      const abilityPromises = parent.abilities.map(async (a: any) => {
        const abilityResponse = await fetch(a.ability.url);
        const abilityData = await abilityResponse.json();

        const effectEntry = abilityData.effect_entries.find(
          (entry: any) => entry.language.name === "en"
        );

        return {
          name: a.ability.name,
          effect: effectEntry ? effectEntry.effect : "Efecto no disponible",
        };
      });

      return Promise.all(abilityPromises);
    },
    moves: async (parent: any) => {
      const movePromises = parent.moves.slice(0, 5).map(async (m: any) => {
        const moveResponse = await fetch(m.move.url);
        const moveData = await moveResponse.json();

        return {
          name: m.move.name,
          power: moveData.power !== null ? moveData.power.toString() : "No disponible",
        };
      });

      return Promise.all(movePromises);
    },
  },
};

// Creación y configuración del servidor Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 8000 },
});

console.info('Servidor GraphQL listo en: puerto 8000');