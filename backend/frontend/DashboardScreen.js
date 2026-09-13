import React, {useEffect, useState} from 'react';
import {View, Text, Button} from 'react-native';
import axios from './api/axiosConfig';

export default function DashboardScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // substituir usuarioId por valor real após login
    const usuarioId = 1;
    axios.get(`/usuarios/${usuarioId}/dashboard`).then(res => setData(res.data)).catch(err => console.error(err));
  }, []);

  if (!data) return <View><Text>Carregando...</Text></View>;

  const restante = data.restante;
  const meta = data.metaCalorias;
  const consumido = data.caloriasConsumidas;
  const percentual = Math.round(((consumido / meta) * 100) || 0);

  return (
    <View style={{padding:20}}>
      <Text>Meta diária: {meta.toFixed(0)} kcal</Text>
      <Text>Consumido: {consumido.toFixed(0)} kcal</Text>
      <Text>Restante: {restante.toFixed(0)} kcal</Text>

      <View style={{height:20, backgroundColor:'#eee', marginTop:12}}>
        <View style={{height:20, width:`${Math.min(100, percentual)}%`, backgroundColor:'#4caf50'}} />
      </View>

      <Text style={{marginTop:12}}>Macros (alvo):</Text>
      <Text>Proteínas: {data.macrosTarget.proteinas} g</Text>
      <Text>Carboidratos: {data.macrosTarget.carboidratos} g</Text>
      <Text>Gorduras: {data.macrosTarget.gorduras} g</Text>

    </View>
  );
}
