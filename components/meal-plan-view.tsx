"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { calculateNutrition, foodDatabase, getFoodById } from "@/lib/food-database"
import { generateDailyMealPlan, type DailyMealPlan } from "@/lib/meal-generator"
import { progressStorage } from "@/lib/progress-storage"
import { ArrowLeft, Check, Edit2, RefreshCw, Shuffle, Target, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

interface MealPlanViewProps {
  userProfile: any
  nutritionalTargets: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  userPreferences?: {
    foodPreferences: string[]
    avoidedFoods: string[]
    mealFrequency: number
  }
  onBack: () => void
  savedDiet?: any
}

export function MealPlanView({ userProfile, nutritionalTargets, userPreferences, onBack, savedDiet }: MealPlanViewProps) {
  const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set())
  const [editingItem, setEditingItem] = useState<{ mealId: string; itemIndex: number } | null>(null)
  const [editAmount, setEditAmount] = useState("")
  const [substitutionDialog, setSubstitutionDialog] = useState<{ mealId: string; itemIndex: number } | null>(null)

  useEffect(() => {
    if (mealPlan && completedMeals.size > 0) {
      const today = new Date().toISOString().split("T")[0]
      const completedCalories = mealPlan.meals
        .filter((meal) => completedMeals.has(meal.id))
        .reduce((total, meal) => total + meal.totalNutrition.calories, 0)

      const completedMacros = mealPlan.meals
        .filter((meal) => completedMeals.has(meal.id))
        .reduce(
          (total, meal) => ({
            protein: total.protein + meal.totalNutrition.protein,
            carbs: total.carbs + meal.totalNutrition.carbs,
            fat: total.fat + meal.totalNutrition.fat,
          }),
          { protein: 0, carbs: 0, fat: 0 },
        )

      const adherenceScore = progressStorage.calculateAdherenceScore(
        completedMeals.size,
        mealPlan.meals.length,
        completedCalories,
        nutritionalTargets.calories,
      )

      progressStorage.saveProgress({
        date: today,
        completedMeals: completedMeals.size,
        totalMeals: mealPlan.meals.length,
        consumedCalories: completedCalories,
        targetCalories: nutritionalTargets.calories,
        consumedMacros: completedMacros,
        targetMacros: nutritionalTargets,
        adherenceScore,
      })
    }
  }, [completedMeals, mealPlan, nutritionalTargets])

  const generateNewPlan = async () => {
    if (savedDiet) return // Não gerar novo plano se temos dieta salva
    
    setIsGenerating(true)
    // Simular tempo de processamento
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newPlan = generateDailyMealPlan(nutritionalTargets, userPreferences)
    setMealPlan(newPlan)
    setCompletedMeals(new Set()) // Reset completed meals
    setIsGenerating(false)
  }

  useEffect(() => {
    if (savedDiet) {
      // Converter a estrutura da dieta salva para o formato esperado pelo MealPlanView
      const convertedDiet = convertSavedDietToMealPlan(savedDiet)
      setMealPlan(convertedDiet)
      setCompletedMeals(new Set())
    } else {
      // Se não temos dieta salva, gere um novo plano
      generateNewPlan()
    }
  }, [savedDiet, nutritionalTargets, userPreferences])

  const convertSavedDietToMealPlan = (savedDiet: any): DailyMealPlan => {
    const convertedMeals = savedDiet.meals.map((meal: any) => ({
      id: meal.id,
      name: meal.name,
      items: meal.items.map((item: any) => ({
        foodId: item.food.id,
        amount: item.quantity,
        nutrition: {
          calories: Math.round((item.food.calories * item.quantity) / 100),
          protein: Math.round((item.food.protein * item.quantity) / 100),
          carbs: Math.round((item.food.carbs * item.quantity) / 100),
          fat: Math.round((item.food.fat * item.quantity) / 100),
          fiber: Math.round((item.food.fiber * item.quantity) / 100),
        }
      })),
      totalNutrition: meal.nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      }
    }))

    return {
      meals: convertedMeals,
      totalNutrition: savedDiet.totalNutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      }
    }
  }

  const toggleMealCompletion = (mealId: string) => {
    setCompletedMeals((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(mealId)) {
        newSet.delete(mealId)
      } else {
        newSet.add(mealId)
      }
      return newSet
    })
  }

  const updateItemAmount = (mealId: string, itemIndex: number, newAmount: number) => {
    if (!mealPlan) return

    const updatedMealPlan = { ...mealPlan }
    const meal = updatedMealPlan.meals.find((m) => m.id === mealId)
    if (!meal) return

    const item = meal.items[itemIndex]
    item.amount = newAmount
    item.nutrition = calculateNutrition(item.foodId, newAmount)

    // Recalcular totais da refeição
    meal.totalNutrition = meal.items.reduce(
      (total, item) => ({
        calories: total.calories + item.nutrition.calories,
        protein: total.protein + item.nutrition.protein,
        carbs: total.carbs + item.nutrition.carbs,
        fat: total.fat + item.nutrition.fat,
        fiber: total.fiber + item.nutrition.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )

    // Recalcular totais do dia
    updatedMealPlan.totalNutrition = updatedMealPlan.meals.reduce(
      (total, meal) => ({
        calories: total.calories + meal.totalNutrition.calories,
        protein: total.protein + meal.totalNutrition.protein,
        carbs: total.carbs + meal.totalNutrition.carbs,
        fat: total.fat + meal.totalNutrition.fat,
        fiber: total.fiber + meal.totalNutrition.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )

    setMealPlan(updatedMealPlan)
    setEditingItem(null)
  }

  const substituteFood = (mealId: string, itemIndex: number, newFoodId: string) => {
    if (!mealPlan) return

    const updatedMealPlan = { ...mealPlan }
    const meal = updatedMealPlan.meals.find((m) => m.id === mealId)
    if (!meal) return

    const item = meal.items[itemIndex]
    const newFood = getFoodById(newFoodId)
    if (!newFood) return

    // Manter quantidade similar baseada nas calorias
    const currentCalories = item.nutrition.calories
    const targetAmount = Math.round((currentCalories / newFood.calories) * (newFood.unit === "unidade" ? 1 : 100))

    item.foodId = newFoodId
    item.amount = Math.max(newFood.unit === "unidade" ? 1 : 10, targetAmount)
    item.nutrition = calculateNutrition(newFoodId, item.amount)

    // Recalcular totais
    meal.totalNutrition = meal.items.reduce(
      (total, item) => ({
        calories: total.calories + item.nutrition.calories,
        protein: total.protein + item.nutrition.protein,
        carbs: total.carbs + item.nutrition.carbs,
        fat: total.fat + item.nutrition.fat,
        fiber: total.fiber + item.nutrition.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )

    updatedMealPlan.totalNutrition = updatedMealPlan.meals.reduce(
      (total, meal) => ({
        calories: total.calories + meal.totalNutrition.calories,
        protein: total.protein + meal.totalNutrition.protein,
        carbs: total.carbs + meal.totalNutrition.carbs,
        fat: total.fat + meal.totalNutrition.fat,
        fiber: total.fiber + meal.totalNutrition.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )

    setMealPlan(updatedMealPlan)
    setSubstitutionDialog(null)
  }

  const removeItem = (mealId: string, itemIndex: number) => {
    if (!mealPlan) return

    const updatedMealPlan = { ...mealPlan }
    const meal = updatedMealPlan.meals.find((m) => m.id === mealId)
    if (!meal || meal.items.length <= 1) return // Não remover se for o único item

    meal.items.splice(itemIndex, 1)

    // Recalcular totais
    meal.totalNutrition = meal.items.reduce(
      (total, item) => ({
        calories: total.calories + item.nutrition.calories,
        protein: total.protein + item.nutrition.protein,
        carbs: total.carbs + item.nutrition.carbs,
        fat: total.fat + item.nutrition.fat,
        fiber: total.fiber + item.nutrition.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )

    updatedMealPlan.totalNutrition = updatedMealPlan.meals.reduce(
      (total, meal) => ({
        calories: total.calories + meal.totalNutrition.calories,
        protein: total.protein + meal.totalNutrition.protein,
        carbs: total.carbs + meal.totalNutrition.carbs,
        fat: total.fat + meal.totalNutrition.fat,
        fiber: total.fiber + meal.totalNutrition.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )

    setMealPlan(updatedMealPlan)
  }

  const getAlternativeFoods = (currentFoodId: string) => {
    const currentFood = getFoodById(currentFoodId)
    if (!currentFood) return []

    let alternatives = foodDatabase.filter(
      (food) => food.category === currentFood.category && food.id !== currentFoodId,
    )

    if (userPreferences) {
      alternatives = alternatives.filter((food) => {
        const shouldAvoid = userPreferences.avoidedFoods.some(
          (avoided) =>
            food.name.toLowerCase().includes(avoided.toLowerCase()) ||
            food.category?.toLowerCase().includes(avoided.toLowerCase()),
        )

        if (shouldAvoid) return false

        if (userPreferences.foodPreferences.length > 0) {
          const isPreferred = userPreferences.foodPreferences.some(
            (pref) =>
              food.name.toLowerCase().includes(pref.toLowerCase()) ||
              food.category?.toLowerCase().includes(pref.toLowerCase()),
          )
          return isPreferred
        }

        return true
      })
    }

    return alternatives.slice(0, 8)
  }

  const getDailyProgress = () => {
    if (!mealPlan) return { completed: 0, total: 0, calories: 0 }

    const completedCalories = mealPlan.meals
      .filter((meal) => completedMeals.has(meal.id))
      .reduce((total, meal) => total + meal.totalNutrition.calories, 0)

    return {
      completed: completedMeals.size,
      total: mealPlan.meals.length,
      calories: completedCalories,
    }
  }

  const getMealIcon = (mealId: string) => {
    const icons = {
      cafe_manha: "☀️",
      lanche_manha: "🍎",
      almoco: "🍽️",
      lanche_tarde: "🥤",
      jantar: "🌙",
      ceia: "🥛",
    }
    return icons[mealId as keyof typeof icons] || "🍽️"
  }

  const formatAmount = (foodId: string, amount: number) => {
    const food = getFoodById(foodId)
    if (!food) return `${amount}g`

    if (food.unit === "unidade") {
      return `${amount} ${amount === 1 ? "unidade" : "unidades"}`
    }
    if (food.unit === "fatia") {
      return `${amount} ${amount === 1 ? "fatia" : "fatias"}`
    }
    return `${amount}${food.unit}`
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Gerando seu cardápio personalizado...</p>
        </div>
      </div>
    )
  }

  const progress = getDailyProgress()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {savedDiet ? "Dieta Salva" : "Seu Cardápio Diário"}
              </h1>
              <p className="text-muted-foreground">
                {savedDiet && <span className="text-green-600 font-medium mr-2">✓ Dieta personalizada</span>}
                {progress.completed}/{progress.total} refeições concluídas
                {userPreferences && (
                  <span className="ml-2 text-xs bg-primary/10 px-2 py-1 rounded">
                    {userPreferences.mealFrequency} refeições/dia
                  </span>
                )}
              </p>
            </div>
          </div>
          {!savedDiet && (
            <Button onClick={generateNewPlan} disabled={isGenerating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Gerando..." : "Novo Cardápio"}
            </Button>
          )}
        </div>

        {userPreferences && (userPreferences.foodPreferences.length > 0 || userPreferences.avoidedFoods.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suas Preferências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userPreferences.foodPreferences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Alimentos preferidos:</p>
                    <div className="flex flex-wrap gap-1">
                      {userPreferences.foodPreferences.map((food) => (
                        <Badge key={food} variant="secondary" className="text-xs">
                          {food}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {userPreferences.avoidedFoods.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Alimentos evitados:</p>
                    <div className="flex flex-wrap gap-1">
                      {userPreferences.avoidedFoods.map((food) => (
                        <Badge key={food} variant="destructive" className="text-xs">
                          {food}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progresso Nutricional do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-xl font-bold text-primary">
                  {progress.calories}/{mealPlan.totalNutrition.calories}
                </div>
                <p className="text-xs text-muted-foreground">kcal consumidas</p>
                <p className="text-xs text-muted-foreground">Meta: {nutritionalTargets.calories}</p>
              </div>
              <div className="text-center p-3 bg-accent/5 rounded-lg border border-accent/20">
                <div className="text-xl font-bold text-accent">{mealPlan.totalNutrition.protein.toFixed(1)}g</div>
                <p className="text-xs text-muted-foreground">Proteína</p>
                <p className="text-xs text-muted-foreground">Meta: {nutritionalTargets.protein}g</p>
              </div>
              <div className="text-center p-3 bg-chart-3/5 rounded-lg border border-chart-3/20">
                <div className="text-xl font-bold text-chart-3">{mealPlan.totalNutrition.carbs.toFixed(1)}g</div>
                <p className="text-xs text-muted-foreground">Carboidratos</p>
                <p className="text-xs text-muted-foreground">Meta: {nutritionalTargets.carbs}g</p>
              </div>
              <div className="text-center p-3 bg-chart-5/5 rounded-lg border border-chart-5/20">
                <div className="text-xl font-bold text-chart-5">{mealPlan.totalNutrition.fat.toFixed(1)}g</div>
                <p className="text-xs text-muted-foreground">Gorduras</p>
                <p className="text-xs text-muted-foreground">Meta: {nutritionalTargets.fat}g</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {mealPlan.meals.map((meal, index) => {
            const isCompleted = completedMeals.has(meal.id)
            return (
              <Card key={meal.id} className={isCompleted ? "bg-green-50 border-green-200" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{getMealIcon(meal.id)}</span>
                      {meal.name}
                      <Badge variant="outline" className="ml-2">
                        {meal.totalNutrition.calories} kcal
                      </Badge>
                      {isCompleted && <Badge className="bg-green-500">Concluída</Badge>}
                    </CardTitle>
                    <Button
                      variant={isCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleMealCompletion(meal.id)}
                      className={isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {isCompleted ? "Concluída" : "Marcar"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {meal.items.map((item, itemIndex) => {
                      const food = getFoodById(item.foodId)
                      if (!food) return null

                      const isEditing = editingItem?.mealId === meal.id && editingItem?.itemIndex === itemIndex

                      return (
                        <div key={itemIndex} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{food.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {isEditing ? (
                                <div className="flex items-center gap-2 mt-2">
                                  <Input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    className="w-20"
                                    min="1"
                                  />
                                  <span className="text-xs">{food.unit}</span>
                                  <Button
                                    size="sm"
                                    onClick={() => updateItemAmount(meal.id, itemIndex, Number.parseInt(editAmount))}
                                  >
                                    Salvar
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => setEditingItem(null)}>
                                    Cancelar
                                  </Button>
                                </div>
                              ) : (
                                formatAmount(item.foodId, item.amount)
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right space-y-1">
                              <div className="text-sm font-medium">{item.nutrition.calories} kcal</div>
                              <div className="text-xs text-muted-foreground">
                                P: {item.nutrition.protein.toFixed(1)}g | C: {item.nutrition.carbs.toFixed(1)}g | G:{" "}
                                {item.nutrition.fat.toFixed(1)}g
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingItem({ mealId: meal.id, itemIndex })
                                  setEditAmount(item.amount.toString())
                                }}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Dialog
                                open={
                                  substitutionDialog?.mealId === meal.id && substitutionDialog?.itemIndex === itemIndex
                                }
                                onOpenChange={(open) => {
                                  if (!open) setSubstitutionDialog(null)
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSubstitutionDialog({ mealId: meal.id, itemIndex })}
                                  >
                                    <Shuffle className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Substituir Alimento</DialogTitle>
                                    <DialogDescription>
                                      Escolha um alimento alternativo da mesma categoria
                                      {userPreferences && " (filtrado pelas suas preferências)"}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                    {getAlternativeFoods(item.foodId).map((altFood) => (
                                      <Button
                                        key={altFood.id}
                                        variant="outline"
                                        className="justify-start h-auto p-3 bg-transparent"
                                        onClick={() => substituteFood(meal.id, itemIndex, altFood.id)}
                                      >
                                        <div className="text-left">
                                          <div className="font-medium text-sm">{altFood.name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {altFood.calories} kcal/100g
                                          </div>
                                        </div>
                                      </Button>
                                    ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              {meal.items.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(meal.id, itemIndex)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Total da refeição:</span>
                    <div className="text-right">
                      <div className="font-medium">{meal.totalNutrition.calories} kcal</div>
                      <div className="text-muted-foreground">
                        P: {meal.totalNutrition.protein.toFixed(1)}g | C: {meal.totalNutrition.carbs.toFixed(1)}g | G:{" "}
                        {meal.totalNutrition.fat.toFixed(1)}g
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
