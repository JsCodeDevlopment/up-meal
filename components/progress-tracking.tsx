"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Award, Target, BarChart3, Flame, CheckCircle } from "lucide-react"
import { progressStorage, type DailyProgress, type WeeklyStats } from "@/lib/progress-storage"

interface ProgressTrackingProps {
  onBack: () => void
}

export function ProgressTracking({ onBack }: ProgressTrackingProps) {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([])
  const [recentProgress, setRecentProgress] = useState<DailyProgress[]>([])
  const [streakInfo, setStreakInfo] = useState({ currentStreak: 0, longestStreak: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stats = progressStorage.getWeeklyProgress(8) // 8 semanas
    const recent = progressStorage.getAllProgress().slice(0, 14) // 14 dias mais recentes
    const streak = progressStorage.getStreakInfo()

    setWeeklyStats(stats)
    setRecentProgress(recent)
    setStreakInfo(streak)
    setMounted(true)
  }, [])

  const getOverallStats = () => {
    if (recentProgress.length === 0) return null

    const totalDays = recentProgress.length
    const perfectDays = recentProgress.filter((p) => p.adherenceScore >= 90).length
    const averageAdherence = recentProgress.reduce((sum, p) => sum + p.adherenceScore, 0) / totalDays
    const averageCalories = recentProgress.reduce((sum, p) => sum + p.consumedCalories, 0) / totalDays

    return {
      totalDays,
      perfectDays,
      averageAdherence: Math.round(averageAdherence),
      averageCalories: Math.round(averageCalories),
      successRate: Math.round((perfectDays / totalDays) * 100),
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  const formatWeekRange = (start: string, end: string) => {
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  const getAdherenceColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100"
    if (score >= 70) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const overallStats = getOverallStats()

  const chartData = weeklyStats.map((week) => ({
    week: formatWeekRange(week.weekStart, week.weekEnd),
    adherence: week.averageAdherence,
    calories: week.averageCalories,
    perfectDays: week.perfectDays,
  }))

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando progresso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Acompanhamento de Progresso</h1>
            <p className="text-muted-foreground">Histórico e estatísticas da sua jornada nutricional</p>
          </div>
        </div>

        {/* Cards de Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak Atual</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{streakInfo.currentStreak}</div>
              <p className="text-xs text-muted-foreground">dias consecutivos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maior Streak</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{streakInfo.longestStreak}</div>
              <p className="text-xs text-muted-foreground">recorde pessoal</p>
            </CardContent>
          </Card>

          {overallStats && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                  <Target className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{overallStats.successRate}%</div>
                  <p className="text-xs text-muted-foreground">últimos {overallStats.totalDays} dias</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aderência Média</CardTitle>
                  <BarChart3 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{overallStats.averageAdherence}%</div>
                  <p className="text-xs text-muted-foreground">últimos {overallStats.totalDays} dias</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList>
            <TabsTrigger value="weekly">Progresso Semanal</TabsTrigger>
            <TabsTrigger value="daily">Histórico Diário</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aderência Semanal</CardTitle>
                <CardDescription>Evolução da sua consistência ao longo das semanas</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="space-y-4">
                    {chartData.map((week, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="font-medium">{week.week}</div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{week.adherence}% aderência</div>
                            <div className="text-xs text-muted-foreground">{week.calories} kcal média</div>
                          </div>
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${week.adherence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Dados insuficientes para exibir o progresso
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas Semanais */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo das Últimas Semanas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyStats.map((week, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{formatWeekRange(week.weekStart, week.weekEnd)}</div>
                        <div className="text-sm text-muted-foreground">
                          {week.totalDays} dias registrados • {week.perfectDays} dias perfeitos
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge className={getAdherenceColor(week.averageAdherence)}>
                          {week.averageAdherence}% aderência
                        </Badge>
                        <div className="text-sm text-muted-foreground">{week.averageCalories} kcal média</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            {/* Histórico Diário */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico dos Últimos Dias</CardTitle>
                <CardDescription>Detalhamento do seu progresso diário</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentProgress.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="font-medium">{formatDate(day.date)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(day.date).toLocaleDateString("pt-BR", { weekday: "short" })}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle
                              className={`h-4 w-4 ${
                                day.adherenceScore >= 80 ? "text-green-500" : "text-muted-foreground"
                              }`}
                            />
                            <span className="font-medium">
                              {day.completedMeals}/{day.totalMeals} refeições
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {day.consumedCalories}/{day.targetCalories} kcal
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getAdherenceColor(day.adherenceScore)}>{day.adherenceScore}%</Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          P: {day.consumedMacros.protein.toFixed(0)}g | C: {day.consumedMacros.carbs.toFixed(0)}g | G:{" "}
                          {day.consumedMacros.fat.toFixed(0)}g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
