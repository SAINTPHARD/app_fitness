package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.appfitness.model.entity.Serie;
import com.appfitness.repository.SerieRepository;

@ExtendWith(MockitoExtension.class)
class SerieInsercaoServiceTest {

	@Mock
	private SerieRepository serieRepository;

	private SerieInsercaoService serieInsercaoService;

	@BeforeEach
	void setUp() {
		serieInsercaoService = new SerieInsercaoService(serieRepository);
	}

	@Test
	void deveDelegarInsercaoParaSaveAndFlush() {
		Serie serie = new Serie();
		Serie salva = new Serie();
		salva.setId(1L);
		when(serieRepository.saveAndFlush(serie)).thenReturn(salva);

		Serie resultado = serieInsercaoService.inserir(serie);

		assertThat(resultado).isSameAs(salva);
		verify(serieRepository).saveAndFlush(serie);
	}
}
