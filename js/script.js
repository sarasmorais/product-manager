document.addEventListener('DOMContentLoaded', function () {
  const URL_DO_SUPABASE = 'https://jdkfzrkyzviivvpvzovk.supabase.co';
  const CHAVE_ANONIMA = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impka2Z6cmt5enZpaXZ2cHZ6b3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMzIyODksImV4cCI6MjA2MTYwODI4OX0.MlmTThPoNNfnrTyBnERb0aTAlx8bp8xG5TrQ2_-xJV0';

  const supabase = window.supabase.createClient(URL_DO_SUPABASE, CHAVE_ANONIMA);


  function formatarData(textoData) {
    if (!textoData) return '-';

    const data = new Date(textoData);

    // Obtém os componentes da data
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    const hora = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');


    return `${dia}/${mes}/${ano} ${hora}:${minutos}`;
  }


  function formatarPreco(preco) {
    return 'R$ ' + Number(preco).toFixed(2).replace('.', ',');
  }


  async function buscarEMostrarProdutos() {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('id');

      if (error) {
        throw new Error('Erro ao buscar produtos: ' + error.message);
      }

      document.getElementById('mensagemCarregando').style.display = 'none';

      if (!data || data.length === 0) {
        document.getElementById('mensagemErro').style.display = 'block';
        document.getElementById('mensagemErro').textContent = 'Nenhum produto encontrado na tabela.';
        return;
      }

      const corpoTabela = document.getElementById('corpoDaTabela');
      corpoTabela.innerHTML = '';

      data.forEach(produto => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
                    <td>${produto.id}</td>
                    <td>${produto.nome || '-'}</td>
                    <td>${produto.descricao || '-'}</td>
                    <td>${formatarPreco(produto.preco)}</td>
                    <td>
                        <div class="estoque-control">
                            <button type="button" class="btn-estoque" onclick="alterarEstoque(${produto.id}, -1)">−</button>
                            <span id="estoque-valor-${produto.id}">${produto.estoque}</span>
                            <button type="button" class="btn-estoque" onclick="alterarEstoque(${produto.id}, 1)">+</button>
                        </div>
                        <button class="btn-salvar" id="salvar-${produto.id}" onclick="atualizarEstoque(${produto.id})" style="display:none;">Salvar</button>
                    </td>
                    <td>${formatarData(produto.data)}</td>
                `;
        corpoTabela.appendChild(linha);
      });

      document.getElementById('tabelaProdutos').style.display = 'table';
    } catch (erro) {
      document.getElementById('mensagemCarregando').style.display = 'none';
      document.getElementById('mensagemErro').style.display = 'block';
      document.getElementById('mensagemErro').textContent = erro.message;
      console.log('Erro: ', erro);
    }
  }

  buscarEMostrarProdutos();


  window.alterarEstoque = function (id, delta) {
    const span = document.getElementById(`estoque-valor-${id}`);
    let valorAtual = parseInt(span.textContent);

    if (isNaN(valorAtual)) valorAtual = 0;

    const novoValor = Math.max(0, valorAtual + delta);
    span.textContent = novoValor;

    document.getElementById(`salvar-${id}`).style.display = 'inline-block';
  };

  window.atualizarEstoque = async function (id) {
    const span = document.getElementById(`estoque-valor-${id}`);
    const novoEstoque = parseInt(span.textContent);

    try {
      const { error } = await supabase
        .from('produtos')
        .update({ estoque: novoEstoque })
        .eq('id', id);

      if (error) {
        throw new Error('Erro ao atualizar estoque: ' + error.message);
      }


      const btnSalvar = document.getElementById(`salvar-${id}`);
      btnSalvar.textContent = 'Salvo!';
      btnSalvar.classList.add('salvo');

      setTimeout(() => {
        btnSalvar.style.display = 'none';
        btnSalvar.textContent = 'Salvar';
        btnSalvar.classList.remove('salvo');
      }, 1500);
    } catch (erro) {
      alert(erro.message);
    }
  };

  document.getElementById('formAdicionarProduto').addEventListener('submit', async function (event) {
    event.preventDefault();

    const nome = document.getElementById('novoNome').value;
    const descricao = document.getElementById('novaDescricao').value;
    const preco = parseFloat(document.getElementById('novoPreco').value);
    const estoque = parseInt(document.getElementById('novoEstoque').value);

    try {
      const { error } = await supabase
        .from('produtos')
        .insert([{ nome, descricao, preco, estoque }]);

      if (error) {
        throw new Error('Erro ao adicionar produto: ' + error.message);
      }

      const btnSubmit = this.querySelector('button[type="submit"]');
      const textoOriginal = btnSubmit.textContent;
      btnSubmit.textContent = 'Produto Adicionado!';
      btnSubmit.classList.add('sucesso');

      setTimeout(() => {
        btnSubmit.textContent = textoOriginal;
        btnSubmit.classList.remove('sucesso');
        this.reset();
      }, 1500);

      buscarEMostrarProdutos();
    } catch (erro) {
      alert(erro.message);
    }
  });
});