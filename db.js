const mysql = require("mysql"); //importando lib mysql

const db = mysql.createConnection({
  //instanciando objeto de conexão com o db
  host: "localhost",
  user: "root",
  password: "1234",
  database: "pao_vendas",
});

db.connect((err) => {
  //conectando com banco
  if (err) {
    console.error("Erro conectando ao banco de dados:", err); //se houver erro, ha tratamento para o erro nao estourar para o usuário
    return;
  }
  console.log("Conectado ao banco de dados!");
});

function getOrderDetails(orderId) {
  //função para listar pedido por id
  return new Promise((resolve, reject) => {
    //usando uma promise pois o código tem de ser assíncrono
    db.query(
      "SELECT * FROM pedidos WHERE id = ?", //select em tudo que o id for o especificado como parâmetro na função
      [orderId],
      (error, results) => {
        if (error) reject(error); //tratando erros para nao estourar para o usuário
        resolve(results[0]);
      }
    );
  });
}

function updateAmountOrder(orderId, quantity) {
  //função para atualizar os pedidos
  return new Promise((resolve, reject) => {
    //promise pois a query é assíncrona
    db.query(
      "UPDATE pedidos SET quantidade = ? WHERE id = ?", //update tabela de pedidos setando a quantidade
      [quantity, orderId],
      (error, results) => {
        if (error) reject(error); //tratamento de erros
        resolve(results);
      }
    );
  });
}

function createOrder(cliente, quantity) {
  //função para criar o pedido
  return new Promise((resolve, reject) => {
    //promise pois a query é assíncrona
    db.query(
      "INSERT INTO pedidos (cliente, quantidade) VALUES (?, ?)", //inserindo cliente e quantidade na tabela pedidos
      [cliente, quantity],
      (error, results) => {
        if (error) reject(error); //tratamento de erros
        resolve(results);
      }
    );
  });
}

function getStorage() {
  //função para listar a quantidade no estoque
  return new Promise((resolve, reject) => {
    //promise pois a query e assíncrona
    db.query(
      "SELECT quantidade FROM estoque WHERE id = 1", //select na quantidade na tabela de estoque
      (error, results) => {
        if (error) reject(error); //tratamento de erros
        resolve(results[0].quantidade);
      }
    );
  });
}

function updateStorage(newQuantity) {
  //função para atualizar a quantidade no estoque
  return new Promise((resolve, reject) => {
    //promise pois a query e assíncrona
    db.query(
      "UPDATE estoque SET quantidade = ? WHERE id = 1", //query de update na tabela estoque setando uma nova quantidade
      [newQuantity],
      (error, results) => {
        if (error) reject(error); //tratamento de erros
        resolve(results);
      }
    );
  });
}

module.exports = {
  //exportando funções para serem usadas em outro arquivo
  getOrderDetails,
  updateAmountOrder,
  createOrder,
  getStorage,
  updateStorage,
};