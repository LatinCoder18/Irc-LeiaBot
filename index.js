const irc = require('irc');
const request = require('request');
const fs = require('fs')
const youtube = require('scrape-youtube').youtube;
let Parser = require('rss-parser');
let parser = new Parser();
const http = require('https');
const hasha = require('hasha');
var weather = require('weather-js');
var mysql = require('mysql');
const jsonfile = require('jsonfile');
const file = 'database/users.json';
var config = require('./config.json');
const c = require('irc-colors').global();

var client = new irc.Client(config.bot.server, config.bot.name, {
    userName: config.bot.username,
    realName: config.bot.realname,
    channels: config.bot.channels,
    debug: true,
    port: config.bot.port
});

// var connection = mysql.createConnection({
//     host: config.database.host,
//     user: config.database.user,
//     password: config.database.password,
//     database: config.database.database
// });

client.addListener('registered', function () {
    client.say('nickserv', 'identify ' + config.bot.password);
    const file = fs.createWriteStream("covid.csv");
    const request = http.get("https://covid19cubadata.github.io/data/covid19-casos.csv", function (response) {
        response.pipe(file);
    });
    client.part("#trivia","Pueden encontrarme en lobby tipeen el comando !ayuda ;)");

})

client.addListener('invite', function (channel, from, message) {

    console.log(channel, from, message);
    client.join(channel, function (params) {
        console.log(params);
    });
})

client.addListener('error', function (message) {
    console.log('error: ', message);
});
// client.addListener('join', function (channel, nick, message) {
//     console.log(channel + nick);
//     connection.query('SELECT * from users', function (error, results, fields) {
//         if (error) throw error;
//         results.forEach(element => {

//             if (element.nickname == nick) {
//                 client.say(channel, nick + " " + element.greet);
//             }
//         });
//     });

// });
client.addListener('message', function (from, to, message) {

    console.log(from + ' => ' + to + ': ' + message);

    var msg = message.split(' ');
    var fro = from.toString();
    var fullmsg = '';
    for (let index = 3; index < msg.length; index++) {
        fullmsg = fullmsg + msg[index] + ' ';
    }
    console.log(fullmsg);


    if (msg.length > 1) {
        if (msg[0] == '!frase') {
            decirFrase(to, fro, msg[1]);
        } else if (msg[0] == '!piropo') {
            decirPiropo(to, fro, msg[1]);
        }
        else if (msg[0] == '!intro') {
            decirIntroduccion(msg[1]);
        } else if (msg[0] == '!insulto') {
            if (msg[1] == 'BotMasterVar') {
                client.say(to, "Vas a insultar a mi creador, porque mejor no le dedicamos un hermoso piropito.");
                sleep(2000);
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

        else if (msg[0] == '!greet+++' && from == config.bot.botmaster) {
            console.log(message);
            if (msg[1] == 'add') {
                connection.query("INSERT INTO `users` (`id`, `nickname`, `greet`) VALUES (NULL, '" + msg[2] + "','" + fullmsg + "' )", function (error, results, fields) {
                    if (error) throw error;
                    client.say(to, "El mensaje de saludo agregado correctamente");

                });
            } else if (msg[1] == 'modify') {
                console.log('st');

                connection.query('SELECT 1', function (error, results, fields) {
                    if (error) throw error;
                    // connected!
                });
            } else if (msg[1] == 'del') {
                console.log(msg[2]);
                connection.query('DELETE FROM `users` WHERE `users`.`nickname` ="' + msg[2] + '" ', function (error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                    if (results.affectedRows >= 1) {
                        console.log("Borrado correctamente");
                        client.say(to, "El mensaje de saludo fue borrado correctamente");
                    } else {
                        client.say(to, "No existe el usuario");

                    }
                });
            }
        }
        else {

        }
    } else {
        if (message == '!frase') {
            decirFraseR(to, from)
        } else if (message == '!ayuda') {
            client.say(to, from + ' : ' + "Puede probar los siguientes comandos".irc.white.bgblack()+" !covid".irc.purple.bold()+" ,!clima".irc.purple.bold()+" localidad,".irc.cyan()+" !frase".irc.purple.bold()+", !frase".irc.purple.bold()+" Nick".irc.cyan()+", !insulto".irc.purple.bold()+" Nick".irc.cyan()+", !piropo".irc.purple.bold()+" Nick"+", !youtube".irc.purple.bold()+" nombre de la cancion,!intro".irc.purple.bold()+" usernick (Para darle una introduccion a los usuarios nuevos en la sala!!!)".irc.cyan()+" ");
        }
        else if (msg[0] == '!disconnect' && fro == 'LukeSkywalker') {
            client.disconnect('The Force is Leaving The Server', function (params) {
                console.log(params);
            });
        }
        else if (msg[0] == '!covid') {
            getCovidCuba(to);
        }
        else if (msg[0] == '!news') {
            updateNews(fro);
        }
        else {

        }
    }


});
function decirIntroduccion(from) {
    console.log("HOla Mundo");
    client.say(from,"Hola, bienvenido al chat, en el mismo contamos con dos salas, 1 llamada #lobby que es para la charla comun entre usuarios");
    sleep(2000);
    client.say(from,"Y la otra se llama #trivia es un canal para que los usuarios respondan las preguntas del BOT y el mismo les va dando puntos y un ranking juega y disfruta jugando");
    sleep(1500);
    client.say(from,"Si desea conocer la lista de usuarios de un canal y estas en la app Segured-Chat, desliza el dedo de la derecha de la pantalla hasta el centro de la misma, bien pegado al borde derecho");
    sleep(3000);
    client.say(from,"Si deseas saber que mas puedo hacer para ayudarte en la sala #lobby escribe el comando !ayuda  saludos y que la fuerza te acompañe");
    client.say(from,"Puedes preguntar en el lobby :D cualquier otra duda ");

}
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

    fs.readFile('covid.csv', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        data = data.toString('utf8');
        data = data.split('\n');

        client.say(test, 'En Cuba hay ' + ':' + (data.length - 2) + ' casos acumulados de covid');
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
        //console.log(resultado[0]);

        client.say(from, 'En ' + resultado[0].location.name + ' la temperatura actual es de : ' + resultado[0].current.temperature + ' Grados C, con una sensación térmica de ' + resultado[0].current.feelslike + ' grados C' + ' y una humedad de ' + resultado[0].current.humidity);
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
        if(aleatorio==undefined){
            decirPiropo(to,from,mess);
        }else{
        client.say(to, mess + " ," + from + " le dedica esta fráse: " + data[aleatorio]);
        }
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
        if(aleatorio==undefined){
            decirPiropo(to,from,mess);
        }else{
        client.say(to, mess + " ," + from + " le dedica este hermoso piropo: " + data[aleatorio]);
    }
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
            sayNew(item.title + ' ' + item.link, from);
        });

    })();


}
function sayNew(params, from) {

    client.say(from, params);
}

function searchYoutube(string, fro) {
    youtube.search(string).then(results => {
        results.forEach(element => {
            client.say(fro, element["title"] + " " + element["link"] + " - " + element["duration"] + " segs");
        });
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
