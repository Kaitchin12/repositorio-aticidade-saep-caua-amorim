const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
const cors = require('cors');
const app = express();
app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Amorim#2210",
    database: "saep_db_new"
});


connection.connect((err) => {
    if (err) {
        console.log("Erro ao conectar no banco:", err.message);
        return;
    }
    console.log("Banco conectado com sucesso!");
});

app.use(express.static(path.join(__dirname, "../front-end")));




app.post("/cadastroUsuario", (req, res) => {
    const { nome,email,senha } = req.body;

    const sql = "INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)";

    connection.query(sql, [nome, email,senha], (err) => {
        if (err) {
            console.error("Erro ao cadastrar tarefa:", err.message);
            return res.status(500).send("Erro ao salvar no banco.");
        }

        res.send("Tarefa cadastrada com sucesso!");
    });
});


app.post("/login", (req, res) => {
    const { email,senha } = req.body;

        const sql = "SELECT * FROM usuario WHERE email = ? AND senha = ?";

    connection.query(sql, [email,senha], (err,results) => {
       if (err) {
            return res.status(500).send("Erro no servidor.");
        }

        // Se a lista de resultados for maior que 0, achou o usuário!
        if (results.length > 0) {
            // Sucesso (Status 200)
            res.status(200).send("Login realizado com sucesso!");
        } else {
            // Falha (Status 401 - Não autorizado)
            res.status(401).send("Email ou senha incorretos.");
        }
    });
});






app.post("/produtoCadastro", (req, res) => {
    const { nome_prod,preco,quantidade } = req.body;

    const sql = "INSERT INTO produto (nome_prod, preco, quantidade) VALUES (?, ?, ?)";

    connection.query(sql, [nome_prod, preco,quantidade], (err) => {
        if (err) {
            console.error("Erro ao cadastrar tarefa:", err.message);
            return res.status(500).send("Erro ao salvar no banco.");
        }

        res.send("produto cadastrada com sucesso!");
    });
});




    app.get("/mostrarProduto", (req,res) => {
    

        const sql = `SELECT * FROM produto `;

        connection.query(sql, (err, results) => {
            if (err) {
                console.error("Erro ao listar Produtos:", err.message);
                return res.status(500).send("Erro ao buscar dados.");
            }

            res.json(results);
        });
    });

    app.put("/editarProduto", (req,res) => {
          const {id, nome_prod, preco, quantidade } = req.body;

    const sql = "UPDATE produto SET nome_prod = ?, preco = ?, quantidade = ? WHERE id = ?";

    connection.query(sql,[ nome_prod, preco, quantidade,id], (err) => {
        if (err) {
            console.error("Erro ao editar tarefa:", err.message);
            return res.status(500).send("Erro ao salvar no banco.");
        }

        res.send("Tarefa editada com sucesso!");
    });

    })


    app.delete("/deletarProduto/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM produto WHERE id=?";

    connection.query(sql, [id], (err) => {
        if (err) {
            console.error("Erro ao excluir:", err.message);
            return res.status(500).send("Erro ao excluir.");
        }

        res.send("Tarefa excluída com sucesso.");
    });
});



app.post('/movimentacao', (req, res) => {
    // Verifica se o corpo é uma LISTA (Array) ou um objeto único
    const dados = Array.isArray(req.body) ? req.body : [req.body];

    // Vamos processar todos os itens da lista
    const promessas = dados.map(item => {
        return new Promise((resolve, reject) => {
            // Se vier do modal de checkbox, as chaves podem ser diferentes, ajustamos aqui:
            const id_produto = item.id_produto || item.id; 
            const quantidade = item.quantidade;
            const tipo = item.tipo || 'SAIDA'; // Se vier do modal, assumimos SAIDA
            const observacao = item.observacao || 'Baixa em Massa';

            // 1. Histórico
            const sqlMov = "INSERT INTO movimentacao (id_produto, tipo, quantidade, observacao) VALUES (?, ?, ?, ?)";
            connection.query(sqlMov, [id_produto, tipo, quantidade, observacao], (err) => {
                if (err) return reject(err);

                // 2. Atualiza Estoque
                let sqlUpdate = "";
                if (tipo === 'ENTRADA') sqlUpdate = "UPDATE produto SET quantidade = quantidade + ? WHERE id = ?";
                else sqlUpdate = "UPDATE produto SET quantidade = quantidade - ? WHERE id = ?";

                connection.query(sqlUpdate, [quantidade, id_produto], (errUpdate) => {
                    if (errUpdate) return reject(errUpdate);
                    resolve();
                });
            });
        });
    });

    // Espera todos terminarem
    Promise.all(promessas)
        .then(() => res.status(200).send("Movimentações realizadas!"))
        .catch((err) => res.status(500).send("Erro: " + err.message));
});



app.listen(2005, () =>
    console.log("Servidor rodando em http://localhost:2005/login.html")
);
