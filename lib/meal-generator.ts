import { foodDatabase, calculateNutrition } from "./food-database"

export interface MealItem {
  foodId: string
  amount: number
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
}

export interface Meal {
  id: string
  name: string
  items: MealItem[]
  totalNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
}

export interface DailyMealPlan {
  meals: Meal[]
  totalNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
}

interface UserPreferences {
  foodPreferences: string[]
  avoidedFoods: string[]
  mealFrequency: number
}

const getMealDistribution = (mealFrequency: number) => {
  switch (mealFrequency) {
    case 3:
      return {
        cafe_manha: { calories: 0.3, protein: 0.25, carbs: 0.35, fat: 0.25 },
        almoco: { calories: 0.45, protein: 0.5, carbs: 0.45, fat: 0.5 },
        jantar: { calories: 0.25, protein: 0.25, carbs: 0.2, fat: 0.25 },
      }
    case 4:
      return {
        cafe_manha: { calories: 0.25, protein: 0.2, carbs: 0.3, fat: 0.2 },
        lanche_manha: { calories: 0.15, protein: 0.15, carbs: 0.2, fat: 0.15 },
        almoco: { calories: 0.35, protein: 0.4, carbs: 0.35, fat: 0.4 },
        jantar: { calories: 0.25, protein: 0.25, carbs: 0.15, fat: 0.25 },
      }
    case 5:
      return {
        cafe_manha: { calories: 0.25, protein: 0.2, carbs: 0.3, fat: 0.2 },
        lanche_manha: { calories: 0.1, protein: 0.15, carbs: 0.15, fat: 0.1 },
        almoco: { calories: 0.35, protein: 0.4, carbs: 0.35, fat: 0.4 },
        lanche_tarde: { calories: 0.15, protein: 0.15, carbs: 0.15, fat: 0.15 },
        jantar: { calories: 0.15, protein: 0.1, carbs: 0.05, fat: 0.15 },
      }
    case 6:
    default:
      return {
        cafe_manha: { calories: 0.25, protein: 0.2, carbs: 0.3, fat: 0.2 },
        lanche_manha: { calories: 0.1, protein: 0.15, carbs: 0.15, fat: 0.1 },
        almoco: { calories: 0.35, protein: 0.4, carbs: 0.35, fat: 0.4 },
        lanche_tarde: { calories: 0.1, protein: 0.1, carbs: 0.1, fat: 0.1 },
        jantar: { calories: 0.15, protein: 0.1, carbs: 0.08, fat: 0.15 },
        ceia: { calories: 0.05, protein: 0.05, carbs: 0.02, fat: 0.05 },
      }
  }
}

const filterFoodsByPreferences = (foods: string[], preferences: UserPreferences) => {
  return foods.filter((foodId) => {
    const food = foodDatabase.find((f) => f.id === foodId)
    if (!food) return false

    const shouldAvoid = preferences.avoidedFoods.some(
      (avoided) =>
        food.name.toLowerCase().includes(avoided.toLowerCase()) ||
        food.category?.toLowerCase().includes(avoided.toLowerCase()),
    )

    if (shouldAvoid) return false

    if (preferences.foodPreferences.length > 0) {
      const isPreferred = preferences.foodPreferences.some(
        (pref) =>
          food.name.toLowerCase().includes(pref.toLowerCase()) ||
          food.category?.toLowerCase().includes(pref.toLowerCase()),
      )
      return isPreferred
    }

    return true
  })
}

const mealTemplates = {
  cafe_manha: [
    { base: "oats", protein: "greek_yogurt", fruit: "banana", fat: "almonds" },
    { base: "whole_bread", protein: "eggs", fat: "avocado", extra: "tomato" },
    { base: "greek_yogurt", fruit: "banana", fat: "almonds", extra: "oats" },
  ],
  lanche_manha: [
    { fruit: "banana", fat: "peanut_butter" },
    { protein: "greek_yogurt", fruit: "banana" },
    { fat: "almonds", extra: "milk" },
  ],
  almoco: [
    { protein: "chicken_breast", carb: "brown_rice", vegetal: "broccoli", fat: "olive_oil" },
    { protein: "salmon", carb: "sweet_potato", vegetal: "spinach", fat: "olive_oil" },
    { protein: "lean_beef", carb: "brown_rice", vegetal: "lettuce", fat: "avocado" },
  ],
  lanche_tarde: [
    { protein: "cottage_cheese", fruit: "banana" },
    { fat: "almonds", extra: "milk" },
    { protein: "greek_yogurt", fat: "almonds" },
  ],
  jantar: [
    { protein: "tuna", vegetal: "spinach", fat: "olive_oil", extra: "tomato" },
    { protein: "chicken_breast", vegetal: "broccoli", fat: "olive_oil" },
    { protein: "salmon", vegetal: "lettuce", fat: "avocado" },
  ],
  ceia: [{ protein: "cottage_cheese" }, { protein: "greek_yogurt", fat: "almonds" }, { extra: "milk", fat: "almonds" }],
}

