document.addEventListener('DOMContentLoaded', () => {
  configurarConfirmacoes();
  configurarCamposDeIngresso();
});

/**
 * Exibe uma confirmação antes de ações destrutivas,
 * como excluir eventos ou cancelar inscrições.
 */
function configurarConfirmacoes() {
  const formularios = document.querySelectorAll(
    '[data-confirmacao]'
  );

  formularios.forEach((formulario) => {
    formulario.addEventListener('submit', (event) => {
      const mensagem =
        formulario.dataset.confirmacao ||
        'Tem certeza que deseja continuar?';

      if (!window.confirm(mensagem)) {
        event.preventDefault();
      }
    });
  });
}

/**
 * Alterna os campos específicos de eventos gratuitos
 * e pagos conforme o tipo de ingresso selecionado.
 */
function configurarCamposDeIngresso() {
  const campoTipo = document.querySelector(
    '[name="tipo_ingresso"]'
  );

  if (!campoTipo) {
    return;
  }

  const camposPagos = document.querySelectorAll(
    '[data-ingresso="pago"]'
  );

  const camposGratuitos = document.querySelectorAll(
    '[data-ingresso="gratuito"]'
  );

  const atualizarCampos = () => {
    const tipo = campoTipo.value;

    camposPagos.forEach((campo) => {
      const ativo = tipo === 'pago';

      campo.hidden = !ativo;

      campo
        .querySelectorAll('input, select, textarea')
        .forEach((input) => {
          input.disabled = !ativo;
        });
    });

    camposGratuitos.forEach((campo) => {
      const ativo = tipo === 'gratuito';

      campo.hidden = !ativo;

      campo
        .querySelectorAll('input, select, textarea')
        .forEach((input) => {
          input.disabled = !ativo;
        });
    });
  };

  campoTipo.addEventListener(
    'change',
    atualizarCampos
  );

  atualizarCampos();
}