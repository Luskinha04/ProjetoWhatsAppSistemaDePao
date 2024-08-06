const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'pao_vendas'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro conectando ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados!');
});

function getOrderDetails(orderId) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM pedidos WHERE id = ?', [orderId], (error, results) => {
            if (error) reject(error);
            resolve(results[0]);
        });
    });
}

function updatePedidoQuantidade(orderId, quantidade) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE pedidos SET quantidade = ? WHERE id = ?', [quantidade, orderId], (error, results) => {
            if (error) reject(error);
            resolve(results);
        });
    });
}

function createPedido(cliente, quantidade) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO pedidos (cliente, quantidade) VALUES (?, ?)', [cliente, quantidade], (error, results) => {
            if (error) reject(error);
            resolve(results);
        });
    });
}

function getEstoque() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT quantidade FROM estoque WHERE id = 1', (error, results) => {
            if (error) reject(error);
            resolve(results[0].quantidade);
        });
    });
}

function updateEstoque(novaQuantidade) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE estoque SET quantidade = ? WHERE id = 1', [novaQuantidade], (error, results) => {
            if (error) reject(error);
            resolve(results);
        });
    });
}

module.exports = {
    getOrderDetails,
    updatePedidoQuantidade,
    createPedido,
    getEstoque,
    updateEstoque
};
