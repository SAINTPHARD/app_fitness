import { Component } from 'react';
import { reportarErro } from '../utils/errorReporting';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { falhou: false };
  }

  static getDerivedStateFromError() {
    return { falhou: true };
  }

  componentDidCatch(error) {
    reportarErro(error, { origem: 'ErrorBoundary' });
  }

  render() {
    if (this.state.falhou) {
      return (
        <div className="app-shell-loading">
          <div className="app-shell-spinner">Algo saiu do esperado. Atualize a página para tentar novamente.</div>
        </div>
      );
    }

    return this.props.children;
  }
}
