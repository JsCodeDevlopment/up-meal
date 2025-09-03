"use client"

import { ManualDietCreator } from "@/components/manual-diet-creator"
import { MealPlanView } from "@/components/meal-plan-view"
import { NutritionalGoals } from "@/components/nutritional-goals"
import { ProgressTracking } from "@/components/progress-tracking"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    BarChart3,
    BookOpen,
    Calculator,
    Calendar,
    Droplets,
    Minus,
    Plus,
    Settings,
    Target,
    Trash2,
    TrendingDown,
    TrendingUp,
    Utensils,
    Wheat,
} from "lucide-react"
import { useEffect, useState } from "react"

interface DashboardViewProps {
  userProfile: any
}

export function DashboardView({ userProfile }: DashboardViewProps) {
  const [showGoalsConfig, setShowGoalsConfig] = useState(false)
  const [showMealPlan, setShowMealPlan] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [showManualDiet, setShowManualDiet] = useState(false)
  const [showSavedDiets, setShowSavedDiets] = useState(false)
  const [savedDiets, setSavedDiets] = useState<any[]>([])
  const [activeDiet, setActiveDiet] = useState<any>(null)
  const [nutritionalGoals, setNutritionalGoals] = useState({
    calorieAdjustment: 0, // -20% to +20%
    proteinPercentage: 20,
    carbPercentage: 55,
    fatPercentage: 25,
  })

  useEffect(() => {
    const loadSavedDiets = () => {
      const diets = JSON.parse(localStorage.getItem("savedDiets") || "[]")
      setSavedDiets(diets)
    }
    loadSavedDiets()
  }, [])

  // Cálculos nutricionais básicos
  const calculateBMR = () => {
    const { gender, age, weight, height } = userProfile
    if (gender === "masculino") {
      return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    } else {
      return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
    }
  }

  const calculateTDEE = () => {
    const bmr = calculateBMR()
    const multipliers = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      intenso: 1.725,
    }
    return bmr * multipliers[userProfile.activityLevel as keyof typeof multipliers]
  }

  const calculateBMI = () => {
    const heightInM = userProfile.height / 100
    return userProfile.weight / (heightInM * heightInM)
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Abaixo do peso", color: "bg-blue-500" }
    if (bmi < 25) return { category: "Peso normal", color: "bg-green-500" }
    if (bmi < 30) return { category: "Sobrepeso", color: "bg-yellow-500" }
    return { category: "Obesidade", color: "bg-red-500" }
  }

  const calculateCalorieTarget = () => {
    const adjustment = nutritionalGoals.calorieAdjustment / 100
    return Math.round(calculateTDEE() * (1 + adjustment))
  }

  const calculateMacros = () => {
    const targetCalories = calculateCalorieTarget()
    return {
      protein: Math.round((targetCalories * nutritionalGoals.proteinPercentage) / 100 / 4), // 4 kcal/g
      carbs: Math.round((targetCalories * nutritionalGoals.carbPercentage) / 100 / 4), // 4 kcal/g
      fat: Math.round((targetCalories * nutritionalGoals.fatPercentage) / 100 / 9), // 9 kcal/g
      calories: targetCalories,
    }
  }

  const getGoalIcon = () => {
    if (nutritionalGoals.calorieAdjustment > 0) return <TrendingUp className="h-4 w-4" />
    if (nutritionalGoals.calorieAdjustment < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getGoalText = () => {
    if (nutritionalGoals.calorieAdjustment > 0) return "Superávit Calórico"
    if (nutritionalGoals.calorieAdjustment < 0) return "Déficit Calórico"
    return "Manutenção"
  }

  const handleSaveDiet = (diet: any) => {
    setSavedDiets((prev) => [...prev, diet])
    setShowManualDiet(false)
  }

  const loadSavedDiet = (diet: any) => {
    setActiveDiet(diet)
    setShowSavedDiets(false)
    setShowMealPlan(true)
  }

  const deleteSavedDiet = (dietId: string) => {
    const updatedDiets = savedDiets.filter((diet) => diet.id !== dietId)
    setSavedDiets(updatedDiets)
    localStorage.setItem("savedDiets", JSON.stringify(updatedDiets))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const bmr = Math.round(calculateBMR())
  const tdee = Math.round(calculateTDEE())
  const bmi = calculateBMI()
  const bmiInfo = getBMICategory(bmi)
  const waterIntake = Math.round(userProfile.weight * 35) // 35ml por kg
  const fiberIntake = Math.round(userProfile.weight * 0.4) // 0.4g por kg
  const macros = calculateMacros()

  if (showProgress) {
    return <ProgressTracking onBack={() => setShowProgress(false)} />
  }

  if (showManualDiet) {
    return (
      <ManualDietCreator
        userProfile={userProfile}
        nutritionalTargets={macros}
        onBack={() => setShowManualDiet(false)}
        onSaveDiet={handleSaveDiet}
      />
    )
  }

  if (showMealPlan) {
    return (
      <MealPlanView
        userProfile={userProfile}
        nutritionalTargets={macros}
        userPreferences={{
          foodPreferences: userProfile.foodPreferences || [],
          avoidedFoods: userProfile.avoidedFoods || [],
          mealFrequency: userProfile.mealFrequency || 6,
        }}
        onBack={() => {
          setShowMealPlan(false)
          setActiveDiet(null) // Limpar a dieta ativa quando voltar
        }}
        savedDiet={activeDiet}
      />
    )
  }

  if (showGoalsConfig) {
    return (
      <NutritionalGoals
        userProfile={userProfile}
        goals={nutritionalGoals}
        onGoalsChange={setNutritionalGoals}
        onBack={() => setShowGoalsConfig(false)}
        tdee={tdee}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Seu Perfil Nutricional</h1>
          <p className="text-muted-foreground">Baseado nas suas informações pessoais</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TMB</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{bmr}</div>
              <p className="text-xs text-muted-foreground">kcal/dia</p>
              <CardDescription className="mt-2">Taxa Metabólica Basal - energia necessária em repouso</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GET</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{tdee}</div>
              <p className="text-xs text-muted-foreground">kcal/dia</p>
              <CardDescription className="mt-2">Gasto Energético Total com atividades</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">IMC</CardTitle>
              <Badge className={`${bmiInfo.color} text-white`}>{bmi.toFixed(1)}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{bmiInfo.category}</div>
              <CardDescription className="mt-2">Índice de Massa Corporal</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hidratação</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{waterIntake}</div>
              <p className="text-xs text-muted-foreground">ml/dia</p>
              <CardDescription className="mt-2">Ingestão diária recomendada de água</CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getGoalIcon()}
                Meta Nutricional
              </CardTitle>
              <CardDescription>
                {getGoalText()} - {Math.abs(nutritionalGoals.calorieAdjustment)}%
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setShowProgress(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Progresso
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowMealPlan(true)}>
                <Utensils className="h-4 w-4 mr-2" />
                Ver Cardápio
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowManualDiet(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Dieta Manual
              </Button>
              <Dialog open={showSavedDiets} onOpenChange={setShowSavedDiets}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Dietas Salvas
                    {savedDiets.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {savedDiets.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Dietas Salvas</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {savedDiets.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma dieta salva ainda</p>
                        <p className="text-sm">Crie uma dieta manual para salvá-la aqui</p>
                      </div>
                    ) : (
                      savedDiets.map((diet) => (
                        <Card key={diet.id} className="border">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Dieta Manual
                                </CardTitle>
                                <CardDescription>Criada em {formatDate(diet.createdAt)}</CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => loadSavedDiet(diet)}>
                                  Usar Dieta
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => deleteSavedDiet(diet.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="text-center">
                                <div className="font-semibold text-primary">{diet.totalNutrition.calories}</div>
                                <div className="text-muted-foreground">kcal</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-accent">{diet.totalNutrition.protein}g</div>
                                <div className="text-muted-foreground">Proteína</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-chart-3">{diet.totalNutrition.carbs}g</div>
                                <div className="text-muted-foreground">Carboidratos</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-chart-5">{diet.totalNutrition.fat}g</div>
                                <div className="text-muted-foreground">Gorduras</div>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{diet.numberOfMeals} refeições</span>
                                <span>•</span>
                                <span>
                                  {diet.meals.reduce((total: number, meal: any) => total + meal.items.length, 0)}{" "}
                                  alimentos
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={() => setShowGoalsConfig(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-2xl font-bold text-primary">{macros.calories}</div>
                <p className="text-sm text-muted-foreground">kcal/dia</p>
                <p className="text-xs text-muted-foreground mt-1">Meta Calórica</p>
              </div>
              <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                <div className="text-2xl font-bold text-accent">{macros.protein}g</div>
                <p className="text-sm text-muted-foreground">Proteína</p>
                <p className="text-xs text-muted-foreground mt-1">{nutritionalGoals.proteinPercentage}%</p>
              </div>
              <div className="text-center p-4 bg-chart-3/5 rounded-lg border border-chart-3/20">
                <div className="text-2xl font-bold text-chart-3">{macros.carbs}g</div>
                <p className="text-sm text-muted-foreground">Carboidratos</p>
                <p className="text-xs text-muted-foreground mt-1">{nutritionalGoals.carbPercentage}%</p>
              </div>
              <div className="text-center p-4 bg-chart-5/5 rounded-lg border border-chart-5/20">
                <div className="text-2xl font-bold text-chart-5">{macros.fat}g</div>
                <p className="text-sm text-muted-foreground">Gorduras</p>
                <p className="text-xs text-muted-foreground mt-1">{nutritionalGoals.fatPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wheat className="h-5 w-5" />
              Recomendações Nutricionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{fiberIntake}g</div>
                <p className="text-sm text-muted-foreground">Fibras por dia</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{Math.round(userProfile.weight * 1.2)}g</div>
                <p className="text-sm text-muted-foreground">Proteína mínima</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{userProfile.mealFrequency || 6}</div>
                <p className="text-sm text-muted-foreground">Refeições por dia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
