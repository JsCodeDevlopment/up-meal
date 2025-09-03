"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { foodDatabase } from "@/lib/food-database"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clipboard,
  Copy,
  Minus,
  Plus,
  PlusCircle,
  Save,
  Search,
  Target,
  Trash2,
} from "lucide-react"
import { useEffect, useState } from "react"

interface ManualDietCreatorProps {
  userProfile: any
  nutritionalTargets: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  onBack: () => void
  onSaveDiet?: (diet: any) => void
}

interface MealItem {
  id: string
  food: any
  quantity: number
}

interface Meal {
  id: string
  name: string
  items: MealItem[]
}

export function ManualDietCreator({ userProfile, nutritionalTargets, onBack, onSaveDiet }: ManualDietCreatorProps) {
  const [numberOfMeals, setNumberOfMeals] = useState(3)
  const [meals, setMeals] = useState<Meal[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null)
  const [filteredFoods, setFilteredFoods] = useState(foodDatabase)
  const [customFoods, setCustomFoods] = useState<any[]>([])
  const [isAddingFood, setIsAddingFood] = useState(false)
  const [copiedMeal, setCopiedMeal] = useState<MealItem[] | null>(null)
  const [newFood, setNewFood] = useState({
    name: "",
    category: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sodium: 0,
  })

  useEffect(() => {
    const mealNames = {
      3: ["Café da Manhã", "Almoço", "Jantar"],
      4: ["Café da Manhã", "Lanche da Manhã", "Almoço", "Jantar"],
      5: ["Café da Manhã", "Lanche da Manhã", "Almoço", "Lanche da Tarde", "Jantar"],
      6: ["Café da Manhã", "Lanche da Manhã", "Almoço", "Lanche da Tarde", "Jantar", "Ceia"],
    }

    const newMeals = mealNames[numberOfMeals as keyof typeof mealNames].map((name, index) => ({
      id: `meal-${index}`,
      name,
      items: [],
    }))

    setMeals(newMeals)
    setSelectedMealId(newMeals[0]?.id || null)
  }, [numberOfMeals])

  useEffect(() => {
    const allFoods = [...foodDatabase, ...customFoods]
    if (searchTerm.trim() === "") {
      setFilteredFoods(allFoods)
    } else {
      const filtered = allFoods.filter(
        (food) =>
          food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          food.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredFoods(filtered)
    }
  }, [searchTerm, customFoods])

  const calculateTotalNutrition = () => {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    let totalFiber = 0

    meals.forEach((meal) => {
      meal.items.forEach((item) => {
        const multiplier = item.quantity / 100
        totalCalories += item.food.calories * multiplier
        totalProtein += item.food.protein * multiplier
        totalCarbs += item.food.carbs * multiplier
        totalFat += item.food.fat * multiplier
        totalFiber += (item.food.fiber || 0) * multiplier
      })
    })

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
      fiber: Math.round(totalFiber),
    }
  }

  const calculateMealNutrition = (meal: Meal) => {
    let calories = 0
    let protein = 0
    let carbs = 0
    let fat = 0
    let fiber = 0

    meal.items.forEach((item) => {
      const multiplier = item.quantity / 100
      calories += item.food.calories * multiplier
      protein += item.food.protein * multiplier
      carbs += item.food.carbs * multiplier
      fat += item.food.fat * multiplier
      fiber += (item.food.fiber || 0) * multiplier
    })

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      fiber: Math.round(fiber),
    }
  }

  const addFoodToMeal = (food: any) => {
    if (!selectedMealId) return

    const newItem: MealItem = {
      id: `${selectedMealId}-${food.id}-${Date.now()}`,
      food,
      quantity: 100,
    }

    setMeals((prev) =>
      prev.map((meal) => (meal.id === selectedMealId ? { ...meal, items: [...meal.items, newItem] } : meal)),
    )
  }

  const updateItemQuantity = (mealId: string, itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromMeal(mealId, itemId)
      return
    }

    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              items: meal.items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)),
            }
          : meal,
      ),
    )
  }

  const removeItemFromMeal = (mealId: string, itemId: string) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId ? { ...meal, items: meal.items.filter((item) => item.id !== itemId) } : meal,
      ),
    )
  }

  const createCustomFood = () => {
    if (!newFood.name || !newFood.category || newFood.calories <= 0) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    const customFood = {
      id: `custom-${Date.now()}`,
      name: newFood.name,
      category: newFood.category,
      calories: newFood.calories,
      protein: newFood.protein,
      carbs: newFood.carbs,
      fat: newFood.fat,
      fiber: newFood.fiber,
      sodium: newFood.sodium,
      isCustom: true,
    }

    setCustomFoods((prev) => [...prev, customFood])
    setNewFood({
      name: "",
      category: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
    })
    setIsAddingFood(false)
  }

  const totalNutrition = calculateTotalNutrition()

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage < 80) return "bg-red-500"
    if (percentage > 120) return "bg-orange-500"
    return "bg-green-500"
  }

  const getProgressIcon = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 95 && percentage <= 105) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <AlertCircle className="h-4 w-4 text-orange-500" />
  }

  const copyMealItems = (mealId: string) => {
    const meal = meals.find((m) => m.id === mealId)
    if (meal) {
      setCopiedMeal([...meal.items])
    }
  }

  const pasteMealItems = (targetMealId: string) => {
    if (!copiedMeal) return

    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === targetMealId
          ? {
              ...meal,
              items: [
                ...meal.items,
                ...copiedMeal.map((item) => ({
                  ...item,
                  id: `${targetMealId}-${item.food.id}-${Date.now()}-${Math.random()}`,
                })),
              ],
            }
          : meal,
      ),
    )
  }

  const saveManualDiet = () => {
    const dietData = {
      id: `manual-diet-${Date.now()}`,
      type: "manual",
      createdAt: new Date().toISOString(),
      numberOfMeals,
      meals: meals.map((meal) => ({
        ...meal,
        nutrition: calculateMealNutrition(meal),
      })),
      totalNutrition: calculateTotalNutrition(),
      userProfile,
      nutritionalTargets,
    }

    const savedDiets = JSON.parse(localStorage.getItem("savedDiets") || "[]")
    savedDiets.push(dietData)
    localStorage.setItem("savedDiets", JSON.stringify(savedDiets))

    if (onSaveDiet) {
      onSaveDiet(dietData)
    }

    alert("Dieta salva com sucesso!")
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Criar Dieta Manual</h1>
              <p className="text-muted-foreground">Monte sua dieta personalizada</p>
            </div>
          </div>
          <Button onClick={saveManualDiet} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Salvar Dieta
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Número de Refeições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map((num) => (
                <Button
                  key={num}
                  variant={numberOfMeals === num ? "default" : "outline"}
                  onClick={() => setNumberOfMeals(num)}
                >
                  {num} refeições
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progresso Nutricional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Calorias</Label>
                  {getProgressIcon(totalNutrition.calories, nutritionalTargets.calories)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalNutrition.calories} / {nutritionalTargets.calories} kcal
                </div>
                <Progress value={(totalNutrition.calories / nutritionalTargets.calories) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {totalNutrition.calories > nutritionalTargets.calories
                    ? `+${totalNutrition.calories - nutritionalTargets.calories} kcal`
                    : `${nutritionalTargets.calories - totalNutrition.calories} kcal restantes`}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Proteína</Label>
                  {getProgressIcon(totalNutrition.protein, nutritionalTargets.protein)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalNutrition.protein} / {nutritionalTargets.protein}g
                </div>
                <Progress value={(totalNutrition.protein / nutritionalTargets.protein) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {totalNutrition.protein > nutritionalTargets.protein
                    ? `+${totalNutrition.protein - nutritionalTargets.protein}g`
                    : `${nutritionalTargets.protein - totalNutrition.protein}g restantes`}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Carboidratos</Label>
                  {getProgressIcon(totalNutrition.carbs, nutritionalTargets.carbs)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalNutrition.carbs} / {nutritionalTargets.carbs}g
                </div>
                <Progress value={(totalNutrition.carbs / nutritionalTargets.carbs) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {totalNutrition.carbs > nutritionalTargets.carbs
                    ? `+${totalNutrition.carbs - nutritionalTargets.carbs}g`
                    : `${nutritionalTargets.carbs - totalNutrition.carbs}g restantes`}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Gorduras</Label>
                  {getProgressIcon(totalNutrition.fat, nutritionalTargets.fat)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalNutrition.fat} / {nutritionalTargets.fat}g
                </div>
                <Progress value={(totalNutrition.fat / nutritionalTargets.fat) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {totalNutrition.fat > nutritionalTargets.fat
                    ? `+${totalNutrition.fat - nutritionalTargets.fat}g`
                    : `${nutritionalTargets.fat - totalNutrition.fat}g restantes`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Adicionar Alimentos</CardTitle>
                <Dialog open={isAddingFood} onOpenChange={setIsAddingFood}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Alimento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Alimento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="food-name">Nome do Alimento *</Label>
                        <Input
                          id="food-name"
                          value={newFood.name}
                          onChange={(e) => setNewFood((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Peito de frango grelhado"
                        />
                      </div>

                      <div>
                        <Label htmlFor="food-category">Categoria *</Label>
                        <Select
                          value={newFood.category}
                          onValueChange={(value) => setNewFood((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Proteínas">Proteínas</SelectItem>
                            <SelectItem value="Carboidratos">Carboidratos</SelectItem>
                            <SelectItem value="Vegetais">Vegetais</SelectItem>
                            <SelectItem value="Frutas">Frutas</SelectItem>
                            <SelectItem value="Gorduras">Gorduras</SelectItem>
                            <SelectItem value="Laticínios">Laticínios</SelectItem>
                            <SelectItem value="Grãos">Grãos</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="calories">Calorias (por 100g) *</Label>
                          <Input
                            id="calories"
                            type="number"
                            value={newFood.calories}
                            onChange={(e) => setNewFood((prev) => ({ ...prev, calories: Number(e.target.value) }))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="protein">Proteína (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            step="0.1"
                            value={newFood.protein}
                            onChange={(e) => setNewFood((prev) => ({ ...prev, protein: Number(e.target.value) }))}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="carbs">Carboidratos (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            step="0.1"
                            value={newFood.carbs}
                            onChange={(e) => setNewFood((prev) => ({ ...prev, carbs: Number(e.target.value) }))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fat">Gorduras (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            step="0.1"
                            value={newFood.fat}
                            onChange={(e) => setNewFood((prev) => ({ ...prev, fat: Number(e.target.value) }))}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="fiber">Fibras (g)</Label>
                          <Input
                            id="fiber"
                            type="number"
                            step="0.1"
                            value={newFood.fiber}
                            onChange={(e) => setNewFood((prev) => ({ ...prev, fiber: Number(e.target.value) }))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sodium">Sódio (mg)</Label>
                          <Input
                            id="sodium"
                            type="number"
                            value={newFood.sodium}
                            onChange={(e) => setNewFood((prev) => ({ ...prev, sodium: Number(e.target.value) }))}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={createCustomFood} className="flex-1">
                          Criar Alimento
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingFood(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alimentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {filteredFoods.length === 0 && searchTerm && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nenhum alimento encontrado para "{searchTerm}"</p>
                  <p className="text-sm">Clique em "Criar Alimento" para adicionar um novo</p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => addFoodToMeal(food)}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {food.name}
                        {food.isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            Personalizado
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {food.calories} kcal • {food.protein}g prot • {food.category}
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Refeições</CardTitle>
              <div className="flex gap-2 flex-wrap">
                {meals.map((meal) => (
                  <Button
                    key={meal.id}
                    variant={selectedMealId === meal.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMealId(meal.id)}
                  >
                    {meal.name}
                    {meal.items.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {meal.items.length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {selectedMealId && (
                <div className="space-y-4">
                  <div className="flex gap-2 pb-2 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyMealItems(selectedMealId)}
                      disabled={meals.find((m) => m.id === selectedMealId)?.items.length === 0}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar Refeição
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pasteMealItems(selectedMealId)}
                      disabled={!copiedMeal || copiedMeal.length === 0}
                    >
                      <Clipboard className="h-3 w-3 mr-1" />
                      Colar Refeição
                      {copiedMeal && copiedMeal.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {copiedMeal.length}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  {meals
                    .find((m) => m.id === selectedMealId)
                    ?.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.food.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round((item.food.calories * item.quantity) / 100)} kcal •
                            {Math.round((item.food.protein * item.quantity) / 100)}g prot
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(selectedMealId, item.id, item.quantity - 10)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantity(selectedMealId, item.id, Number.parseInt(e.target.value) || 0)
                            }
                            className="w-20 text-center"
                          />
                          <span className="text-sm text-muted-foreground">g</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(selectedMealId, item.id, item.quantity + 10)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItemFromMeal(selectedMealId, item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  {meals.find((m) => m.id === selectedMealId)?.items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum alimento adicionado ainda.
                      <br />
                      Busque e clique em um alimento para adicionar.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
