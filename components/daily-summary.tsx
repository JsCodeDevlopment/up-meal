"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Target, TrendingUp } from "lucide-react"

interface DailySummaryProps {
  completedMeals: number
  totalMeals: number
  consumedCalories: number
  targetCalories: number
  consumedMacros: {
    protein: number
    carbs: number
    fat: number
  }
  targetMacros: {
    protein: number
    carbs: number
    fat: number
  }
}

export function DailySummary({
  completedMeals,
  totalMeals,
  consumedCalories,
  targetCalories,
  consumedMacros,
  targetMacros,
}: DailySummaryProps) {
  const calorieProgress = (consumedCalories / targetCalories) * 100
  const proteinProgress = (consumedMacros.protein / targetMacros.protein) * 100
  const carbProgress = (consumedMacros.carbs / targetMacros.carbs) * 100
  const fatProgress = (consumedMacros.fat / targetMacros.fat) * 100

  const getProgressColor = (progress: number) => {
    if (progress >= 90 && progress <= 110) return "bg-green-500"
    if (progress >= 80 && progress <= 120) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getProgressStatus = (progress: number) => {
    if (progress >= 90 && progress <= 110) return "Ótimo"
    if (progress >= 80 && progress <= 120) return "Bom"
    if (progress < 80) return "Baixo"
    return "Alto"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Resumo do Dia
        </CardTitle>
        <CardDescription>Acompanhe seu progresso nutricional diário</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progresso das Refeições */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Refeições Concluídas</span>
            <Badge variant="outline">
              {completedMeals}/{totalMeals}
            </Badge>
          </div>
          <Progress value={(completedMeals / totalMeals) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            {Array.from({ length: totalMeals }, (_, i) => (
              <div key={i} className="flex items-center">
                {i < completedMeals ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progresso Calórico */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Calorias</span>
            <div className="text-right">
              <Badge className={getProgressColor(calorieProgress)}>{getProgressStatus(calorieProgress)}</Badge>
              <div className="text-xs text-muted-foreground mt-1">
                {consumedCalories}/{targetCalories} kcal
              </div>
            </div>
          </div>
          <Progress value={Math.min(calorieProgress, 100)} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">{calorieProgress.toFixed(1)}% da meta</div>
        </div>

        {/* Progresso dos Macronutrientes */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Proteína</span>
              <Badge variant="outline" className="text-xs">
                {getProgressStatus(proteinProgress)}
              </Badge>
            </div>
            <Progress value={Math.min(proteinProgress, 100)} className="h-1" />
            <div className="text-xs text-muted-foreground mt-1">
              {consumedMacros.protein.toFixed(1)}/{targetMacros.protein}g
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Carboidratos</span>
              <Badge variant="outline" className="text-xs">
                {getProgressStatus(carbProgress)}
              </Badge>
            </div>
            <Progress value={Math.min(carbProgress, 100)} className="h-1" />
            <div className="text-xs text-muted-foreground mt-1">
              {consumedMacros.carbs.toFixed(1)}/{targetMacros.carbs}g
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Gorduras</span>
              <Badge variant="outline" className="text-xs">
                {getProgressStatus(fatProgress)}
              </Badge>
            </div>
            <Progress value={Math.min(fatProgress, 100)} className="h-1" />
            <div className="text-xs text-muted-foreground mt-1">
              {consumedMacros.fat.toFixed(1)}/{targetMacros.fat}g
            </div>
          </div>
        </div>

        {/* Dicas baseadas no progresso */}
        {calorieProgress < 80 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Dica</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Você está consumindo poucas calorias. Considere adicionar um lanche saudável.
            </p>
          </div>
        )}

        {proteinProgress < 80 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Dica</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Aumente o consumo de proteínas com ovos, frango ou iogurte grego.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
