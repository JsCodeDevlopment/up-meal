"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft, User, Activity, Target, Utensils, Heart } from "lucide-react"

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void
}

interface UserProfile {
  gender: string
  age: number
  weight: number
  height: number
  bodyFat?: number
  activityLevel: string
  goal: string
  foodPreferences: string[]
  mealFrequency: number
  avoidedFoods: string[]
}

const icons = {
  User,
  Activity,
  Target,
  Utensils,
  Heart,
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    foodPreferences: [],
    avoidedFoods: [],
    mealFrequency: 5,
  })

  const steps = [
    { title: "Dados Pessoais", icon: "User" },
    { title: "Atividade Física", icon: "Activity" },
    { title: "Objetivo", icon: "Target" },
    { title: "Preferências Alimentares", icon: "Heart" },
    { title: "Frequência de Refeições", icon: "Utensils" },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(profile as UserProfile)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateProfile = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return profile.gender && profile.age && profile.weight && profile.height
      case 1:
        return profile.activityLevel
      case 2:
        return profile.goal
      case 3:
        return true // Preferences are optional
      case 4:
        return profile.mealFrequency && profile.mealFrequency >= 3 && profile.mealFrequency <= 6
      default:
        return false
    }
  }

  const toggleFoodPreference = (food: string) => {
    const current = profile.foodPreferences || []
    if (current.includes(food)) {
      updateProfile(
        "foodPreferences",
        current.filter((f) => f !== food),
      )
    } else {
      updateProfile("foodPreferences", [...current, food])
    }
  }

  const toggleAvoidedFood = (food: string) => {
    const current = profile.avoidedFoods || []
    if (current.includes(food)) {
      updateProfile(
        "avoidedFoods",
        current.filter((f) => f !== food),
      )
    } else {
      updateProfile("avoidedFoods", [...current, food])
    }
  }

  const renderIcon = () => {
    const IconComponent = icons[steps[currentStep].icon as keyof typeof icons]
    return IconComponent ? <IconComponent className="w-6 h-6 text-primary" /> : null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">NutriPlan</h1>
          <p className="text-muted-foreground">Seu planejamento nutricional personalizado</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              {renderIcon()}
            </div>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>
              {currentStep === 0 && "Vamos conhecer você melhor"}
              {currentStep === 1 && "Qual seu nível de atividade física?"}
              {currentStep === 2 && "Qual é o seu objetivo?"}
              {currentStep === 3 && "Quais alimentos você prefere?"}
              {currentStep === 4 && "Quantas refeições você quer fazer por dia?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 0 && (
              <>
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <RadioGroup value={profile.gender} onValueChange={(value) => updateProfile("gender", value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masculino" id="masculino" />
                      <Label htmlFor="masculino">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="feminino" id="feminino" />
                      <Label htmlFor="feminino">Feminino</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={profile.age || ""}
                      onChange={(e) => updateProfile("age", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={profile.weight || ""}
                      onChange={(e) => updateProfile("weight", Number.parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={profile.height || ""}
                      onChange={(e) => updateProfile("height", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bodyFat">% Gordura (opcional)</Label>
                    <Input
                      id="bodyFat"
                      type="number"
                      placeholder="15"
                      value={profile.bodyFat || ""}
                      onChange={(e) => updateProfile("bodyFat", Number.parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 1 && (
              <div className="space-y-2">
                <Label>Nível de Atividade Física</Label>
                <Select value={profile.activityLevel} onValueChange={(value) => updateProfile("activityLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentario">Sedentário (pouco ou nenhum exercício)</SelectItem>
                    <SelectItem value="leve">Leve (exercício leve 1-3 dias/semana)</SelectItem>
                    <SelectItem value="moderado">Moderado (exercício moderado 3-5 dias/semana)</SelectItem>
                    <SelectItem value="intenso">Intenso (exercício pesado 6-7 dias/semana)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-2">
                <Label>Objetivo</Label>
                <RadioGroup value={profile.goal} onValueChange={(value) => updateProfile("goal", value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="perder" id="perder" />
                    <Label htmlFor="perder">Perder peso</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manter" id="manter" />
                    <Label htmlFor="manter">Manter peso</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ganhar" id="ganhar" />
                    <Label htmlFor="ganhar">Ganhar peso</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Alimentos que você gosta:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Frango",
                      "Peixe",
                      "Carne Vermelha",
                      "Ovos",
                      "Arroz",
                      "Batata Doce",
                      "Aveia",
                      "Banana",
                      "Brócolis",
                      "Espinafre",
                      "Abacate",
                      "Castanhas",
                    ].map((food) => (
                      <div key={food} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pref-${food}`}
                          checked={profile.foodPreferences?.includes(food) || false}
                          onCheckedChange={() => toggleFoodPreference(food)}
                        />
                        <Label htmlFor={`pref-${food}`} className="text-sm">
                          {food}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Alimentos que você evita:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Lactose",
                      "Glúten",
                      "Carne Vermelha",
                      "Frutos do Mar",
                      "Nozes",
                      "Soja",
                      "Açúcar",
                      "Frituras",
                    ].map((food) => (
                      <div key={food} className="flex items-center space-x-2">
                        <Checkbox
                          id={`avoid-${food}`}
                          checked={profile.avoidedFoods?.includes(food) || false}
                          onCheckedChange={() => toggleAvoidedFood(food)}
                        />
                        <Label htmlFor={`avoid-${food}`} className="text-sm">
                          {food}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mealFreq">Número de refeições por dia</Label>
                  <Select
                    value={profile.mealFrequency?.toString()}
                    onValueChange={(value) => updateProfile("mealFrequency", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione quantas refeições" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 refeições (Café, Almoço, Jantar)</SelectItem>
                      <SelectItem value="4">4 refeições (+ 1 Lanche)</SelectItem>
                      <SelectItem value="5">5 refeições (+ 2 Lanches)</SelectItem>
                      <SelectItem value="6">6 refeições (+ 2 Lanches + Ceia)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {profile.mealFrequency === 3 &&
                      "Ideal para quem tem pouco tempo. Refeições maiores e mais espaçadas."}
                    {profile.mealFrequency === 4 && "Bom equilíbrio entre praticidade e controle da fome."}
                    {profile.mealFrequency === 5 && "Recomendado para melhor controle da fome e metabolismo."}
                    {profile.mealFrequency === 6 && "Ideal para ganho de massa muscular ou melhor digestão."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handleNext} disabled={!isStepValid()}>
            {currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
