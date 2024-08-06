const venom = require('venom-bot');
const { getOrderDetails, updatePedidoQuantidade, createPedido, getEstoque, updateEstoque } = require('./db');

let awaitingQuantity = false;
let currentClient = null;
const precoPorPao = 15;

async function start(client) {
    client.onMessage(async (msg) => {
        const messageBody = msg.body.toLowerCase();

        if (messageBody.includes('realizar pedido') || messageBody.includes('gostaria de realizar um pedido')) {
            currentClient = msg.from;
            awaitingQuantity = true;
            client.sendText(msg.from, `Olá! Tudo bem? 🌟 Quantos pães você gostaria de pedir hoje? 🥖😊`);
            return;
        }

        if (awaitingQuantity && msg.from === currentClient) {
            const quantidade = parseInt(msg.body, 10);

            if (isNaN(quantidade) || quantidade <= 0) {
                client.sendText(msg.from, 'Por favor, envie um número válido de pães para o pedido. 🙏');
                return;
            }

            try {
                const estoqueAtual = await getEstoque();

                if (quantidade > estoqueAtual) {
                    client.sendText(msg.from, `Desculpe, temos apenas ${estoqueAtual} pães em estoque. 🥖`);
                    awaitingQuantity = false;
                    currentClient = null;
                    return;
                }

                await createPedido('cliente', quantidade);
                await updateEstoque(estoqueAtual - quantidade);

                const total = quantidade * precoPorPao;
                client.sendText(msg.from, `Pedido realizado com sucesso! 🎉 ${quantidade} unidades foram reservadas. Restam ${estoqueAtual - quantidade} unidades em estoque. 🥖`);
                client.sendText(msg.from, `O valor total do seu pedido é R$${total}. O único método de pagamento é PIX, e a chave é 123.456.789.00. Assim que for efetuado o pagamento, favor enviar comprovante e aguardar a nossa resposta para marcar o local de entrega.`);
                
                awaitingQuantity = false;
                currentClient = null;
            } catch (error) {
                console.error('Erro ao processar o pedido:', error);
                client.sendText(msg.from, 'Ocorreu um erro ao processar seu pedido. Por favor, tente novamente mais tarde.');
                awaitingQuantity = false;
                currentClient = null;
            }
        }
    });
}

venom
    .create({
        session: 'new-session',
        multidevice: true,
        headless: true,
        useChrome: true,
        disableSpins: true,
        debug: true,
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });
