// Criar um software de agendamento de serviços de uma barbearia

// importar as bibliotecas necessárias
import * as fs from "fs"; // módulo para manipular arquivos
import * as path from "path"; // módulo para lidar com caminhos de arquivos
import * as readline from "readline"; // módulo para receber entradas do usuário
import { stdin as input, stdout as output } from "process"; // entrada e saída padrão

// interface que define o que é um agendamento
interface Agendamento {
    nome: string,
    data: string,
    horario: string,
    cabelo: boolean,
    barba: boolean,
    progressiva: boolean,
    valor: number,
    idade: number,
    genero: string,
}

// cria a interface de leitura para o terminal
const ler = readline.createInterface({ input, output });

// define o caminho do arquivo onde os agendamentos serão salvos
const arquivosdeAgendamento = path.resolve(__dirname, "agendamentos.csv");

// função para ler os agendamentos do arquivo CSV (caso exista)
function lerAgendamento(): Agendamento[] {
    try {
        const dados = fs.readFileSync(arquivosdeAgendamento, "utf-8");

        // se o arquivo estiver vazio, retorna uma lista vazia
        if (!dados.trim()) return [];

        // divide o conteúdo por linhas e transforma em objetos Agendamento
        return dados.split("\n").map((linha) => {
            const [
                nome, data, horario, cabeloStr, barbaStr, progressivaStr, valorStr, idadeStr, genero
            ] = linha.split(";");

            return {
                nome: nome?.trim(),
                data: data?.trim(),
                horario: horario?.trim(),
                cabelo: cabeloStr?.trim() === "true",
                barba: barbaStr?.trim() === "true",
                progressiva: progressivaStr?.trim() === "true",
                valor: Number(valorStr),
                idade: Number(idadeStr),
                genero: genero?.trim(),
            };
        });
    } catch {
        // se o arquivo não existir, também retorna uma lista vazia
        return [];
    }
}

// função para salvar um novo agendamento no arquivo
function salvarAgendamento(agendamento: Agendamento) {
    const linha = `${agendamento.nome};${agendamento.data};${agendamento.horario};${agendamento.cabelo};${agendamento.barba};${agendamento.progressiva};${agendamento.valor};${agendamento.idade};${agendamento.genero}\n`;
    fs.appendFileSync(arquivosdeAgendamento, linha, "utf-8");
}

// função utilitária para fazer perguntas no terminal
function perguntar(query: string): Promise<string> {
    return new Promise((resolve) => ler.question(query, resolve));
}

// função principal que executa o agendamento
async function criarAgendamento() {
    console.log("---------------------------\nVamos agendar o seu corte\n---------------------------\n");

    // coleta o nome do cliente
    const nome = await perguntar("Nome do cliente: ");

    // coleta a idade e converte para número
    const idadeStr = await perguntar("Qual a sua idade? ");
    const idade = parseInt(idadeStr);

    // coleta o gênero do cliente
    let genero = await perguntar("Qual o seu gênero? (H/M): ");
    genero = genero.trim().toUpperCase();

    // coleta a data e o horário do agendamento
    const data = await perguntar("Qual a data do seu agendamento? (YYYY-MM-DD): ");
    const horario = await perguntar("Qual horário? (HH:MM): ");

    // pergunta se o cliente deseja corte de cabelo
    const cabeloStr = await perguntar("Deseja corte de cabelo? (s/n): ");
    const cabelo = cabeloStr.toLowerCase().startsWith("s");

    // define variáveis para barba e progressiva
    let barba = false;
    let progressiva = false;

    // se for homem, pergunta sobre barba; se mulher, pergunta sobre progressiva
    if (genero === "H") {
        const barbaStr = await perguntar("Deseja fazer a barba? (s/n): ");
        barba = barbaStr.toLowerCase().startsWith("s");
    } else if (genero === "M") {
        const progressivaStr = await perguntar("Deseja fazer progressiva? (s/n): ");
        progressiva = progressivaStr.toLowerCase().startsWith("s");
    }

    // calcula o valor baseado nos serviços escolhidos
    let valor = 0;
    if (cabelo) valor += 30;           // valor do corte de cabelo
    if (barba) valor += 20;            // valor da barba
    if (progressiva) valor += 50;      // valor da progressiva

    // cria o objeto com os dados do agendamento
    const novoAgendamento: Agendamento = {
        nome,
        data,
        horario,
        cabelo,
        barba,
        progressiva,
        valor,
        idade,
        genero,
    };

    // cria a mensagem de serviços para exibir
    let servicos = "";
    if (cabelo) servicos += "cabelo ";
    if (barba) servicos += "barba ";
    if (progressiva) servicos += "progressiva ";

    // mostra um resumo para o usuário confirmar
    console.log(`\n${nome}, ${idade} anos, está agendado para ${data} às ${horario}, serviços: ${servicos.trim()}, no valor de R$${valor}\n`);

    // confirmação final do usuário
    const certeza = await perguntar("Está correto o agendamento? (Sim ou Não): ");

    if (certeza.toLowerCase().startsWith("s")) {
        // se confirmado, salva e encerra
        salvarAgendamento(novoAgendamento);
        console.log("\nAgendamento finalizado com sucesso!\n");
        ler.close();
    } else {
        // se não confirmado, reinicia o processo
        console.log("\nVamos refazer o agendamento!\n");
        return criarAgendamento();
    }
}

// inicia o processo
criarAgendamento();