function selectRandomTemplate(mealType: keyof typeof mealTemplates) {
  const templates = mealTemplates[mealType]
  return templates[Math.floor(Math.random() * templates.length)]
}

function optimizePortions(template: any, targets: any): MealItem[] {
  const items: MealItem[] = []

  Object.entries(template).forEach(([role, foodId]) => {
    const food = foodDatabase.find((f) => f.id === foodId)
    if (food) {
      items.push({
        foodId: foodId as string,
        amount: food.commonServing,
        nutrition: calculateNutrition(foodId as string, food.commonServing),
      })
    }
  })

  let iterations = 0
  while (iterations < 10) {
    const currentNutrition = items.reduce(
      (total, item) => ({
        calories: total.calories + item.nutrition.calories,
        protein: total.protein + item.nutrition.protein,
        carbs: total.carbs + item.nutrition.carbs,
        fat: total.fat + item.nutrition.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )

    const caloriesDiff = targets.calories - currentNutrition.calories

    if (Math.abs(caloriesDiff) < 50) break

    if (items.length > 0) {
      const mainItem = items[0]
      const food = foodDatabase.find((f) => f.id === mainItem.foodId)
      if (food) {
        const adjustment = caloriesDiff > 0 ? 1.1 : 0.9
        mainItem.amount = Math.max(10, Math.round(mainItem.amount * adjustment))
        mainItem.nutrition = calculateNutrition(mainItem.foodId, mainItem.amount)
      }
    }

    iterations++
  }

  return items
}

function calculateMealTargets(totalTargets: any, mealType: string, distribution: any) {
  const mealDist = distribution[mealType]
  if (!mealDist) return { calories: 0, protein: 0, carbs: 0, fat: 0 }

  return {
    calories: Math.round(totalTargets.calories * mealDist.calories),
    protein: Math.round(totalTargets.protein * mealDist.protein),
    carbs: Math.round(totalTargets.carbs * mealDist.carbs),
    fat: Math.round(totalTargets.fat * mealDist.fat),
  }
}

export function generateDailyMealPlan(
  nutritionalTargets: {
    calories: number
    protein: number
    carbs: number
    fat: number
  },
  preferences?: UserPreferences,
): DailyMealPlan {
  const meals: Meal[] = []
  const mealFrequency = preferences?.mealFrequency || 6
  const mealDistribution = getMealDistribution(mealFrequency)

  const getMealTypes = (frequency: number) => {
    const baseMeals = [
      { id: "cafe_manha", name: "Café da Manhã" },
      { id: "almoco", name: "Almoço" },
      { id: "jantar", name: "Jantar" },
    ]

    if (frequency >= 4) {
      baseMeals.splice(2, 0, { id: "lanche_manha", name: "Lanche da Manhã" })
    }
    if (frequency >= 5) {
      baseMeals.splice(-1, 0, { id: "lanche_tarde", name: "Lanche da Tarde" })
    }
    if (frequency >= 6) {
      baseMeals.push({ id: "ceia", name: "Ceia" })
    }

    return baseMeals
  }

  const mealTypes = getMealTypes(mealFrequency)

  mealTypes.forEach(({ id, name }) => {
    let template = selectRandomTemplate(id as keyof typeof mealTemplates)

    if (preferences) {
      const filteredTemplate: any = {}
      Object.entries(template).forEach(([role, foodId]) => {
        const availableFoods = filterFoodsByPreferences([foodId as string], preferences)
        if (availableFoods.length > 0) {
          filteredTemplate[role] = availableFoods[0]
        } else {
          const food = foodDatabase.find((f) => f.id === foodId)
          if (food) {
            const alternatives = foodDatabase.filter((f) => f.category === food.category).map((f) => f.id)
            const filteredAlternatives = filterFoodsByPreferences(alternatives, preferences)
            if (filteredAlternatives.length > 0) {
              filteredTemplate[role] = filteredAlternatives[0]
            }
          }
        }
      })
      template = filteredTemplate
    }

    const targets = calculateMealTargets(nutritionalTargets, id, mealDistribution)
    const items = optimizePortions(template, targets)

    const totalNutrition = items.reduce(
      (total, item) => ({
        calories: total.calories + item.nutrition.calories,
        protein: total.protein + item.nutrition.protein,
        carbs: total.carbs + item.nutrition.carbs,
        fat: total.fat + item.nutrition.fat,
        fiber: total.fiber + item.nutrition.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )

    meals.push({
      id,
      name,
      items,
      totalNutrition,
    })
  })

  const totalNutrition = meals.reduce(
    (total, meal) => ({
      calories: total.calories + meal.totalNutrition.calories,
      protein: total.protein + meal.totalNutrition.protein,
      carbs: total.carbs + meal.totalNutrition.carbs,
      fat: total.fat + meal.totalNutrition.fat,
      fiber: total.fiber + meal.totalNutrition.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  )

  return {
    meals,
    totalNutrition,
  }
}
