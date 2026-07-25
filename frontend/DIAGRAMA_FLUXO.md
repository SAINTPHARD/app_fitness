# 🎯 DIAGRAMA VISUAL - Fluxo do Modal de Alimentos

## 📊 Arquitetura do Componente

```
┌─────────────────────────────────────────────────────────────────┐
│                        Dashboard.jsx                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ESTADO                                                   │   │
│  │ • isAddFoodModalOpen: boolean                           │   │
│  │ • selectedMealForFood: Object | null                   │   │
│  │ • meals: Array[5] (Café, Lanche, Almoço, etc)        │   │
│  │ • toast: string                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FUNÇÕES                                                  │   │
│  │ • openAddFoodModal(meal)                               │   │
│  │ • handleAddFood(foodData)                              │   │
│  │ • showToast(message)                                   │   │
│  │ • removeFood(mealId, foodText)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ RENDERIZAÇÃO                                            │   │
│  │ • <HomeView onOpenAddFood={openAddFoodModal} />        │   │
│  │   └─ <Meals onOpenAddFood={onOpenAddFood} />          │   │
│  │ • <AddFoodModal                                        │   │
│  │     isOpen={isAddFoodModalOpen}                        │   │
│  │     onSave={handleAddFood}                             │   │
│  │     mealName={selectedMealForFood?.title}             │   │
│  │ />                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                    AddFoodModal.jsx                             │
│          (Componente reutilizável e independente)              │
│                                                                 │
│  Props:                                                        │
│  • isOpen: boolean                                            │
│  • onClose: function                                          │
│  • onSave: function(foodData)                                │
│  • mealName: string                                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FORM FIELDS                                              │   │
│  │ • Nome do Alimento                                      │   │
│  │ • Calorias (kcal)                                      │   │
│  │ • Proteínas (g)                                        │   │
│  │ • Carboidratos (g)                                    │   │
│  │ • Gorduras (g)                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ BUTTONS                                                  │   │
│  │ [Cancelar] [Adicionar]                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│                    Meals.jsx                                    │
│              (Renderiza as refeições)                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Botão Principal: "Adicionar alimento"                  │   │
│  │ onClick={() => onOpenAddFood(filteredMeals[0])}       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Para cada Refeição:                                     │   │
│  │ ┌─────────────────────────────────────────────────────┐ │   │
│  │ │ Café da Manhã                                     │ │   │
│  │ │ • Ovos Mexidos                                  │ │   │
│  │ │ • Pão Integral                                 │ │   │
│  │ │                                        [+]     │ │   │
│  │ │ onClick={() => onOpenAddFood(meal)}             │ │   │
│  │ └─────────────────────────────────────────────────────┘ │   │
│  │ ┌─────────────────────────────────────────────────────┐ │   │
│  │ │ Almoço                                            │ │   │
│  │ │ • Frango Grelhado                               │ │   │
│  │ │ • Arroz Integral                                │ │   │
│  │ │                                        [+]     │ │   │
│  │ │ onClick={() => onOpenAddFood(meal)}             │ │   │
│  │ └─────────────────────────────────────────────────────┘ │   │
│  │ (Mais 3 refeições...)                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Interação

```
USUÁRIO CLICA EM "+"
        │
        ▼
┌──────────────────────────┐
│ onClick={(e) => {        │
│   onOpenAddFood(meal)    │
│ }}                       │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│ openAddFoodModal(meal)                   │
│ {                                        │
│   setSelectedMealForFood(meal)  ✅      │
│   setIsAddFoodModalOpen(true)   ✅      │
│ }                                        │
└──────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────┐
│ <AddFoodModal                                    │
│   isOpen={true}          ✅                     │
│   mealName="Café da Manhã"    ✅               │
│   onSave={handleAddFood}      ✅               │
│ />                                              │
└──────────────────────────────────────────────────┘
        │
        ▼ (Modal Abre)
┌──────────────────────────────────────┐
│   Modal Renderizado na Tela           │
│                                      │
│  [Input] Nome: Frango Grelhado       │
│  [Input] Calorias: 165               │
│  [Input] Proteínas: 31               │
│  [Input] Carboidratos: 2             │
│  [Input] Gorduras: 4                 │
│                                      │
│  [Cancelar] [Adicionar]             │
└──────────────────────────────────────┘
        │
        │ (Usuário clica "Adicionar")
        ▼
