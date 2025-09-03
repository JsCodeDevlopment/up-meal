import { calculateNutrition, getFoodsByCategory, type Food } from "./food-database"

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

interface NutritionalTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
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

const filterFoodsByPreferences = (foods: Food[], preferences: UserPreferences) => {
  return foods.filter((food) => {
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

const getMealTemplates = (mealType: string) => {
  switch (mealType) {
    case "cafe_manha":
      return [
        // Template 1: Pão + queijo + fruta
        {
          carboidrato: ["pao_frances", "pao_integral", "aveia", "cuscuz"],
          proteina: ["queijo_branco", "queijo_minas", "ovo"],
          fruta: ["banana", "maca", "laranja", "mamao"],
          laticinios: ["leite_desnatado", "leite_integral", "iogurte_grego", "iogurte_natural"],
        },
        // Template 2: Cereal + leite + fruta
        {
          carboidrato: ["aveia", "granola", "cuscuz"],
          laticinios: ["leite_desnatado", "leite_integral", "iogurte_grego"],
          fruta: ["banana", "maca", "laranja"],
        },
        // Template 3: Tapioca + ovo + fruta
        {
          carboidrato: ["tapioca"],
          proteina: ["ovo"],
          fruta: ["banana", "maca"],
        },
      ]

    case "almoco":
    case "jantar":
      return [
        // Template 1: Arroz + feijão + proteína + vegetal
        {
          carboidrato: ["arroz_branco", "arroz_integral"],
          leguminosa: ["feijao_carioca", "feijao_preto", "lentilha"],
          proteina: ["frango_peito", "frango_coxa", "carne_bovina", "peixe_tilapia", "peixe_sardinha"],
          vegetal: ["alface", "tomate", "cenoura", "brocolis", "couve_flor", "abobora", "chuchu", "berinjela", "abobrinha"],
          gordura: ["azeite_oliva", "oleo_soja"],
        },
        // Template 2: Macarrão + proteína + vegetal
        {
          carboidrato: ["macarrao"],
          proteina: ["frango_peito", "carne_bovina", "peixe_tilapia"],
          vegetal: ["tomate", "cenoura", "brocolis", "couve_flor"],
          gordura: ["azeite_oliva", "oleo_soja"],
        },
        // Template 3: Batata + proteína + vegetal
        {
          carboidrato: ["batata", "batata_doce", "mandioca"],
          proteina: ["frango_peito", "carne_bovina", "peixe_tilapia"],
          vegetal: ["alface", "tomate", "cenoura", "brocolis"],
          gordura: ["azeite_oliva", "oleo_soja"],
        },
      ]

    case "lanche_manha":
    case "lanche_tarde":
      return [
        // Template 1: Fruta + oleaginosa
        {
          fruta: ["banana", "maca", "laranja", "pera", "uva", "manga", "abacaxi"],
          gordura: ["amendoas", "castanha_caju", "castanha_para", "pasta_amendoim"],
        },
        // Template 2: Iogurte + fruta
        {
          laticinios: ["iogurte_grego", "iogurte_natural"],
          fruta: ["banana", "maca", "laranja", "pera", "uva"],
        },
        // Template 3: Pão + pasta de amendoim
        {
          carboidrato: ["pao_frances", "pao_integral"],
          gordura: ["pasta_amendoim"],
        },
      ]

    case "ceia":
      return [
        // Template 1: Leite + aveia
        {
          laticinios: ["leite_desnatado", "leite_integral"],
          carboidrato: ["aveia"],
        },
        // Template 2: Iogurte + fruta
        {
          laticinios: ["iogurte_grego", "iogurte_natural"],
          fruta: ["banana", "maca"],
        },
      ]

    default:
      return []
  }
}

const generateMealItems = (
  mealType: string,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number,
  preferences: UserPreferences,
): MealItem[] => {
  const templates = getMealTemplates(mealType)
  if (templates.length === 0) return []

  // Escolher um template aleatório
  const template = templates[Math.floor(Math.random() * templates.length)]
  const items: MealItem[] = []
  let currentCalories = 0
  let currentProtein = 0
  let currentCarbs = 0
  let currentFat = 0

  // Função para adicionar um alimento de uma categoria
  const addFoodFromCategory = (category: string, maxCalories: number) => {
    const availableFoods = getFoodsByCategory(category).filter(food => 
      food.mealTime?.includes(mealType) && 
      !preferences.avoidedFoods.some(avoided => 
        food.name.toLowerCase().includes(avoided.toLowerCase())
      )
    )

    if (availableFoods.length === 0) return

    // Filtrar por preferências se especificadas
    let filteredFoods = availableFoods
    if (preferences.foodPreferences.length > 0) {
      const preferredFoods = availableFoods.filter(food =>
        preferences.foodPreferences.some(pref =>
          food.name.toLowerCase().includes(pref.toLowerCase())
        )
      )
      if (preferredFoods.length > 0) {
        filteredFoods = preferredFoods
      }
    }

    const food = filteredFoods[Math.floor(Math.random() * filteredFoods.length)]
    const remainingCalories = maxCalories - currentCalories
    
    if (remainingCalories <= 0) return

    // Calcular quantidade baseada nas calorias restantes
    let amount = food.commonServing
    const caloriesPerServing = (food.calories * food.commonServing) / 100
    
    if (caloriesPerServing > remainingCalories) {
      amount = (remainingCalories * 100) / food.calories
    }

    const nutrition = calculateNutrition(food.id, amount)
    
    items.push({
      foodId: food.id,
      amount: Math.round(amount),
      nutrition,
    })

    currentCalories += nutrition.calories
    currentProtein += nutrition.protein
    currentCarbs += nutrition.carbs
    currentFat += nutrition.fat
  }

  // Distribuir calorias entre as categorias do template
  const categories = Object.keys(template)
  const caloriesPerCategory = targetCalories / categories.length

  categories.forEach(category => {
    if (currentCalories < targetCalories * 0.9) { // Permitir 10% de tolerância
      addFoodFromCategory(category, targetCalories)
    }
  })

  // Se ainda não atingiu as calorias, adicionar mais alimentos
  if (currentCalories < targetCalories * 0.8) {
    const remainingCategories = categories.filter(cat => 
      getFoodsByCategory(cat).some(food => food.mealTime?.includes(mealType))
    )
    
    remainingCategories.forEach(category => {
      if (currentCalories < targetCalories * 0.9) {
        addFoodFromCategory(category, targetCalories)
      }
    })
  }

  return items
}

const getMealName = (mealType: string) => {
  const names = {
    cafe_manha: "Café da Manhã",
    lanche_manha: "Lanche da Manhã",
    almoco: "Almoço",
    lanche_tarde: "Lanche da Tarde",
    jantar: "Jantar",
    ceia: "Ceia",
  }
  return names[mealType as keyof typeof names] || mealType
}

export function generateDailyMealPlan(
  nutritionalTargets: NutritionalTargets,
  userPreferences?: UserPreferences,
): DailyMealPlan {
  const preferences = userPreferences || {
    foodPreferences: [],
    avoidedFoods: [],
    mealFrequency: 6,
  }

  const mealDistribution = getMealDistribution(preferences.mealFrequency)
  const meals: Meal[] = []
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0
  let totalFiber = 0

  Object.entries(mealDistribution).forEach(([mealType, distribution]) => {
    const targetCalories = Math.round(nutritionalTargets.calories * distribution.calories)
    const targetProtein = Math.round(nutritionalTargets.protein * distribution.protein)
    const targetCarbs = Math.round(nutritionalTargets.carbs * distribution.carbs)
    const targetFat = Math.round(nutritionalTargets.fat * distribution.fat)

    const items = generateMealItems(
      mealType,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      preferences,
    )

    const mealNutrition = items.reduce(
      (total, item) => ({
        calories: total.calories + item.nutrition.calories,
        protein: total.protein + item.nutrition.protein,
        carbs: total.carbs + item.nutrition.carbs,
        fat: total.fat + item.nutrition.fat,
        fiber: total.fiber + item.nutrition.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )

    const meal: Meal = {
      id: mealType,
      name: getMealName(mealType),
      items,
      totalNutrition: mealNutrition,
    }

    meals.push(meal)

    totalCalories += mealNutrition.calories
    totalProtein += mealNutrition.protein
    totalCarbs += mealNutrition.carbs
    totalFat += mealNutrition.fat
    totalFiber += mealNutrition.fiber
  })

  return {
    meals,
    totalNutrition: {
      calories: totalCalories,
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
    },
  }
}
