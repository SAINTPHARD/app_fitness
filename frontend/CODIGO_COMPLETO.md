# 📄 CÓDIGO COMPLETO - Modal de Alimentos

## 📁 Arquivo: `src/components/dashboard/AddFoodModal.jsx`

```jsx
import { useState } from 'react';

function Icon({ name, size = 18 }) {
  const iconPaths = {
    close: 'M18 6 6 18M6 6l12 12',
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export default function AddFoodModal({ isOpen, onClose, onSave, mealName }) {
  const [foodData, setFoodData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFoodData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(foodData);
    setFoodData({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    });
  };

  const handleCancel = () => {
    setFoodData({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={handleCancel}
      role="presentation"
    >
      <div
        className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Adicionar alimento a ${mealName}`}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="block text-xs font-bold uppercase text-teal-600">Novo alimento</span>
            <h2 className="text-xl font-bold text-gray-900 mt-1">Adicionar a {mealName}</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar modal"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Formulário */}
        <div className="space-y-4">
          {/* Nome do Alimento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Alimento
            </label>
            <input
              type="text"
              placeholder="Ex: Frango grelhado"
              value={foodData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Calorias */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Calorias (kcal)
            </label>
            <input
              type="number"
              placeholder="165"
              value={foodData.calories}
              onChange={(e) => handleChange('calories', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Grid 2x2 para Macros */}
          <div className="grid grid-cols-2 gap-4">
            {/* Proteínas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Proteínas (g)
              </label>
              <input
                type="number"
                placeholder="31"
                value={foodData.protein}
                onChange={(e) => handleChange('protein', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Carboidratos */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Carboidratos (g)
              </label>
              <input
                type="number"
                placeholder="0"
                value={foodData.carbs}
                onChange={(e) => handleChange('carbs', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Gorduras */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gorduras (g)
              </label>
              <input
                type="number"
                placeholder="4"
                value={foodData.fat}
                onChange={(e) => handleChange('fat', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Campo vazio para manter grid */}
            <div />
          </div>
        </div>

        {/* Rodapé com botões */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 📁 Alterações em `src/pages/Dashboard.jsx`

### 1️⃣ Importação
```jsx
import AddFoodModal from '../components/dashboard/AddFoodModal';
```

### 2️⃣ Novos Estados
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

### 3️⃣ Funções Principais
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

/**
 * Abre o modal e define qual refeição será modificada
 * @param {Object} meal - Objeto da refeição
 */
const openAddFoodModal = (meal) => {
  setSelectedMealForFood(meal);
  setIsAddFoodModalOpen(true);
};
```

### 4️⃣ Renderização do Modal (Final do Component)
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

---

## 📁 Alterações em `src/components/dashboard/Meals.jsx`

### Botão Superior (Adicionar Alimento)
```jsx
<button
  className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-black text-white transition hover:bg-teal-800"
  onClick={() => filteredMeals.length > 0 && onOpenAddFood(filteredMeals[0])}
  type="button"
>
  Adicionar alimento
</button>
```

### Botão "+" de Cada Refeição
```jsx
<button
  className="grid h-[42px] w-[42px] place-items-center self-center rounded-full border-0 bg-teal-700 text-white hover:bg-teal-800 transition"
  onClick={() => onOpenAddFood(meal)}
  type="button"
  aria-label={`Adicionar alimento em ${meal.title}`}
>
  +
</button>
```

---

## ✨ Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| `AddFoodModal.jsx` | ✅ CRIADO (novo componente) |
| `Dashboard.jsx` | ✅ Importação do AddFoodModal |
| `Dashboard.jsx` | ✅ Estado `selectedMealForFood` |
| `Dashboard.jsx` | ✅ Estado `meals` com 5 refeições |
| `Dashboard.jsx` | ✅ Função `handleAddFood` melhorada |
| `Dashboard.jsx` | ✅ Função `openAddFoodModal` |
| `Dashboard.jsx` | ✅ Renderização do AddFoodModal no final |
| `Dashboard.jsx` | ✅ Removido modal inline |
| `Meals.jsx` | ✅ Botão superior passa `filteredMeals[0]` |
| `Meals.jsx` | ✅ Botão "+" passa `meal` correto |

---

## 🚀 Como Usar

1. Clique no botão "+" de uma refeição
2. Preencha o formulário
3. Clique em "Adicionar"
4. Veja o alimento ser adicionado em tempo real!

