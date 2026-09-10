export type Pet = {
  id: string;
  name: string;
  species: string;
  emoji: string;
  level: number;
  mood: string;
  hunger: number;
};

export const pets: Pet[] = [
  {
    id: "ten",
    name: "てん",
    species: "ひよこ",
    emoji: "🐥",
    level: 3,
    mood: "ごきげん",
    hunger: 80,
  },
  {
    id: "mochi",
    name: "もち",
    species: "うさぎ",
    emoji: "🐰",
    level: 5,
    mood: "ねむい",
    hunger: 45,
  },
  {
    id: "koro",
    name: "ころ",
    species: "いぬ",
    emoji: "🐶",
    level: 2,
    mood: "おなかすいた",
    hunger: 20,
  },
];

export function getPetById(id: string): Pet | undefined {
  return pets.find((pet) => pet.id === id);
}
