const irc = require('irc');
const request = require('request');
const fs = require('fs')
const youtube = require('scrape-youtube').youtube;
let Parser = require('rss-parser');
let parser = new Parser();
const http = require('https');
const hasha = require('hasha');
var weather = require('weather-js');
var config = require('./config.json');


var client = new irc.Client(config.bot.server, config.bot.name, {
    userName: config.bot.username,
    realName: config.bot.realname,
    channels: config.bot.channels,
    debug: false,
    port: config.bot.port
});
client.addListener('registered', function () {
    client.say('nickserv', 'identify ' + config.bot.password);
    const file = fs.createWriteStream("covid.csv");
    const request = http.get("https://covid19cubadata.github.io/data/covid19-casos.csv", function (response) {
        response.pipe(file);
    });
})

client.addListener('invite', function (channel, from, message) {
    console.log(channel, from, message);
    client.join(channel, function (params) {
        console.log(params);

    });
})

client.addListener('error', function (message) {
    //console.log('error: ', message);
});

client.addListener('message', function (from, to, message) {

    console.log(from + ' => ' + to + ': ' + message);

    var msg = message.split(' ');
    var fro = from.toString();

    if (msg.length > 1) {
        if (msg[0] == '!frase') {
            decirFrase(to, fro, msg[1]);
        } else if (msg[0] == '!piropo') {
            decirPiropo(to, fro, msg[1]);
        } else if (msg[0] == '!insulto') {
            if (msg[1] == config.bot.botmaster) {
                decirPiropo(to, fro, msg[1]);
            } else {
                decirInsulto(to, fro, msg[1]);
            }
        } else if (msg[0] == '!clima') {
            getClima(msg, to);
        }
        else if (msg[0] == '!youtube') {
            searchYoutube(msg[1], to);
        }

        else if (msg[0] == '!news!!!!') {
            updateNews(fro);
        }
        else {

        }
    } else {
        if (message == '!frase') {
            decirFraseR(to, from)
        } else if (message == '!ayuda') {
            client.say(to, from + ' : ' + "Puede probar los siguientes comandos !covid CUB, !frase, !frase Nick, !insulto Nick, !piropo Nick, !youtube nombre de la cancion y cantante todo junto sin espacios ;) ");
        }
        else if (msg[0] == '!disconnect' && fro == 'LukeSkywalker') {
            client.disconnect('The Force is Leaving The Server', function (params) {
                console.log(params);

            });
        }
        else if (msg[0] == '!covid') {
            getCovidCuba(to);
        }
        else {

        }
    }



});

function getCovidCuba(test) {
    var resultado;
    var total = 0;
    var recuperados = 0;
    var evacuados = 0;
    var muertes = 0;
    var ultima_fecha = '';
    var fechaInicio = new Date('2020-03-11').getTime();
    var fechaFin = new Date('2020-05-05').getTime();
    var diff = fechaFin - fechaInicio;

    console.log(diff / (1000 * 60 * 60 * 24));

    // request('https://covid19cubadata.github.io/data/covid19-cuba.json', { json: true }, (err, res, body) => {
    //     if (err) { return console.log(err); }
    //     // console.log(body.casos.dias['55']);

    //     //   resultado = ("En " + "Cuba" + " hay: " + "Casos Confirmados: " + body.result['2020-05-03'].confirmed + " Muertes: " + body.result['2020-05-03'].deaths + " Casos Recuperados: " + body.result['2020-05-03'].recovered)
    //     //   client.say(test, resultado);
    //     resultado = body.casos;
    //     // for (let index = 1; index < diff / (1000 * 60 * 60 * 24); index++) {
    //     //     total = (body.casos.dias[index]['diagnosticados']
    //     //     ;

    //     // }
    //     console.log(JSON.parse(resultado.dias));


    // });

    fs.readFile('covid.csv', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        data = data.toString('utf8');
        data = data.split('\n');

        client.say(test, 'En Cuba hay ' + ':' + (data.length - 2) + ' casos de covid');
    });



}
function getClima(country, from) {
    var pais = '';
    for (let index = 1; index < country.length; index++) {
        pais = pais + country[index] + ' ';
    }
    console.log(pais);
    var resultado;
    weather.find({ search: pais + ' Cuba', degreeType: 'C' }, function (err, result) {
        if (err) console.log(err);

        resultado = result;

        client.say(from, 'En ' + resultado[1].location.name + ' la temperatura actual es de :' + resultado[1].current.temperature + 'Grados C');
    });
}
function decirFraseR(to, from) {
    fs.readFile('chorras/frases.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        data = data.toString('utf8');
        data = data.split('\n');
        console.log(data);
        var aleatorio = Math.round(Math.random() * data.length);
        client.say(to, from + ':' + data[aleatorio]);
    });
}
function decirFrase(to, from, mess) {
    fs.readFile('chorras/frases.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        data = data.toString('utf8');
        data = data.split('\n');
        console.log(data);
        var aleatorio = Math.round(Math.random() * data.length);
        client.say(to, mess + " ," + from + " le dedica esta fráse: " + data[aleatorio]);

    });
}
function decirPiropo(to, from, mess) {
    fs.readFile('chorras/pirospos.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        data = data.toString('utf8');
        data = data.split('\n');
        console.log(data);
        var aleatorio = Math.round(Math.random() * data.length);
        client.say(to, mess + " ," + from + " le dedica este hermoso piropo: " + data[aleatorio]);

    });
}
function decirInsulto(to, from, mess) {
    fs.readFile('chorras/insultos.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        data = data.toString('utf8');
        data = data.split('\n');
        console.log(data);
        var aleatorio = Math.round(Math.random() * data.length);
        client.say(to, mess + " ," + data[aleatorio]);
    });
}
function updateNews(fro) {
    var title;
    var from = fro;
    (async () => {

        let feed = await parser.parseURL('http://www.cubadebate.cu/feed');
        //  console.log(feed.title);

        feed.items.forEach(item => {
            // console.log(item.title + ' : ' + item.link)

            title = item.title;
            sayNew(item.title, from);
        });

    })();


}
function sayNew(params, from) {

    client.say(from, params);
}

function searchYoutube(string, fro) {
    youtube.searchOne(string).then(results => {
        client.say(fro, results["title"] + " " + results["link"] + " - " + results["duration"] + " segs");
    });
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
function flipCoin(params) {
    var coin = {
        '0': 'cruz',
        '1': 'cara'
    }
    var aleatorio = Mat.round
}
