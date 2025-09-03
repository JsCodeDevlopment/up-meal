"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Target, TrendingUp, TrendingDown, Minus, Info } from "lucide-react"

interface NutritionalGoalsProps {
  userProfile: any
  goals: {
    calorieAdjustment: number
    proteinPercentage: number
    carbPercentage: number
    fatPercentage: number
  }
  onGoalsChange: (goals: any) => void
  onBack: () => void
  tdee: number
}

export function NutritionalGoals({ userProfile, goals, onGoalsChange, onBack, tdee }: NutritionalGoalsProps) {
  const [localGoals, setLocalGoals] = useState(goals)

  const updateGoal = (field: string, value: number) => {
    setLocalGoals((prev) => ({ ...prev, [field]: value }))
  }

  const normalizePercentages = () => {
    const total = localGoals.proteinPercentage + localGoals.carbPercentage + localGoals.fatPercentage
    if (total !== 100) {
      const factor = 100 / total
      setLocalGoals((prev) => ({
        ...prev,
        proteinPercentage: Math.round(prev.proteinPercentage * factor),
        carbPercentage: Math.round(prev.carbPercentage * factor),
        fatPercentage: Math.round(prev.fatPercentage * factor),
      }))
    }
  }

  const calculatePreview = () => {
    const targetCalories = Math.round(tdee * (1 + localGoals.calorieAdjustment / 100))
    return {
      calories: targetCalories,
      protein: Math.round((targetCalories * localGoals.proteinPercentage) / 100 / 4),
      carbs: Math.round((targetCalories * localGoals.carbPercentage) / 100 / 4),
      fat: Math.round((targetCalories * localGoals.fatPercentage) / 100 / 9),
    }
  }

  const getGoalRecommendation = () => {
    const { goal } = userProfile
    if (goal === "perder") return { adjustment: -15, text: "Déficit de 15% recomendado para perda de peso" }
    if (goal === "ganhar") return { adjustment: 15, text: "Superávit de 15% recomendado para ganho de peso" }
    return { adjustment: 0, text: "Manutenção calórica para manter o peso atual" }
  }

  const handleSave = () => {
    normalizePercentages()
    onGoalsChange(localGoals)
    onBack()
  }

  const handleUseRecommendation = () => {
    const recommendation = getGoalRecommendation()
    updateGoal("calorieAdjustment", recommendation.adjustment)
  }

  const preview = calculatePreview()
  const recommendation = getGoalRecommendation()
  const totalPercentage = localGoals.proteinPercentage + localGoals.carbPercentage + localGoals.fatPercentage

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurar Metas Nutricionais</h1>
            <p className="text-muted-foreground">Ajuste suas metas calóricas e de macronutrientes</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meta Calórica
            </CardTitle>
            <CardDescription>
              Seu GET é {tdee} kcal/dia. Ajuste o percentual para criar déficit ou superávit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Ajuste Calórico</Label>
                <Badge variant="outline">
                  {localGoals.calorieAdjustment > 0 && <TrendingUp className="h-3 w-3 mr-1" />}
                  {localGoals.calorieAdjustment < 0 && <TrendingDown className="h-3 w-3 mr-1" />}
                  {localGoals.calorieAdjustment === 0 && <Minus className="h-3 w-3 mr-1" />}
                  {localGoals.calorieAdjustment}%
                </Badge>
              </div>
              <Slider
                value={[localGoals.calorieAdjustment]}
                onValueChange={([value]) => updateGoal("calorieAdjustment", value)}
                min={-30}
                max={30}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>-30% (Déficit)</span>
                <span>0% (Manutenção)</span>
                <span>+30% (Superávit)</span>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Recomendação baseada no seu objetivo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{recommendation.text}</p>
              <Button variant="outline" size="sm" onClick={handleUseRecommendation}>
                Usar Recomendação ({recommendation.adjustment}%)
              </Button>
            </div>

            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary">{preview.calories}</div>
              <p className="text-sm text-muted-foreground">kcal/dia (Meta)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Macronutrientes</CardTitle>
            <CardDescription>
              Ajuste a distribuição de proteínas, carboidratos e gorduras
              {totalPercentage !== 100 && (
                <Badge variant="destructive" className="ml-2">
                  Total: {totalPercentage}% (deve somar 100%)
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Proteína</Label>
                  <Badge variant="outline">
                    {localGoals.proteinPercentage}% ({preview.protein}g)
                  </Badge>
                </div>
                <Slider
                  value={[localGoals.proteinPercentage]}
                  onValueChange={([value]) => updateGoal("proteinPercentage", value)}
                  min={10}
                  max={40}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Carboidratos</Label>
                  <Badge variant="outline">
                    {localGoals.carbPercentage}% ({preview.carbs}g)
                  </Badge>
                </div>
                <Slider
                  value={[localGoals.carbPercentage]}
                  onValueChange={([value]) => updateGoal("carbPercentage", value)}
                  min={20}
                  max={70}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Gorduras</Label>
                  <Badge variant="outline">
                    {localGoals.fatPercentage}% ({preview.fat}g)
                  </Badge>
                </div>
                <Slider
                  value={[localGoals.fatPercentage]}
                  onValueChange={([value]) => updateGoal("fatPercentage", value)}
                  min={15}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-accent/5 rounded-lg border border-accent/20">
                <div className="text-xl font-bold text-accent">{preview.protein}g</div>
                <p className="text-xs text-muted-foreground">Proteína</p>
              </div>
              <div className="text-center p-3 bg-chart-3/5 rounded-lg border border-chart-3/20">
                <div className="text-xl font-bold text-chart-3">{preview.carbs}g</div>
                <p className="text-xs text-muted-foreground">Carboidratos</p>
              </div>
              <div className="text-center p-3 bg-chart-5/5 rounded-lg border border-chart-5/20">
                <div className="text-xl font-bold text-chart-5">{preview.fat}g</div>
                <p className="text-xs text-muted-foreground">Gorduras</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={totalPercentage !== 100}>
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  )
}
