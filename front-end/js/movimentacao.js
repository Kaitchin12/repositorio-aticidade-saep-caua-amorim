/* --- VARIÁVEIS DO MODAL --- */
const modalSaida = document.getElementById("modalSaida");
const btnNovaSaida = document.getElementById("btnNovaSaida");
const btnConfirmar = document.getElementById("btnConfirmarSaida");
const spanClose = document.querySelector(".close-saida");
const listaContainer = document.getElementById("listaProdutosSaida");


const API_URL = "http://localhost:2005"; 

/* --- EVENTOS DO MODAL --- */
if (btnNovaSaida) {
    btnNovaSaida.onclick = function() {
        modalSaida.style.display = "flex";
        carregarProdutosNoModal(); // Carrega a lista atualizada ao abrir
    }
}

if (spanClose) {
    spanClose.onclick = function() {
        modalSaida.style.display = "none";
    }
}

window.onclick = function(event) {
    if (event.target == modalSaida) {
        modalSaida.style.display = "none";
    }
}

/* --- 1. CARREGAR PRODUTOS (GET) --- */
async function carregarProdutosNoModal() {
    listaContainer.innerHTML = "<p>Carregando estoque...</p>";

    try {
        const response = await fetch(`${API_URL}/mostrarProduto`);
        const produtos = await response.json();

        listaContainer.innerHTML = ""; // Limpa a lista

        if (produtos.length === 0) {
            listaContainer.innerHTML = "<p>Nenhum produto cadastrado.</p>";
            return;
        }

        // Cria a lista visualmente
        produtos.forEach(prod => {
            // Cria a linha
            const divRow = document.createElement("div");
            divRow.className = "lista-item-row";

            // Checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = prod.id;
            checkbox.dataset.estoque = prod.quantidade; // Guarda o estoque atual para validar
            checkbox.style.marginRight = "10px";

            // Texto (Nome e Estoque)
            const label = document.createElement("span");
            label.style.flexGrow = "1"; // Ocupa o espaço do meio
            label.innerText = `${prod.nome_prod} (Disponível: ${prod.quantidade})`;

            // Input de Quantidade
            const inputQtd = document.createElement("input");
            inputQtd.type = "number";
            inputQtd.className = "input-qtd-modal";
            inputQtd.placeholder = "Qtd";
            inputQtd.min = "1";
            inputQtd.max = prod.quantidade; // Impede digitar mais que o estoque no HTML
            inputQtd.disabled = true; // Começa desabilitado

            // --- Lógica: Habilitar input só se marcar checkbox ---
            checkbox.addEventListener("change", function() {
                inputQtd.disabled = !this.checked;
                if (this.checked) {
                    inputQtd.focus();
                } else {
                    inputQtd.value = ""; // Limpa se desmarcar
                }
            });

            // Adiciona elementos na linha
            divRow.appendChild(checkbox);
            divRow.appendChild(label);
            divRow.appendChild(inputQtd);

            // Adiciona linha na lista
            listaContainer.appendChild(divRow);
        });

    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        listaContainer.innerHTML = "<p style='color:red'>Erro ao carregar produtos.</p>";
    }
}

/* --- 2. ENVIAR MOVIMENTAÇÃO (POST) --- */
btnConfirmar.onclick = async function() {
    // 1. Coleta os itens marcados
    const checkboxes = document.querySelectorAll("#listaProdutosSaida input[type='checkbox']:checked");
    
    if (checkboxes.length === 0) {
        alert("Selecione pelo menos um item para dar baixa.");
        return;
    }

    const itensParaBaixa = [];
    let erroValidacao = false;

    // 2. Monta o Array de objetos
    checkboxes.forEach(chk => {
        const row = chk.parentElement; // Pega a div pai
        const input = row.querySelector(".input-qtd-modal");
        const qtd = parseInt(input.value);
        const estoqueAtual = parseInt(chk.dataset.estoque);

        // Validações simples
        if (!qtd || qtd <= 0) {
            alert("A quantidade deve ser maior que zero.");
            erroValidacao = true;
            return;
        }
        if (qtd > estoqueAtual) {
            alert(`Erro: Você tentou retirar ${qtd}, mas só tem ${estoqueAtual} no estoque.`);
            erroValidacao = true;
            return;
        }

        // Adiciona ao pacote de envio
        itensParaBaixa.push({
            id_produto: chk.value,
            tipo: "SAIDA", // Forçamos o tipo SAIDA
            quantidade: qtd,
            observacao: "Baixa via Painel (Home)"
        });
    });

    if (erroValidacao) return; // Para se houver erro

    // 3. Faz o Fetch (Envia a lista para o Backend)
    try {
        const response = await fetch(`${API_URL}/movimentacao`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(itensParaBaixa) // Envia o Array completo
        });

        if (response.ok) {
            alert("Sucesso! Saída de estoque registrada.");
            modalSaida.style.display = "none";
            
            // Opcional: Atualizar a tabela de histórico se ela existir
            // carregarHistorico(); 
            
            // Recarrega a página para atualizar os números visuais
            window.location.reload(); 
        } else {
            const msg = await response.text();
            alert("Erro no servidor: " + msg);
        }

    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro ao conectar com o servidor.");
    }
};