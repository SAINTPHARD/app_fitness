import { Component } from 'react';
import PropTypes from 'prop-types';
import { reportarErro } from '../utils/errorReporting';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { falhou: false };
  }

  static getDerivedStateFromError() {
    return { falhou: true };
  }

  componentDidCatch(error, errorInfo) {
    reportarErro(error, {
      origem: 'ErrorBoundary',
      componentStack: errorInfo?.componentStack,
    });
  }

  recarregarAplicacao = () => {
    window.location.reload();
  }

  render() {
    if (this.state.falhou) {
      return (
        <div className="app-shell-loading">
          <div className="app-shell-spinner" role="alert">
            <p>Algo saiu do esperado.</p>
            <button type="button" className="btnSecundario" onClick={this.recarregarAplicacao}>
              Recarregar aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
