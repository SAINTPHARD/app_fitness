# 📋 Guia de Integração: Modal de Adicionar Alimentos

## ✅ ETAPA 1: Componente AddFoodModal.jsx
**Local:** `src/components/dashboard/AddFoodModal.jsx`

### Características:
- ✅ Componente funcional React com hooks
- ✅ Props: `isOpen`, `onClose`, `onSave`, `mealName`
- ✅ Formulário completo com inputs para: Nome, Calorias, Proteínas, Carboidratos, Gorduras
- ✅ Estilização 100% Tailwind CSS
- ✅ Retorna `null` quando `isOpen={false}`
- ✅ Fundo escurecido fixo (fixed inset-0 bg-black bg-opacity-50)
- ✅ Card com sombra e bordas arredondadas
- ✅ Botões: Cancelar e Adicionar

---

## ✅ ETAPA 2: Integração no Dashboard.jsx

### 2.1 - IMPORTAÇÃO
```jsx
import AddFoodModal from '../components/dashboard/AddFoodModal';
```

### 2.2 - ESTADOS MOCKADOS
```jsx
const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
const [selectedMealForFood, setSelectedMealForFood] = useState(null);

const [meals, setMeals] = useState([
  {
    id: 1,
    title: 'Cafe da Manha',
    mealKey: 'cafeDaManha',
    summary: '300g · 686 kcal',
    macros: 'Carb: 104g | Prot: 56g | Gord: 6g | Fib: 13g',
    foods: ['Ovos Mexidos (3 unidades) - 20g Prot, 15g Fat', 'Pao Integral (2 fatias) - 30g Carb'],
  },
  {
    id: 2,
    title: 'Lanche da Manha',
    mealKey: 'lancheDaManha',
    summary: '380g · 526 kcal',
    macros: 'Carb: 81g | Prot: 42g | Gord: 6g | Fib: 12g',
    foods: ['Iogurte Grego (170g) - 18g Prot', 'Banana com Aveia (210g) - 52g Carb'],
  },
  {
    id: 3,
    title: 'Almoco',
    mealKey: 'almoco',
    summary: '450g · 850 kcal',
    macros: 'Carb: 95g | Prot: 65g | Gord: 12g | Fib: 8g',
    foods: ['Frango Grelhado (200g) - 45g Prot', 'Arroz Integral (150g) - 55g Carb', 'Brocolis (100g) - 4g Carb'],
  },
  {
    id: 4,
    title: 'Lanche da Tarde',
    mealKey: 'lancheDaTarde',
    summary: '250g · 350 kcal',
    macros: 'Carb: 40g | Prot: 25g | Gord: 5g | Fib: 6g',
    foods: ['Whey Protein (30g) - 24g Prot', 'Banana (120g) - 27g Carb'],
  },
  {
    id: 5,
    title: 'Jantar',
    mealKey: 'jantar',
    summary: '400g · 720 kcal',
    macros: 'Carb: 70g | Prot: 55g | Gord: 10g | Fib: 9g',
    foods: ['Salmao (180g) - 40g Prot', 'Batata Doce (200g) - 45g Carb', 'Salada Verde (100g) - 3g Carb'],
  },
]);
```

### 2.3 - FUNÇÃO handleAddFood MELHORADA
```jsx
/**
 * Adiciona um alimento à refeição selecionada
 * @param {Object} foodData - Objeto com { name, calories, protein, carbs, fat }
 */
const handleAddFood = (foodData) => {
  if (!selectedMealForFood) return;

  const { name, calories, protein, carbs, fat } = foodData;
  const foodName = name.trim() || 'Novo alimento';
  const formattedFood = `${foodName} - ${calories || '0'} kcal, ${protein || '0'}g Prot, ${carbs || '0'}g Carb, ${fat || '0'}g Fat`;

  setMeals((currentMeals) =>
    currentMeals.map((meal) =>
      meal.id === selectedMealForFood.id
        ? { ...meal, foods: [...meal.foods, formattedFood] }
        : meal,
    ),
  );

  showToast(`Alimento adicionado a ${selectedMealForFood.title}`);
  setIsAddFoodModalOpen(false);
  setSelectedMealForFood(null);
};
```

### 2.4 - FUNÇÃO openAddFoodModal (Helper)
```jsx
/**
 * Abre o modal e define qual refeição será modificada
 * @param {Object} meal - Objeto da refeição
 */
const openAddFoodModal = (meal) => {
  setSelectedMealForFood(meal);
  setIsAddFoodModalOpen(true);
};
```

### 2.5 - RENDERIZAÇÃO NO FINAL DO COMPONENTE
```jsx
{/* Modal de Adicionar Alimento */}
<AddFoodModal
  isOpen={isAddFoodModalOpen}
  onClose={() => {
    setIsAddFoodModalOpen(false);
    setSelectedMealForFood(null);
  }}
  onSave={handleAddFood}
  mealName={selectedMealForFood?.title || 'Refeição'}
/>

{/* Toast de Notificação */}
{toast && (
  <div className="fixed bottom-6 right-6 z-[60] rounded-lg bg-gray-900 px-4 py-3 font-black text-white shadow-[0_18px_46px_rgba(15,23,42,0.22)]">
    {toast}
  </div>
)}
```

### 2.6 - COMO CHAMAR (No componente Meals)
```jsx
onOpenAddFood={openAddFoodModal}

// Onde o botão é clicado, passe o objeto meal:
<button onClick={() => onOpenAddFood(meal)}>
  Adicionar Alimento
</button>
```

---

## 🎯 FLUXO COMPLETO

1. **Usuário clica em "Adicionar Alimento"** em uma refeição
2. `openAddFoodModal(meal)` é chamado
3. `selectedMealForFood` é preenchido com a refeição selecionada
4. `isAddFoodModalOpen` = true → Modal abre
5. Usuário preenche o formulário
6. Clica em "Adicionar"
7. `onSave={handleAddFood}` recebe os dados do alimento
8. `handleAddFood` adiciona à refeição correta no estado
9. Toast confirma: "Alimento adicionado a [Nome da Refeição]"
10. Modal fecha automaticamente

---

## 📊 ESTADO DOS ALIMENTOS

Cada alimento é salvo no formato:
```
"Nome do Alimento - 165 kcal, 31g Prot, 0g Carb, 4g Fat"
```

---

## 🚀 PRÓXIMOS PASSOS

- [ ] Conectar a API real de refeições
- [ ] Persistir dados no banco de dados
- [ ] Adicionar edição de alimentos
- [ ] Adicionar confirmação de exclusão
- [ ] Implementar filtros por tipo de alimento

