const venom = require("venom-bot"); //importando lib venom bot

const { createOrder, getStorage, updateStorage } = require("./db"); //desestruturação dos imports de ./db

let awaitingQuantity = false; //variável para controlar o momento em que o programa espera o cliente dizer quantos pães ele deseja
let currentClient = null; //variável para controlar se ha um cliente
const breadPrice = 15; //preço definido de cada pão

async function start(client) {
  //funçao de start do programa (recebe o WhatsApp que servira de "host")
  client.onMessage(async (msg) => {
    //quando o host recebe a mensagem
    const messageBody = msg.body.toLowerCase(); //todo o corpo da mensagem para minusculo (facilita a leitura dos dados)

    if (
      //checagem de mensagens especiais que começam o programa
      messageBody.includes("realizar pedido") ||
      messageBody.includes("gostaria de realizar um pedido")
    ) {
      currentClient = msg.from; //cliente recebe a informação de que mandou a mensagem
      awaitingQuantity = true; //começa a espera pela mensagem do cliente
      client.sendText(
        //envia a mensagem para o cliente
        msg.from,
        `Olá! Tudo bem? 🌟 Quantos pães você gostaria de pedir hoje? 🥖😊`
      );
      return;
    }

    if (awaitingQuantity && msg.from === currentClient) {
      //se awaitingQuantity for verdadeiro e o cliente do momento for igual ao client que mandou a mensagem no momento
      const quantidade = parseInt(msg.body, 10); //quantidade recebe o body da mensagem sendo passado para inteiro na base decimal

      if (isNaN(quantidade) || quantidade <= 0) {
        //se a quantidade nao for um numero ou a quantidade for menor ou igual a 0
        //o host manda mensagem falando que a quantidade nao é valida
        client.sendText(
          msg.from,
          "Por favor, envie um número válido de pães para o pedido. 🙏"
        );
        return;
      }

      try {
        const estoqueAtual = await getStorage(); // recebe a quantidade em estoque da função getStorage(importada de ./db)

        if (quantidade > estoqueAtual) {
          //se a quantidade for maior que o estoque atual
          client.sendText(
            // host manda mensagem para o cliente com o estoque disponível
            msg.from,
            `Desculpe, temos apenas ${estoqueAtual} pães em estoque. 🥖`
          );
          awaitingQuantity = false; //cliente nao esta na espera mais
          currentClient = null; //cliente atual recebe vazio
          return;
        }

        await createOrder("cliente", quantidade); //se cria a ordem de pedido
        await updateStorage(estoqueAtual - quantidade); //faz o update no estoque removendo a quantidade pedida

        const total = quantidade * breadPrice; //o valor total do pedido
        client.sendText(
          //mensagem do host confirmando o pedido e avisa a quantidade restante no estoque
          msg.from,
          `Pedido realizado com sucesso! 🎉 ${quantidade} unidades foram reservadas. Restam ${
            estoqueAtual - quantidade
          } unidades em estoque. 🥖`
        );
        client.sendText(
          //mensagem do host avisando o total que deve ser pago
          msg.from,
          `O valor total do seu pedido é R$${total}. O único método de pagamento é PIX, e a chave é 123.456.789.00. Assim que for efetuado o pagamento, favor enviar comprovante e aguardar a nossa resposta para marcar o local de entrega.`
        );

        awaitingQuantity = false; //cliente nao esta na espera mais
        currentClient = null; //cliente atual recebe vazio
      } catch (error) {
        console.error("Erro ao processar o pedido:", error); //tratamento de erros para nao deixar estourar e o programa ser encerrado
        client.sendText(
          //aviso de erro para o host
          msg.from,
          "Ocorreu um erro ao processar seu pedido. Por favor, tente novamente mais tarde."
        );
        awaitingQuantity = false; //cliente nao esta na espera mais
        currentClient = null; //cliente atual recebe vazio
      }
    }
  });
}

venom //usando a lib venom para fazer a criação da sessão do bot de WhatsApp
  .create({
    session: "new-session", //nova sessão
    multidevice: true, //usar mais de um dispositivo
    headless: true, //abrir o chrome em segundo plano
    useChrome: true, //usar o chrome como padrão
    disableSpins: true, //desabilitar animação de carregamento
    debug: true, //logs no console
  })
  .then((client) => start(client)) //se ha um client, ou seja, se o host ler o qrcode, o programa inicia
  .catch((erro) => {
    console.log(erro); //log do erro se algo acontecer
  });
