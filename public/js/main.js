/**
 * Exibe uma confirmação antes de ações destrutivas,
 * como excluir eventos ou cancelar inscrições.
 */
document.addEventListener('DOMContentLoaded', () => {
  const formulariosConfirmacao = document.querySelectorAll(
    '[data-confirmacao]'
  );

  formulariosConfirmacao.forEach((formulario) => {
    formulario.addEventListener('submit', (event) => {
      const mensagem =
        formulario.dataset.confirmacao ||
        'Tem certeza que deseja continuar?';

      const confirmado = window.confirm(mensagem);

      if (!confirmado) {
        event.preventDefault();
      }
    });
  });
});