const API_URL = 'http://localhost:3000/contatos';
 
const formContato = document.getElementById('form-contato');
const tituloForm = document.getElementById('titulo-form');
const listaContatos = document.getElementById('lista-contatos-body');
const inputId = document.getElementById('contato-id');
const btnCancelar = document.getElementById('btn-cancelar');
 
async function carregarContatos(query = '') {  
  const resposta = await fetch(`${API_URL}${query}`); 
  const contatos = await resposta.json();
  renderizarContatos(contatos);
}
 
function renderizarContatos(contatos) {
  listaContatos.innerHTML = '';
 
  if (!contatos || contatos.length === 0) {
    const linhaVazia = document.createElement('tr');
    linhaVazia.innerHTML = `<td colspan="5" style="text-align: center; color: #64748b; padding: 20px;">Nenhum contato encontrado.</td>`;
    listaContatos.appendChild(linhaVazia);
    return;
  }

  contatos.forEach((contato) => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${contato.nome}</td>
      <td>${contato.telefone}</td>
      <td>${contato.email ? contato.email : '-'}</td>
      <td>${contato.cidade}</td>
      <td>
        <button class="btn-editar" data-id="${contato.id}">Editar</button>
        <button class="btn-excluir" data-id="${contato.id}">Excluir</button>
      </td>
    `;
    listaContatos.appendChild(linha);
  });
}
 
carregarContatos();

const filtroNome = document.getElementById('filtro-nome');
const filtroCidade = document.getElementById('filtro-cidade');
const btnFiltrar = document.getElementById('btn-filtrar');
const btnLimparFiltro = document.getElementById('btn-limpar-filtro');
 
btnFiltrar.addEventListener('click', () => {
  const parametros = new URLSearchParams();
 
  const nomeValor = filtroNome.value.trim();
  const cidadeValor = filtroCidade.value.trim();

  if (nomeValor !== '') parametros.append('nome', nomeValor);
  if (cidadeValor !== '') parametros.append('cidade', cidadeValor);
 
  const query = parametros.toString();
  carregarContatos(query ? `?${query}` : '');
});
 
btnLimparFiltro.addEventListener('click', () => {
  filtroNome.value = '';
  filtroCidade.value = '';
  carregarContatos();
});

formContato.addEventListener('submit', async (evento) => {
  evento.preventDefault();
 
  const contato = {
    nome: document.getElementById('nome').value,
    telefone: document.getElementById('telefone').value,
    email: document.getElementById('email').value || null,
    cidade: document.getElementById('cidade').value
  };
 
  const id = inputId.value.trim(); 
 
  if (id !== '') {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contato)
    });
  } else {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contato)
    });
  }
 
  resetarFormulario();
  carregarContatos();
});
 
btnCancelar.addEventListener('click', () => {
  resetarFormulario();
});

listaContatos.addEventListener('click', async (evento) => {
  const id = evento.target.dataset.id;
  if (!id) return;
 
  // RF07 – Exclusão com prompt de confirmação
  if (evento.target.classList.contains('btn-excluir')) {
    if (confirm('Tem certeza que deseja remover este contato?')) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      carregarContatos();
    }
    return;
  }

  if (evento.target.classList.contains('btn-editar')) {
    const resposta = await fetch(`${API_URL}/${id}`);
    const contato = await resposta.json();
 
    inputId.value = contato.id;
    document.getElementById('nome').value = contato.nome;
    document.getElementById('telefone').value = contato.telefone;
    document.getElementById('email').value = contato.email ?? '';
    document.getElementById('cidade').value = contato.cidade;
    tituloForm.textContent = `Editando: ${contato.nome}`;
  }
});

function resetarFormulario() {
  formContato.reset();
  inputId.value = '';
  tituloForm.textContent = 'Cadastrar Contato';
}
