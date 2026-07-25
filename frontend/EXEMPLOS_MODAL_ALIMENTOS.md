# 🎨 EXEMPLOS DE USO - Modal de Alimentos

## 📱 Como o Modal Aparece

### Visualização do Modal Aberto
```
┌─────────────────────────────────────┐
│  Novo alimento          [X]         │
│  Adicionar a Café da Manhã          │
├─────────────────────────────────────┤
│                                     │
│  Nome do Alimento                   │
│  ┌──────────────────────────────┐   │
│  │ Ex: Frango grelhado         │   │
│  └──────────────────────────────┘   │
│                                     │
│  Calorias (kcal)                    │
│  ┌──────────────────────────────┐   │
│  │ 165                          │   │
│  └──────────────────────────────┘   │
│                                     │
│  Proteínas (g)    Carboidratos (g)  │
│  ┌──────────┐     ┌──────────────┐  │
│  │ 31       │     │ 0            │  │
│  └──────────┘     └──────────────┘  │
│                                     │
│  Gorduras (g)                       │
│  ┌──────────────────────────────┐   │
│  │ 4                            │   │
│  └──────────────────────────────┘   │
│                                     │
│  [Cancelar]  [Adicionar]           │
│                                     │
└─────────────────────────────────────┘
```

---

## 💻 Exemplo de Dados No React DevTools

### Estado `selectedMealForFood`
```javascript
{
  id: 1,
  title: "Cafe da Manha",
  mealKey: "cafeDaManha",
  summary: "300g · 686 kcal",
  macros: "Carb: 104g | Prot: 56g | Gord: 6g | Fib: 13g",
  foods: [
    "Ovos Mexidos (3 unidades) - 20g Prot, 15g Fat",
    "Pao Integral (2 fatias) - 30g Carb"
  ]
}
```

### Dados Preenchidos no Formulário
```javascript
// O que o usuário digita:
{
  name: "Frango Grelhado",
  calories: "165",
  protein: "31",
  carbs: "2",
  fat: "4"
}

// Transforma em:
"Frango Grelhado - 165 kcal, 31g Prot, 2g Carb, 4g Fat"

// E adiciona ao array foods da refeição:
foods: [
  "Ovos Mexidos (3 unidades) - 20g Prot, 15g Fat",
  "Pao Integral (2 fatias) - 30g Carb",
  "Frango Grelhado - 165 kcal, 31g Prot, 2g Carb, 4g Fat"  // ← NOVO
]
```

---

## 🔄 Sequência de Eventos Completa

### 1️⃣ Clique no Botão "+"
```jsx
<button onClick={() => onOpenAddFood(meal)}>
  +
</button>
```

### 2️⃣ Função Abrir Modal
```jsx
const openAddFoodModal = (meal) => {
  setSelectedMealForFood(meal);      // Salva qual refeição editar
  setIsAddFoodModalOpen(true);       // Abre o modal
};
```

### 3️⃣ Modal Recebe Props
```jsx
<AddFoodModal
  isOpen={isAddFoodModalOpen}         // true
  onClose={() => {...}}              // Fecha modal
  onSave={handleAddFood}             // Salva dados
  mealName={selectedMealForFood?.title}  // "Café da Manhã"
/>
```

### 4️⃣ Usuário Preenche e Clica "Adicionar"
```jsx
// Modal chama:
onSave({
  name: "Frango",
  calories: "165",
  protein: "31",
  carbs: "2",
  fat: "4"
})
```

### 5️⃣ Função Processa e Salva
```jsx
const handleAddFood = (foodData) => {
  // ✅ Formata: "Frango - 165 kcal, 31g Prot, 2g Carb, 4g Fat"
  // ✅ Adiciona ao meals[0].foods (pois selectedMealForFood.id = 1)
  // ✅ Mostra toast: "Alimento adicionado a Café da Manhã"
  // ✅ Fecha modal
  // ✅ Limpa selectedMealForFood
};
```

### 6️⃣ UI Atualiza em Tempo Real
```jsx
// Antes:
Café da Manhã
├─ Ovos Mexidos (3 unidades) - 20g Prot, 15g Fat
└─ Pão Integral (2 fatias) - 30g Carb

// Depois:
Café da Manhã
├─ Ovos Mexidos (3 unidades) - 20g Prot, 15g Fat
├─ Pão Integral (2 fatias) - 30g Carb
└─ Frango Grelhado - 165 kcal, 31g Prot, 2g Carb, 4g Fat  ← NOVO
```

---

## 🧪 Teste Manual

### Passo 1: Abrir Dashboard
```bash
npm run dev
```

### Passo 2: Clicar no Botão "+"
Cada refeição tem um botão "+" no canto direito

### Passo 3: Preencher o Formulário
- Nome: "Frango Grelhado"
- Calorias: "165"
- Proteínas: "31"
- Carboidratos: "2"
- Gorduras: "4"

### Passo 4: Clicar "Adicionar"
Você deve ver:
- ✅ O alimento aparece na lista da refeição
- ✅ Toast no canto inferior direito: "Alimento adicionado a Café da Manhã"
- ✅ Modal fecha automaticamente

### Passo 5: Verificar React DevTools
```
meals[0].foods = [
  "Ovos Mexidos (3 unidades) - 20g Prot, 15g Fat",
  "Pao Integral (2 fatias) - 30g Carb",
  "Frango Grelhado - 165 kcal, 31g Prot, 2g Carb, 4g Fat"
]
```

---

## 📊 Refeições Disponíveis (Mock)

| ID | Título | Macros | Foods |
|----|--------|--------|-------|
| 1 | Café da Manhã | Carb: 104g \| Prot: 56g \| Gord: 6g | 2 items |
| 2 | Lanche da Manhã | Carb: 81g \| Prot: 42g \| Gord: 6g | 2 items |
| 3 | Almoço | Carb: 95g \| Prot: 65g \| Gord: 12g | 3 items |
| 4 | Lanche da Tarde | Carb: 40g \| Prot: 25g \| Gord: 5g | 2 items |
| 5 | Jantar | Carb: 70g \| Prot: 55g \| Gord: 10g | 3 items |

---

## 🎯 CSS Tailwind Utilizado

### Modal Container
```
fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center
```

### Card
```
bg-white p-6 rounded-xl w-full max-w-md shadow-2xl
```

### Inputs
```
w-full px-4 py-2 border border-gray-300 rounded-lg 
focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
```

### Botões
```
Cancelar: flex-1 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50
Adicionar: flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700
```

---

## ✨ Funcionalidades Prontas

✅ Modal reutilizável e independente  
✅ Formulário com validação de dados  
✅ Adição dinâmica a qualquer refeição  
✅ Toast de confirmação  
✅ Limpeza automática do formulário  
✅ 100% Tailwind CSS  
✅ Responsivo  
✅ Acessibilidade (ARIA labels)  

