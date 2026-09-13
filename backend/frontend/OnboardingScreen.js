import React, {useState} from 'react';
import {View, Text, TextInput, Button, Picker, Platform} from 'react-native';
import axios from './api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tela de onboarding / cadastro mínima
export default function OnboardingScreen({navigation}) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [idade, setIdade] = useState('25');
  const [peso, setPeso] = useState('70');
  const [altura, setAltura] = useState('175');
  const [sexo, setSexo] = useState('M');
  const [objetivo, setObjetivo] = useState('EMAGRECER');

  const cadastrar = async () => {
    try {
      const payload = {
        nome,
        email,
        senha,
        idade: parseInt(idade, 10),
        peso: parseFloat(peso),
        altura: parseFloat(altura),
        sexo: sexo.charAt(0),
        objetivo
      };
      const res = await axios.post('/usuarios', payload);
      // salva token retornado e navega para dashboard
      if (res.data && res.data.token) {
        await AsyncStorage.setItem('token', res.data.token);
        await AsyncStorage.setItem('usuarioId', String(res.data.usuarioId));
      }
      navigation.navigate('Dashboard');
    } catch (err) {
      console.error(err);
      alert('Erro no cadastro');
    }
  };

  return (
    <View style={{padding:20}}>
      <Text>Cadastro</Text>
      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
      <TextInput placeholder="Idade" value={idade} onChangeText={setIdade} keyboardType="numeric" />
      <TextInput placeholder="Peso (kg)" value={peso} onChangeText={setPeso} keyboardType="numeric" />
      <TextInput placeholder="Altura (cm)" value={altura} onChangeText={setAltura} keyboardType="numeric" />

      <Text>Sexo</Text>
      {Platform.OS === 'ios' ? (
        <Picker selectedValue={sexo} onValueChange={v=>setSexo(v)}>
          <Picker.Item label="Masculino" value="M" />
          <Picker.Item label="Feminino" value="F" />
        </Picker>
      ) : (
        <View>
          <Button title={sexo} onPress={() => setSexo(sexo === 'M' ? 'F' : 'M')} />
        </View>
      )}

      <Text>Objetivo</Text>
      <Picker selectedValue={objetivo} onValueChange={v=>setObjetivo(v)}>
        <Picker.Item label="Emagrecer" value="EMAGRECER" />
        <Picker.Item label="Manter" value="MANTER" />
        <Picker.Item label="Hipertrofia" value="HIPERTROFIA" />
      </Picker>

      <Button title="Cadastrar" onPress={cadastrar} />
    </View>
  );
}
