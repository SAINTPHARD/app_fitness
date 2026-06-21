package com.appfitness.security;

import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.UsuarioRepository;

/**
 * Serviço que integra o repositório de usuários com o Spring Security.
 * Retorna a entidade Usuario (que implementa UserDetails) usada pelo AuthenticationManager.
 */
@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(username);
        if (usuario == null) {
            throw new UsernameNotFoundException("Usuário não encontrado com email: " + username);
        }
        return usuario;
    }
}