┌────────────────────────────────────────────────────────┐
│ onSave({                                               │
│   name: "Frango Grelhado",                            │
│   calories: "165",                                     │
│   protein: "31",                                       │
│   carbs: "2",                                          │
│   fat: "4"                                             │
│ })                                                     │
└────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│ handleAddFood(foodData)                                      │
│ {                                                            │
│   // Formata o alimento                                      │
│   formattedFood = "Frango Grelhado - 165 kcal, 31g Prot..." │
│                                                              │
│   // Adiciona ao meals correto                              │
│   setMeals(currentMeals =>                                   │
│     currentMeals.map(meal =>                                 │
│       meal.id === selectedMealForFood.id                    │
│         ? { ...meal, foods: [...meal.foods, formattedFood] }│
│         : meal                                               │
│     )                                                        │
│   )                                                          │
│                                                              │
│   // Mostra confirmação                                      │
│   showToast("Alimento adicionado a Café da Manhã")          │
│                                                              │
│   // Fecha modal                                             │
│   setIsAddFoodModalOpen(false)                              │
│   setSelectedMealForFood(null)                              │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ UI ATUALIZA EM TEMPO REAL         │
│                                   │
│ Café da Manhã                     │
│ • Ovos Mexidos                   │
│ • Pão Integral                   │
│ • Frango Grelhado ← NOVO! ✅    │
│                                   │
│ Toast aparece:                    │
│ "Alimento adicionado a..."  ✅   │
└─────────────────────────────────┘
```

---

## 📈 Estado Inicial vs Final

### ANTES (Estado Inicial)
```javascript
meals = [
  {
    id: 1,
    title: "Cafe da Manha",
    foods: [
      "Ovos Mexidos (3 unidades) - 20g Prot, 15g Fat",
      "Pao Integral (2 fatias) - 30g Carb"
    ]
  }
]
```

### DEPOIS (Após Adicionar Alimento)
```javascript
meals = [
  {
    id: 1,
    title: "Cafe da Manha",
    foods: [
      "Ovos Mexidos (3 unidades) - 20g Prot, 15g Fat",
      "Pao Integral (2 fatias) - 30g Carb",
      "Frango Grelhado - 165 kcal, 31g Prot, 2g Carb, 4g Fat"  ← NOVO
    ]
  }
]
```

---

## 🎨 UI Layout do Modal

```
═════════════════════════════════════════════════════════════
┌─────────────────────────────────────────────────────────┐
│  Novo alimento                                [X]       │
│  Adicionar a Café da Manhã                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Nome do Alimento                                       │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Ex: Frango grelhado                              │ │
│  │ [input active with focus ring]                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Calorias (kcal)                                        │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 165                                              │ │
│  │ [input active with focus ring]                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ Proteínas (g)    │  │ Carboidratos (g) │            │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │            │
│  │ │ 31           │ │  │ │ 2            │ │            │
│  │ └──────────────┘ │  │ └──────────────┘ │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                         │
│  Gorduras (g)                                           │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 4                                                │ │
│  │ [input active with focus ring]                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────┐  ┌──────────────────────────┐   │
│  │    Cancelar       │  │      Adicionar           │   │
│  │  (bg-white)       │  │   (bg-teal-600)          │   │
│  └───────────────────┘  └──────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
═════════════════════════════════════════════════════════════
```

---

## 📁 Estrutura de Arquivos

```
frontend/
├── src/
│   ├── components/
│   │   └── dashboard/
│   │       ├── AddFoodModal.jsx       ← ✅ NOVO
│   │       ├── Meals.jsx              ← ✅ MODIFICADO
│   │       ├── MacroChart.jsx
│   │       └── WaterCard.jsx
│   ├── pages/
│   │   └── Dashboard.jsx              ← ✅ MODIFICADO
│   ├── context/
│   │   └── AuthContext.jsx
│   └── ...
│
├── GUIA_MODAL_ALIMENTOS.md            ← 📋 Guia completo
├── EXEMPLOS_MODAL_ALIMENTOS.md        ← 📋 Exemplos de uso
├── CODIGO_COMPLETO.md                 ← 📋 Código fonte
└── ...
```

---

## ✅ Checklist de Implementação

- ✅ Componente `AddFoodModal.jsx` criado
- ✅ Importação no `Dashboard.jsx`
- ✅ Estado `selectedMealForFood` adicionado
- ✅ Estado `meals` com 5 refeições mockadas
- ✅ Função `handleAddFood` implementada
- ✅ Função `openAddFoodModal` implementada
- ✅ Modal renderizado ao final do Dashboard
- ✅ `Meals.jsx` atualizado para passar a refeição
- ✅ Botão "+" de cada refeição funcional
- ✅ Toast de confirmação
- ✅ 100% Tailwind CSS
- ✅ Documentação completa

---

## 🚀 Próximas Funcionalidades

- [ ] Integração com API Backend
- [ ] Persistência de dados (GET/POST/PUT/DELETE)
- [ ] Edição de alimentos existentes
- [ ] Confirmação antes de deletar
- [ ] Busca e filtro de alimentos
- [ ] Histórico de alimentos
- [ ] Sugestões de alimentos populares
- [ ] Cálculo automático de macros
- [ ] Exportar/importar dados
- [ ] Sincronização com banco de dados

