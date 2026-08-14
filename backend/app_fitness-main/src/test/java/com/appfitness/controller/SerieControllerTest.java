package com.appfitness.controller;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import com.appfitness.exception.UsuarioNaoAutenticadoException;
import com.appfitness.service.SerieService;

@ExtendWith(MockitoExtension.class)
class SerieControllerTest {

	@Mock
	private SerieService serieService;

	private SerieController controller;

	@Test
	void deveLancarUsuarioNaoAutenticadoQuandoAuthenticationForNula() {
		controller = new SerieController(serieService);

		assertThatThrownBy(() -> controller.concluir(1L, null))
				.isInstanceOf(UsuarioNaoAutenticadoException.class);
	}

	@Test
	void deveLancarUsuarioNaoAutenticadoQuandoPrincipalNaoForUsuario() {
		controller = new SerieController(serieService);
		Authentication authentication = mock(Authentication.class);
		when(authentication.getPrincipal()).thenReturn("nao-e-um-usuario");

		assertThatThrownBy(() -> controller.concluir(1L, authentication))
				.isInstanceOf(UsuarioNaoAutenticadoException.class);
	}
}
