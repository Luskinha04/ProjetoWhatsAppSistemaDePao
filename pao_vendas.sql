CREATE DATABASE pao_vendas;

USE pao_vendas;

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente VARCHAR(255) NOT NULL,
    quantidade INT NOT NULL,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estoque (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quantidade INT NOT NULL
);

INSERT INTO estoque (quantidade) VALUES (1000);

select * from pao_vendas .estoque;

select * from pao_vendas .pedidos;