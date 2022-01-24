// importação de dependência(s)
import express from "express"
import path from "path"
import { readFile } from 'fs/promises'

// variáveis globais deste módulo
const PORT = 3000
const db = {}
const app = express();
const __dirname = path.resolve();


// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))
db.players = JSON.parse(await readFile('server/data/jogadores.json'));
db.jogosPorJogador = JSON.parse(await readFile('server/data/jogosPorJogador.json'));


// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???qual-templating-engine???');
//app.set('views', '???caminho-ate-pasta???');
// dica: 2 linhas
app.set('view engine', 'hbs');
app.set('views', 'server/views');


// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)
app.get('/', function (request, response) {
    response.render('index', db.players);
});

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código
app.get('/jogador/:id/', function (request, response) {
    const id = request.params.id;
    const jogador = db.players.players.find(j => j.steamid === id);
    const jogosDoJogador = db.jogosPorJogador[jogador.steamid];
    const qtdJogosNaoJogados = jogosDoJogador.games.filter(j => j.playtime_forever === 0).length;

    jogosDoJogador.games.sort((a, b) => b.playtime_forever - a.playtime_forever);
    jogosDoJogador.games = jogosDoJogador.games.slice(0, 5);
    jogosDoJogador.games.forEach(game => {
        game.playtime_forever = Math.floor(game.playtime_forever / 60);
    });

    response.render('jogador', {
        perfil: jogador,
        jogos: jogosDoJogador,
        qtdJogos: jogosDoJogador.game_count,
        totalJogosNaoJogados: qtdJogosNaoJogados,
        jogosMaisJogados: jogosDoJogador.games,
        jogoFavorito: jogosDoJogador.games[0]
    });
});

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static(`${__dirname}/client`));


// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
const server = app.listen(PORT, () =>
    console.log(`Server start on port ${PORT}`)
);