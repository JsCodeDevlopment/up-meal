export interface Food {
  id: string
  name: string
  category: string
  calories: number // per 100g
  protein: number // per 100g
  carbs: number // per 100g
  fat: number // per 100g
  fiber: number // per 100g
  unit: string // g, ml, unidade
  commonServing: number // tamanho da porção comum
}

export const foodDatabase: Food[] = [
  // Proteínas
  {
    id: "chicken_breast",
    name: "Peito de frango",
    category: "proteina",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    unit: "g",
    commonServing: 120,
  },
  {
    id: "salmon",
    name: "Salmão",
    category: "proteina",
    calories: 208,
    protein: 22,
    carbs: 0,
    fat: 13,
    fiber: 0,
    unit: "g",
    commonServing: 100,
  },
  {
    id: "eggs",
    name: "Ovos",
    category: "proteina",
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    unit: "unidade",
    commonServing: 2,
  },
  {
    id: "lean_beef",
    name: "Carne bovina magra",
    category: "proteina",
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 15,
    fiber: 0,
    unit: "g",
    commonServing: 100,
  },
  {
    id: "tuna",
    name: "Atum",
    category: "proteina",
    calories: 144,
    protein: 30,
    carbs: 0,
    fat: 1,
    fiber: 0,
    unit: "g",
    commonServing: 80,
  },

  // Carboidratos
  {
    id: "brown_rice",
    name: "Arroz integral",
    category: "carboidrato",
    calories: 123,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    unit: "g",
    commonServing: 150,
  },
  {
    id: "sweet_potato",
    name: "Batata doce",
    category: "carboidrato",
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    fiber: 3,
    unit: "g",
    commonServing: 200,
  },
  {
    id: "oats",
    name: "Aveia",
    category: "carboidrato",
    calories: 389,
    protein: 17,
    carbs: 66,
    fat: 7,
    fiber: 10,
    unit: "g",
    commonServing: 40,
  },
  {
    id: "banana",
    name: "Banana",
    category: "carboidrato",
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    unit: "unidade",
    commonServing: 1,
  },
  {
    id: "whole_bread",
    name: "Pão integral",
    category: "carboidrato",
    calories: 247,
    protein: 13,
    carbs: 41,
    fat: 4.2,
    fiber: 7,
    unit: "fatia",
    commonServing: 2,
  },

  // Gorduras saudáveis
  {
    id: "avocado",
    name: "Abacate",
    category: "gordura",
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    fiber: 7,
    unit: "g",
    commonServing: 100,
  },
  {
    id: "olive_oil",
    name: "Azeite de oliva",
    category: "gordura",
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    unit: "ml",
    commonServing: 10,
  },
  {
    id: "almonds",
    name: "Amêndoas",
    category: "gordura",
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    fiber: 12,
    unit: "g",
    commonServing: 30,
  },
  {
    id: "peanut_butter",
    name: "Pasta de amendoim",
    category: "gordura",
    calories: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
    fiber: 8,
    unit: "g",
    commonServing: 20,
  },

  // Vegetais
  {
    id: "broccoli",
    name: "Brócolis",
    category: "vegetal",
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    unit: "g",
    commonServing: 150,
  },
  {
    id: "spinach",
    name: "Espinafre",
    category: "vegetal",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    unit: "g",
    commonServing: 100,
  },
  {
    id: "tomato",
    name: "Tomate",
    category: "vegetal",
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    unit: "g",
    commonServing: 150,
  },
  {
    id: "lettuce",
    name: "Alface",
    category: "vegetal",
    calories: 15,
    protein: 1.4,
    carbs: 2.9,
    fat: 0.2,
    fiber: 1.3,
    unit: "g",
    commonServing: 80,
  },

  // Laticínios
  {
    id: "greek_yogurt",
    name: "Iogurte grego",
    category: "laticinios",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    unit: "g",
    commonServing: 170,
  },
  {
    id: "cottage_cheese",
    name: "Queijo cottage",
    category: "laticinios",
    calories: 98,
    protein: 11,
    carbs: 3.4,
    fat: 4.3,
    fiber: 0,
    unit: "g",
    commonServing: 100,
  },
  {
    id: "milk",
    name: "Leite desnatado",
    category: "laticinios",
    calories: 34,
    protein: 3.4,
    carbs: 5,
    fat: 0.1,
    fiber: 0,
    unit: "ml",
    commonServing: 200,
  },
]

export function getFoodById(id: string): Food | undefined {
  return foodDatabase.find((food) => food.id === id)
}

export function getFoodsByCategory(category: string): Food[] {
  return foodDatabase.filter((food) => food.category === category)
}

export function calculateNutrition(
  foodId: string,
  amount: number,
): {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
} {
  const food = getFoodById(foodId)
  if (!food) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }

  const multiplier = food.unit === "unidade" ? amount : amount / 100

  return {
    calories: Math.round(food.calories * multiplier),
    protein: Math.round(food.protein * multiplier * 10) / 10,
    carbs: Math.round(food.carbs * multiplier * 10) / 10,
    fat: Math.round(food.fat * multiplier * 10) / 10,
    fiber: Math.round(food.fiber * multiplier * 10) / 10,
  }
}
