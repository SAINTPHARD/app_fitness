package com.appfitness.service;

import org.springframework.stereotype.Service;
import com.appfitness.model.entity.Usuario;
/**
 * Serviço para cálculos relacionados à saúde e fitness, como TMB, calorias totais, macronutrientes e IMC.
 * 
 * Responsável por:
 * - Calcular a Taxa Metabólica Basal (TMB) usando fórmulas como Harris-Benedict.
 * - Calcular o gasto calórico total diário baseado no nível de atividade física.
 * - Calcular a distribuição de macronutrientes (proteínas, carboidratos, gorduras).
 * - Calcular o Índice de Massa Corporal (IMC).
 */

@Service
public class CalculoService {

    /**
     * 1.Calcula a Taxa Metabólica Basal (TMB) usando a fórmula de Harris-Benedict.
     */
    public double calcularTMB(Usuario usuario) {
        if (usuario.getSexo() == 'M' || usuario.getSexo() == 'm') {
            return 88.36 + (13.4 * usuario.getPeso()) + (4.8 * usuario.getAltura()) - (5.7 * usuario.getIdade());
        } else {
            return 447.6 + (9.2 * usuario.getPeso()) + (3.1 * usuario.getAltura()) - (4.3 * usuario.getIdade());
        }
    }

    /**
     * 2.Calcula o gasto calórico total diário baseado no nível de atividade física.
     * Fatores comuns: Sedentário (1.2), Leve (1.375), Moderado (1.55), Intenso (1.725)
     */
    public double calcularCaloriasTotais(Usuario usuario, double fatorAtividade) {
        return calcularTMB(usuario) * fatorAtividade;
    }

   
    /**
     * 3.Calcula Macros específicos para Hipertrofia:
     * Proteína: 2g por kg de peso
     * Gordura: 1g por kg de peso
     * Carboidratos: O restante das calorias
     */
    public String calcularMacrosAtleta(Usuario usuario, double caloriasTotais) {
        double proteinas = usuario.getPeso() * 2; // 2g/kg
        double gorduras = usuario.getPeso() * 1;  // 1g/kg
        
        // Calculando quanto de caloria sobrou para os carbos
        double caloriasRestantes = caloriasTotais - (proteinas * 4) - (gorduras * 9);
        double carboidratos = caloriasRestantes / 4;

        return String.format("Proteínas: %.2fg, Carboidratos: %.2fg, Gorduras: %.2fg", 
                             proteinas, carboidratos, gorduras);
    }
    
    /**
     * 4.Calcula o IMC (Índice de Massa Corporal)
     */
    public double calcularIMC(Usuario usuario) {
        // Altura deve estar em metros (ex: 1.75)
        double alturaMetros = usuario.getAltura() / 100; 
        return usuario.getPeso() / (alturaMetros * alturaMetros);
    }
}
