export interface DailyProgress {
  date: string // YYYY-MM-DD
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
  adherenceScore: number // 0-100
}

export interface WeeklyStats {
  weekStart: string
  weekEnd: string
  averageAdherence: number
  totalDays: number
  perfectDays: number
  averageCalories: number
  averageMacros: {
    protein: number
    carbs: number
    fat: number
  }
}

class ProgressStorage {
  private storageKey = "nutriplan_progress"

  saveProgress(progress: DailyProgress): void {
    const existingData = this.getAllProgress()
    const existingIndex = existingData.findIndex((p) => p.date === progress.date)

    if (existingIndex >= 0) {
      existingData[existingIndex] = progress
    } else {
      existingData.push(progress)
    }

    // Manter apenas os últimos 90 dias
    const sortedData = existingData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 90)

    localStorage.setItem(this.storageKey, JSON.stringify(sortedData))
  }

  getAllProgress(): DailyProgress[] {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  getProgressByDate(date: string): DailyProgress | null {
    const allProgress = this.getAllProgress()
    return allProgress.find((p) => p.date === date) || null
  }

  getWeeklyProgress(weeksBack = 4): WeeklyStats[] {
    const allProgress = this.getAllProgress()
    const weeks: WeeklyStats[] = []

    for (let i = 0; i < weeksBack; i++) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i))
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const weekProgress = allProgress.filter((p) => {
        const progressDate = new Date(p.date)
        return progressDate >= weekStart && progressDate <= weekEnd
      })

      if (weekProgress.length > 0) {
        const averageAdherence = weekProgress.reduce((sum, p) => sum + p.adherenceScore, 0) / weekProgress.length
        const perfectDays = weekProgress.filter((p) => p.adherenceScore >= 90).length
        const averageCalories = weekProgress.reduce((sum, p) => sum + p.consumedCalories, 0) / weekProgress.length

        const averageMacros = {
          protein: weekProgress.reduce((sum, p) => sum + p.consumedMacros.protein, 0) / weekProgress.length,
          carbs: weekProgress.reduce((sum, p) => sum + p.consumedMacros.carbs, 0) / weekProgress.length,
          fat: weekProgress.reduce((sum, p) => sum + p.consumedMacros.fat, 0) / weekProgress.length,
        }

        weeks.push({
          weekStart: weekStart.toISOString().split("T")[0],
          weekEnd: weekEnd.toISOString().split("T")[0],
          averageAdherence: Math.round(averageAdherence),
          totalDays: weekProgress.length,
          perfectDays,
          averageCalories: Math.round(averageCalories),
          averageMacros,
        })
      }
    }

    return weeks.reverse() // Mais recente primeiro
  }

  calculateAdherenceScore(
    completedMeals: number,
    totalMeals: number,
    consumedCalories: number,
    targetCalories: number,
  ): number {
    const mealScore = (completedMeals / totalMeals) * 50 // 50% do score
    const calorieAccuracy = Math.max(0, 100 - Math.abs((consumedCalories / targetCalories - 1) * 100))
    const calorieScore = (calorieAccuracy / 100) * 50 // 50% do score

    return Math.round(mealScore + calorieScore)
  }

  getStreakInfo(): { currentStreak: number; longestStreak: number } {
    const allProgress = this.getAllProgress().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Calcular streak atual
    for (const progress of allProgress) {
      if (progress.adherenceScore >= 80) {
        if (currentStreak === 0) currentStreak = 1
        else currentStreak++
      } else {
        break
      }
    }

    // Calcular maior streak
    for (const progress of allProgress) {
      if (progress.adherenceScore >= 80) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    return { currentStreak, longestStreak }
  }
}

export const progressStorage = new ProgressStorage()
