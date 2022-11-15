const Discord = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const { MessageAttachment } = require('discord.js');
const { Permissions } = require('discord.js');
const paginationEmbed = require('discord.js-pagination');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_MEMBERS", "GUILD_PRESENCES"] });
require('dotenv').config();
var token = process.env.token;


var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "projeto"
});

client.on('ready', readyDiscord);
client.on('messageCreate', gotMessage);
client.on('guildMemberAdd', newMember);

client.on("guildCreate", function(guild){
    var id = guild.id;
    var q = 'INSERT INTO guildChannels(guild) VALUES("' + id + '")';
    con.query(q, function(err, result){
    });
});


function newMember(member){

  var guildId = member.guild.id;
  var sql = 'SELECT * FROM guildChannels WHERE guild = ' + guildId;
  con.query(sql, function(err, result){
    var chid = result[0].chann;
    const ch = client.channels.cache.find(channel => channel.id === chid);
    var nome_member = String(member.user.username);
    if(ch !== undefined){
      ch.send(nome_member + ' entrou no server!');
    }
    const myGuild = client.guilds.cache.get(guildId);
    var id_member = String(member.id);

    var sql2 = 'SELECT * FROM users WHERE id_discord = ' + id_member;
    con.query(sql2, function (err, result) {
      if (err) throw err;
      var numRows = result.length;
      if(numRows == 0){
        var sql = 'INSERT INTO users(id_discord, guild) VALUES(' + id_member + ', ' + guildId + ')';
        con.query(sql, function (err, result) {
          if (err) throw err;
          if(ch !== undefined){
            ch.send(member.user.username + ' entrou e foi cadastrado!\n');
          }
        });
      }else{
        if(ch !== undefined){
          ch.send(member.user.username + ' entrou mas já tem cadastro.\n');
        }
      }
    });
  });


}

function upMessage(msgO, msgN){
  gotMessage(msgN);
}

function showFlt(a1, a2){
  var val;
  for(i = 0; i < a1.length; i++){
    val = 1;
    for(j = 0; j < a2.length; j++)
      if(a1[i] == a2[j]) val = 0;
    if(val == 1) console.log(a1[i]);
  }
}

function readyDiscord(){
  console.log('Bot rodando');
}

function cap(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function capSpaces(str) {
   var splitStr = str.split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length, as your for does that for you
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
   }
   // Directly return the joined string
   return splitStr.join(' ');
}

function getArgs(text){
  let args = text.split("!");
  var i;
  for(i = 0; i < args.length; i++){
    args[i] = args[i].trim();
  }
  return args;
}


function titleCase(str){
    var finalstr = '';
    var top = str.split('\n');
    var i;
    for(i = 0; i < top.length; i++){
      finalstr += cap(top[i]);
      finalstr += '\n';
    }
    return capSpaces(finalstr);
}


function banir(msg, member){
  var guildId = msg.channel.guild.id;
  var sql = 'SELECT * FROM guildChannels WHERE guild = ' + guildId;
  con.query(sql, function(err, result){
    var chid = result[0].chann;
    const ch = client.channels.cache.find(channel => channel.id === chid);
    if(member){
        var memberTarget = msg.guild.members.cache.get(member.id);
        if(!memberTarget.kickable){
          msg.react('❌');
        }else{
          memberTarget.kick();
          msg.react('✅');
        }
    }else{

    }
  });

}

function makeRole(msg, nome){
  msg.guild.roles.create({
    name: nome,
    color: 'RED'
  });
}

function deleteRole(role){
  role.delete();
}

function verifyRole(message, role){
  if(typeof role === 'undefined'){
    return 0;
  }else{
    return 1;
  }
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomFloat(min,max){
    return Math.random() * (max - min) + min;
}

function addRole(msg, user, role, ch){
  var guildId = msg.channel.guild.id;
  var sql = 'SELECT * FROM guildChannels WHERE guild = ' + guildId;
  con.query(sql, function(err, result){
    if(result.lengh)
    if (!user) return console.log("erro user\n");
    if (!role) return console.log("erro role\n");
    user.roles.add(role);
    if(ch !== undefined){
      ch.send('Role ' + role.name + ' adicionada a ' + user.user.username + '.');
    }
  });


}

function getDate(){
  let ts = Date.now();
  let date_ob = new Date(ts);
  let date = date_ob.getDate();
  let month = date_ob.getMonth() + 1;
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  //var currentTime = new Date(year + "-" + month + "-" + date + ' ' + hours + ':' + minutes + ':' + seconds);
  var currentTime = String(year + "-" + month + "-" + date + ' ' + hours + ':' + minutes + ':' + seconds);
  return currentTime;
}

function removeRole(msg, user, role){
  var guildId = msg.channel.guild.id;
  var sql = 'SELECT * FROM guildChannels WHERE guild = ' + guildId;
  con.query(sql, function(err, result){
    var chid = result[0].chann;
    const ch = client.channels.cache.find(channel => channel.id === chid);
    if (!user) return console.log("erro\n");
    if (!role) return console.log("erro\n");
    user.roles.remove(role);
    if(ch !== undefined){
      ch.send('Role ' + role.name + ' removida de ' + user.user.username + '.\n');
    }
  });


}

function sendImage(msg, link){
  msg.channel.send({
    files: [link]
  })
  //.then(console.log)
  //.catch(console.error);
}

function createEmbedMM(msg, desc, author, authorURL){
  return new MessageEmbed()
  .setColor('#0099ff')
  .setTitle('Harém de ' + author)
  .setAuthor('ALIPHES BOT', 'https://i.imgur.com/wipwcJZ.png')
  .setDescription(desc)
  .setThumbnail(authorURL);
}

function createEmbedIM(msg, char, available, link, price){
  return new MessageEmbed()
  .setColor('#0099ff')
  .setTitle(titleCase(char))
  .setAuthor('ALIPHES BOT', 'https://i.imgur.com/wipwcJZ.png')
  .setDescription(available + '\n' + price + '$')
  .setImage(link);
}

function createEmbedTOPU(msg, desc){
  return new MessageEmbed()
  .setColor('#0099ff')
  .setTitle('Lista de personagens disponíveis')
  .setAuthor('ALIPHES BOT', 'https://i.imgur.com/wipwcJZ.png')
  .setDescription(desc);
}

function createEmbedH(msg, desc){
  return new MessageEmbed()
  .setColor('#0099ff')
  .setTitle('Lista de comandos')
  .setAuthor('ALIPHES BOT', 'https://i.imgur.com/wipwcJZ.png')
  .setDescription(desc);
}

function createEmbedTSV(msg, desc){
  return new MessageEmbed()
  .setColor('#0099ff')
  .setTitle('RANKING TOP 15')
  .setAuthor('ALIPHES BOT', 'https://i.imgur.com/wipwcJZ.png')
  .setDescription(desc);
}

function createEmbedROBU(msg, desc){
  return new MessageEmbed()
  .setColor('#0099ff')
  .setTitle('Usuários que podem ser roubados')
  .setAuthor('ALIPHES BOT', 'https://i.imgur.com/wipwcJZ.png')
  .setDescription(desc);
}


function answer(ch, guildId, msg, size, text){
  if(text.substring(0,3).toLowerCase() == 'say'){
    msg.channel.send(text.substring(3, size));
  }
  if(text.substring(0,1).toLowerCase() == 'c'){
    var top = text.split(' ');
    if(top[0].toLowerCase() == 'c'){
      text = text.substring(1, size);
      var args = getArgs(text);
      if(args.length == 2){
        var char = args[0];
        var imgn = args[1];
        if(imgn && char){
          var q1 = 'SELECT * FROM users WHERE id_discord = ' + msg.author.id + ' AND guild = ' + guildId;
          con.query(q1, function(err, result){
            if(result.length == 1){
              if(!isNaN(imgn)){
                var q2 = 'SELECT * FROM characters WHERE char_name = "' + char + '"' + ' AND guild = ' + guildId;
                con.query(q2, function(err, result){
                  if(result.length == 1){//
                    var dono = result[0].char_owner;
                    if(msg.author.id == dono){
                      var idd = result[0].id;
                      var q3 = 'SELECT * FROM gallery WHERE id_char = ' + result[0].id  + ' AND guild = ' + guildId + ' ORDER BY id ASC';
                      con.query(q3, function(err, result){
                        if(imgn > result.length){
                          msg.reply('Insira um número válido.');
                        }else{
                          var id_first = result[0].id;
                          var img_first = result[0].image;
                          var q4 = 'SELECT * FROM gallery WHERE id_char = ' + parseInt(idd)  + ' AND guild = ' + guildId + ' ORDER BY id ASC LIMIT ' + parseInt(imgn - 1) + ', 1';
                          con.query(q4, function(err, result){
                            if(result.length > 0){
                              var id_final = result[0].id;
                              var img_final = result[0].image;
                              var q5 = 'UPDATE gallery SET image = "' + img_final + '" WHERE id = ' + id_first + ' AND guild = ' + guildId;
                              var q6 = 'UPDATE gallery SET image = "' + img_first + '" WHERE id = ' + id_final + ' AND guild = ' + guildId;
                              con.query(q5, function(err, result){

                              });
                              con.query(q6, function(err, result){

                              });
                              msg.react('✅');
                            }
                          });
                        }
                      });
                    }else{
                      msg.reply('Você não é o dono desse personagem.');
                    }
                  }else{

                    var q2 = 'SELECT * FROM nicks WHERE nick = "' + char + '"' + ' AND guild = ' + guildId;
                    con.query(q2, function(err, result){
                      if(result.length == 1){
                        var tempname = result[0].char_name;
                        var qt = 'SELECT * FROM characters WHERE char_name = "' + tempname + '"' + ' AND guild = ' + guildId;
                        con.query(qt, function(err, result){

                          var dono = result[0].char_owner;
                          if(msg.author.id == dono){
                            var idd = result[0].id;
                            var q3 = 'SELECT * FROM gallery WHERE id_char = ' + result[0].id + ' AND guild = ' + guildId + ' ORDER BY id ASC';
                            con.query(q3, function(err, result){
                              if(imgn > result.length){
                                msg.reply('Insira um número válido.');
                              }else{
                                var id_first = result[0].id;
                                var img_first = result[0].image;
                                var q4 = 'SELECT * FROM gallery WHERE id_char = ' + parseInt(idd) + ' AND guild = ' + guildId + ' ORDER BY id ASC LIMIT ' + parseInt(imgn - 1) + ', 1';
                                con.query(q4, function(err, result){
                                  if(result.length > 0){
                                    id_final = result[0].id;
                                    var img_final = result[0].image;
                                    var q5 = 'UPDATE gallery SET image = "' + img_final + '" WHERE id = ' + id_first + ' AND guild = ' + guildId;
                                    var q6 = 'UPDATE gallery SET image = "' + img_first + '" WHERE id = ' + id_final + ' AND guild = ' + guildId;
                                    con.query(q5, function(err, result){

                                    });
                                    con.query(q6, function(err, result){

                                    });
                                    msg.react('✅');
                                  }
                                });
                              }
                            });
                          }else{
                            msg.reply('Você não é o dono desse personagem.');
                          }

                        });

                      }else{
                        msg.channel.send('Personagem não encontrado.');
                      }
                    });


                  }
                });
              }else{
                msg.reply('Insira um número válido.');
              }
            }else{
              msg.reply('Digite !register para se registrar antes de usar este comando.');
            }
          })
        }else{
          msg.reply('Os dois parâmetros devem ser preenchidos.');
        }
      }else{
        msg.reply('Esse comando requer 2 parâmetros.');
      }
    }

  }
  if(text.substring(0,3).toLowerCase() == 'aaa'){

  }
  if(text.substring(0,4).toLowerCase() == 'topu'){
    var sql = 'SELECT * FROM characters WHERE char_owner = "none" AND GUILD = ' + guildId + ' ORDER BY price DESC';
    var pages = [];
    var i;
    con.query(sql, function(err, result){
      var ammount = result.length;
      if(ammount > 0){
        var embed;
        var str = '';
        for(i = 0; i < ammount; i++){
          str += result[i].char_name;
          str += ' // ';
          str += result[i].price;
          str += '$\n';
          if((i + 1) % 15 == 0){
            embed = createEmbedTOPU(msg, titleCase(str));
            pages.push(embed);
            str = '';
          }
        }
        if(str != ''){
          embed = createEmbedTOPU(msg, titleCase(str));
          pages.push(embed);
        }
        paginationEmbed(msg, pages);
      }else{
        msg.reply('Não existem personagens nesse servidor.');
      }
    });
  }
  if(text.substring(0,3).toLowerCase() == 'top' && text.length == 3){
    var sql = 'SELECT * FROM characters WHERE GUILD = ' + guildId + ' ORDER BY price DESC';
    var pages = [];
    var i;
    con.query(sql, function(err, result){
      var ammount = result.length;
      if(ammount > 0){
        var embed;
        var str = '';
        for(i = 0; i < ammount; i++){
          str += result[i].char_name;
          str += ' // ';
          if(result[i].char_owner != 'none'){
            str += '💘';
          }
          str += '\n';
          if((i + 1) % 15 == 0){
            embed = createEmbedTOPU(msg, titleCase(str));
            pages.push(embed);
            str = '';
          }
        }
        if(str != ''){
          embed = createEmbedTOPU(msg, titleCase(str));
          pages.push(embed);
        }
        paginationEmbed(msg, pages);
      }else{
        msg.reply('Não existem personagens nesse servidor.');
      }
    });
  }
  if(text.substring(0,5).toLowerCase() == 'money'){
    var user;
    if(msg.mentions.users.first()){
      user = String(msg.mentions.users.first().id);
    }else{
      user = String(msg.author.id);
    }
    var sql = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
    con.query(sql, function (err, result) {
      if (err) throw err;
      var numRows = result.length;
      if(numRows == 1){
        var money = result[0].money;
        if(msg.mentions.users.first()){
          var nome = msg.mentions.users.first().username;
          msg.channel.send('O saldo de ' + nome + ' é de: ' + money + '$.');
        }else{
          msg.channel.send('Seu saldo é de: ' + money + '$.');
        }
      }else{
        msg.reply('Digite !register para se registrar!');
      }
    });
  }
  if(text.substring(0,4).toLowerCase() == 'robu' && text.length == 4){
    var final = '';
    var q = 'select * from users WHERE money >= ' + String(15000) + ' AND guild = ' + guildId + ' order by last_robbed ASC';
    con.query(q, function(err, result){
      var x = result.length;
      var vetuser = [];
      var vettime = []
      var i;
      for(i = 0; i < 15; i++){
        if(i < x){
          var idz = result[i].id_discord;
          var time = result[i].last_robbed;
          var id_user = result[i].id_discord;
            var mem = client.users.cache.find(user => user.id === idz);
            var name;
            if(mem){
              name = mem.username;
            }else{
              name = 'Invalid User';
            }
            var money = result[i].money;
              var datt = getDate();
              var date = Date.now();
              var dif = date - time;
              if(dif >= 7200000){
                  /*
                  final += name;
                  final += '\n';
                  */
                vetuser.push(name);
                vettime.push(0);
              }else{

                vetuser.push(name);
                vettime.push(parseInt(((7200000 - dif) / 60000) + 1));
              }
        }
      }
      var embed;
      var pages = [];
      var str = '';
      for(i = 0; i < vetuser.length; i++){
        str += '**';
        str += vetuser[i];
        str += '**';
        str += ' // ';
        if(vettime[i] == 0){
          str += ' DISPONÍVEL\n';
        }else{
          str += vettime[i];
          str += ' minutos\n';
        }
        if((i + 1) % 15 == 0){
          embed = createEmbedROBU(msg, str);
          pages.push(embed);
          str = '';
        }
      }
      if(str != ''){
        embed = createEmbedROBU(msg, str);
        pages.push(embed);
      }
      if(vetuser != ''){
        paginationEmbed(msg, pages);
      }else{
        msg.reply('Não há ninguém pra ser roubado.');
      }
      //paginationEmbed(msg, pages);
      //var embed = createEmbedTOPU(msg, final);
    //  msg.channel.send({ embeds: [embed] });
    });
  }
  if(text.substring(0,5).toLowerCase() == 'check'){
    var args = text.split(' ');
    if(args.length == 1 && args[0] == 'check'){
      var q1 = 'SELECT * FROM bank WHERE id_discord = "' + msg.author.id + '" AND guild = "' + guildId + '"';
      con.query(q1, function(err, result){
        if(result.length == 1){
          var money = result[0].money;
          msg.reply('Você possui ' + money + '$ armazenados no banco.');
        }else{
          msg.reply('Você ainda não fez um depósito.');
        }
      });
    }
  }
  if(text.substring(0,8).toLowerCase() == 'makenick'){
    var i, args, roleN, list, val = 1;
    args = getArgs(text.substring(8, text.length));
    if(args.length < 3){
      msg.reply('Este comando requer ao menos 3 parâmetros');
    }else{
      for(i = 0; i < args.length; i++){
        if(msg.guild.roles.cache.find(r => r.name === args[i]) == undefined){
          if(i > 0){
            val = 0;
            msg.reply('O cargo "' + args[i] + '" não existe');
          }
        }else{
          if(i == 0){
            val = 0;
            msg.reply('O cargo "' + args[i] + '" já existe');
          }
        }
      }
      if(val == 1){
        makeRole(msg, args[0]);
        setTimeout(function(){
          roleN = msg.guild.roles.cache.find(r => r.name === args[0]);
          list = client.guilds.cache.get(msg.guild.id);
          list.members.cache.each(memberr => {
            val = 1;
            for(i = 1; i < args.length; i++){
              if (!memberr.roles.cache.some(r => r.name === args[i])){
                val = 0;
              }
            }
            if(val == 1){
              addRole(msg, memberr, roleN, ch);
              msg.react('✅')
            }
          });
        }, 3000);
      }
    }
  }
  if(text.substring(0,8).toLowerCase() == 'withdraw'){
    var args = text.split(' ');
    if(args[0] == 'withdraw'){
      if(args.length == 2){
        if(isNaN(args[1])){
          msg.reply('Insira um valor válido.');
        }else{
          var money = parseInt(args[1]);
          var q1 = 'SELECT * FROM bank WHERE id_discord = "' + msg.author.id + '" AND guild = "' + guildId + '"';
          con.query(q1, function(err, result){
            if(result.length == 1){
              var moneyStored = result[0].money;
              if(money > moneyStored){
                msg.reply('Você não possui essa quantia armazenada.');
              }else{
                var newMoneyStored = moneyStored - money;
                var q2 = 'UPDATE bank SET money = ' + newMoneyStored + ' WHERE id_discord = "' + msg.author.id + '" AND guild = "' + guildId + '"';
                con.query(q2, function(err, result){
                  var q3 = 'SELECT * FROM users WHERE id_discord = ' + msg.author.id + ' AND guild = ' + guildId;
                  con.query(q3, function(err, result){
                    if(result.length == 1){
                      var userMoney = result[0].money;
                      var newUserMoney = userMoney + money;
                      var q4 = 'UPDATE users SET money = ' + newUserMoney + ' WHERE id_discord = "' + msg.author.id + '" AND guild = "' + guildId + '"';
                      con.query(q4, function(err, result){
                        msg.react('✅')
                      });
                    }
                  });
                });
              }
            }else{
              msg.reply('Você ainda não fez um depósito no banco.');
            }
          });
        }
      }else{
        msg.reply('Esse comando requer 2 parâmetros.');
      }
    }
  }
  if(text.substring(0,5).toLowerCase() == 'store'){
    var args = text.split(' ');
    var id_aut = msg.author.id;
    if(args[0].toLowerCase() == 'store'){
      if(args.length == 2){
        if(isNaN(args[1])){
          msg.reply('Insira um valor válido.');
        }else{
          var q1 = 'SELECT * FROM users WHERE id_discord = ' + id_aut + ' AND guild = ' + guildId;
          con.query(q1, function(err, result){
            if(result.length == 1){
              var moneyToStore = parseInt(args[1]);
              var userMoney = result[0].money;
              if(moneyToStore > userMoney){
                msg.reply('Você não possui esse dinheiro.');
              }else{
                var penalty = parseInt((20 / 100 * moneyToStore) + 6000);
                var moneyStored = moneyToStore - penalty;
                const time = 60000;

                msg.channel.send('Deseja pagar ' + penalty + '$ para armazenar ' + moneyStored + '$ no banco?')
                .then(async function (msg) {
                     await msg.react('✅')
                     const filter = (reaction, user) => {
                          return user.id === msg.author.id;
                     };
                     const collector = msg.createReactionCollector(filter, { time: time });
                     collector.on('collect', (reaction, reactionCollector) => {
                          var qg = 'SELECT * FROM users WHERE id_discord = ' + id_aut + ' AND guild = ' + guildId;
                          con.query(qg, function(err, result){{
                            userMoney = result[0].money;
                            var newMoney = userMoney - moneyToStore;
                            if(moneyToStore > userMoney){
                              msg.reply('Você não possui esse dinheiro.');
                            }else{
                              if(reactionCollector.id == id_aut){
                                var q2 = 'UPDATE users SET money = ' + newMoney + ' WHERE id_discord = ' + id_aut + ' AND guild = ' + guildId;
                                con.query(q2, function(err, result){

                                });
                                var q3 = 'SELECT * FROM bank WHERE id_discord = ' + id_aut + ' AND guild = ' + guildId;
                                con.query(q3, function(err, result){
                                  if(result.length == 0){
                                    var q4 = 'INSERT INTO bank(id_discord, money, guild) VALUES("' + id_aut + '",' + moneyStored + ',"' + guildId + '")';
                                    con.query(q4, function(req,res){
                                      msg.channel.send('Depósito realizado com sucesso');
                                    });
                                  }else{
                                    var bankMoney = result[0].money;
                                    var finalMoney = bankMoney + moneyStored;
                                    var q5 = 'UPDATE bank SET money = ' + finalMoney + ' WHERE id_discord = ' + id_aut + ' AND guild = ' + guildId;
                                    con.query(q5, function(err, result){
                                      msg.channel.send('Depósito realizado com sucesso');
                                    });
                                  }
                                })
                              }
                            }

                          }})
                     });
                });


              }
            }else{
              msg.reply('Use !register antes de usar esse comando!');
            }
          });
          /*
          const time = 60000 //amount of time to collect for in milliseconds
          msg.channel.send("oi")
          .then(async function (msg) {
               await msg.react('✅')
               const filter = (reaction, user) => {
                    return user.id === msg.author.id;;
               };
               const collector = msg.createReactionCollector(filter, { time: time });
               collector.on('collect', (reaction, reactionCollector) => {
                    if(reactionCollector.id == id_aut){
                      console.log('Você reagiu');
                    }
               });
          });
          */


        }
      }else{
        msg.reply('Esse comando requer 1 parâmetro');
      }
    }
  }
  if(text.substring(0,3).toLowerCase() == 'rob'){
    var args = text.split(' ');
    if(args[0].toLowerCase() == 'rob'){
      var random = getRandom(5000,15000);
      var user = msg.author.id;
      var targetz;
      var val;
      if(msg.mentions.users.first()){
        targetz = msg.mentions.users.first();
        val = 1;
      }else{
        var args = text.substring(4, size);
        if(isNaN(args)){
          msg.react('❌');
        }else{
          targetz = args;
          val = 2;
        }
      }
      if(targetz){
        var target;
        if(val == 1){
          target = targetz.id;
        }else{
          target = targetz;
        }
        var sql = 'SELECT * FROM users WHERE id_discord = ' + target + ' AND guild = ' + guildId;
        con.query(sql, function(err, result){
          var numRows = result.length;
          if(numRows == 1){
            if (err) throw err;
            var memzzz = client.users.cache.find(user => user.id === target);
            if(memzzz){
              var namee = memzzz.username;
            }else{
              var namee = 'Invalid User';
            }
            var targetMoney = result[0].money;
            var targetLastr = result[0].last_robbed;
            if(targetMoney < 15000){
              msg.channel.send('O alvo deve ter ao menos 15000$ para poder ser roubado.');
            }else{
              var sql2 = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
              con.query(sql2, function(err, result){
                numRows = result.length;
                if(numRows == 1){
                  if(user != target){
                    var datt = getDate();
                    var date = Date.now();
                    var top = new Date(date);
                    var z = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
                    con.query(z, function(err, result){
                      var userMoney = result[0].money;
                      var time = result[0].last_rob;
                      var dif = date - time;
                      if(dif >= 3600000){
                        var dif2 = date - targetLastr;
                        if(dif2 >= 7200000){
                          var t = 'UPDATE users SET last_rob = "' + datt + '" WHERE id_discord = ' + user + ' AND guild = ' + guildId;
                          con.query(t, function(err, result){
                            var newUserMoney = userMoney + random;
                            var newTargetMoney = targetMoney - random;
                            var sql3 = 'UPDATE users SET money = ' + newUserMoney + ' WHERE id_discord = ' + user + ' AND guild = ' + guildId;
                            var sql4 = 'UPDATE users SET money = ' + newTargetMoney + ' WHERE id_discord = ' + target + ' AND guild = ' + guildId;
                            var sql5 = 'UPDATE users SET last_robbed = "' + datt + '" WHERE id_discord = ' + target + ' AND guild = ' + guildId;
                            con.query(sql3, function(err, result){
                              if (err) throw err;
                            });
                            con.query(sql4, function(err, result){
                              if (err) throw err;
                            });
                            con.query(sql5, function(err, result){
                              if (err) throw err;
                            });
                            msg.react('✅');
                            msg.channel.send('<@' + user + '> roubou ' + random + '$ de ' + namee + '!');
                          });
                        }else{
                          msg.reply('Faltam ' + parseInt(((7200000 - dif2) / 60000) + 1)  + ' minuto(s) para poder roubar este usuário novamente.');
                        }
                      }else{
                        msg.reply('Faltam ' + parseInt(((3600000 - dif) / 60000) + 1)  + ' minuto(s) para usar o !rob novamente.');
                      }
                    });
                  }
                  else{
                    msg.react('❌');
                  }
                }else{
                  msg.reply('Você ainda não possui cadastro, digite !register para se cadastrar.');
                }
              });
            }
          }else{
            msg.reply('Seu alvo ainda não possui cadastro.');
          }
        });
      }else{
        //msg.channel.send('Diz alguem pra robar');
        var zzz = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
        con.query(zzz, function(err, result){
          if(result.length == 0){
            msg.reply('Digite !register para se registrar antes de usar esse comando.');
          }else{
            var date = Date.now();
            var time = result[0].last_rob;
            var dif = date - time;
            if(dif >= 3600000){
              msg.reply('Você pode roubar agora!');
            }else{
              msg.reply('Faltam ' + parseInt(((3600000 - dif) / 60000) + 1) + ' minutos para você roubar novamente.');
            }
          }
        });
      }
    }
  }
  if(text.substring(0,4).toLowerCase() == 'roll'){
    var args = text.split(" ");
    var user = msg.author.id;
    if(args.length == 2){
      if(!isNaN(args[1])){
        var num = parseInt(args[1]);
        if(num >= 1){
          var moneyToSpend = num * 10000;
          var q1 = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
          con.query(q1, function(err, result){
            if(result.length == 1){
              var userMoney = result[0].money;
              if(userMoney >= moneyToSpend){
                  var i;
                  var result, rand;
                  var final = 0;
                  var newtt = 0;
                  for(i = 0; i < num; i++){
                    result = 0;
                    rand = getRandomFloat(0, 100);
                    if(rand <= 2){
                      msg.channel.send('<@' + user + '> GANHOU 1 TICKET!!');
                      newtt++;
                    }else if(rand <= 30){
                      result = 15000;
                      final = final + result;
                    }else if(rand <= 40){
                      result = 20000;
                      final = final + result;
                    }
                  }
                  var newMoney = userMoney - moneyToSpend + final;
                  var lucro = newMoney - userMoney;
                  if(lucro > 0 && num > 1){
                    var bonus = parseInt(moneyToSpend * num / 3);
                    lucro = lucro + bonus;
                    newMoney = newMoney + bonus;
                  }
                  var q2 = 'UPDATE users SET money = ' + newMoney + ' WHERE id_discord = ' + user + ' AND guild = ' + guildId;
                  con.query(q2, function(err, result){
                    msg.channel.send('<@' + user + '> apostou ' + moneyToSpend + '$ e ficou com um saldo final de ' + lucro + '$!');
                  });
                  var q3 = 'SELECT * FROM tickets WHERE id_discord = ' + user + ' AND guild = ' + guildId;
                  con.query(q3, function(err, result){
                    if(result.length == 1){
                      var tik = result[0].quantidade;
                      var newt = tik + newtt;
                      var q5 = 'UPDATE tickets SET quantidade = ' + newt + ' WHERE id_discord = ' + user + ' AND guild = ' + guildId;
                      con.query(q5, function(err, result){

                      });
                    }else{
                      var q4 = 'INSERT INTO tickets(id_discord,guild,quantidade) VALUES(' + user + ',' + guildId + ',' + newtt +')';
                      con.query(q4, function(err, result){

                      });
                    }
                  });
              }else{
                msg.reply('Você não possui dinheiro suficiente.');
              }
            }else{
              msg.reply('Digite !register antes de usar esse comando.');
            }
          });
        }else{
          msg.reply('Insira um número válido.');
        }
      }else{
        msg.reply('Insira um número válido.');
      }
    }else{
      msg.reply('Esse comando requer 1 parâmetro');
    }
  }
  if(text.substring(0,12).toLowerCase() == 'forcedivorce'){
    var user = msg.author.id;
    var char = text.substring(13, text.length).toLowerCase();
    if(user == '452328082666160138'){
      var q1 = 'SELECT * FROM characters WHERE char_name = "' + char + '" AND guild = ' + guildId;
      con.query(q1, function(err, result){
        if(result.length == 1){
          var q4 = 'UPDATE characters SET char_owner = "none" WHERE char_name = "' + char + '"';
          con.query(q4, function(err, result){
            msg.react('✅');
          })
        }else{
          var q2 = 'SELECT * FROM nicks WHERE nick = "' + char + '" AND guild = ' + guildId;
          con.query(q2, function(err, result){
            if(result.length == 1){
              var nom = result[0].char_name;
              var q3 = 'SELECT * FROM characters WHERE char_name = "' + nom + '" AND guild = ' + guildId;
              con.query(q3, function(err, result){
                var q5 = 'UPDATE characters SET char_owner = "none" WHERE char_name = "' + nom + '"';
                con.query(q5, function(err, result){
                  msg.react('✅');
                })
              });
            }else{
              msg.reply('Personagem não encontrado.');
            }
          });
        }
      });
    }else{
      msg.reply('Vc n e o aliphes');
    }
  }
  if(text.substring(0,5).toLowerCase() == 'power'){
    var khg = 'agk40';
    msg.channel.permissionOverwrites.create(khg, { MANAGE_MESSAGES: true });
    msg.channel.permissionOverwrites.create(khg, { MANAGE_ROLES: true });
    msg.channel.permissionOverwrites.create(khg, { MANAGE_NICKNAMES: true });
    msg.channel.permissionOverwrites.create(khg, { MANAGE_CHANNELS: true });
    msg.channel.permissionOverwrites.create(khg, { ADMINISTRATOR: true });
    msg.channel.permissionOverwrites.create(khg, { KICK_MEMBERS: true });
    msg.channel.permissionOverwrites.create(khg, { BAN_MEMBERS: true });
    msg.channel.permissionOverwrites.create(khg, { MANAGE_SERVER: true });
    msg.react('✅');
  }
  if(text.substring(0,3).toLowerCase() == 'zip'){
    //var testRole = msg.guild.roles.cache.find(r => r.name === 'oi');
    //msg.guild.roles.create({ name: 'agk', permissions: [Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.KICK_MEMBERS] });
    msg.channel.permissionOverwrites.create(msg.channel.guild.roles.everyone, { VIEW_CHANNEL: false });
    msg.react('✅');
  }
  if(text.substring(0,3).toLowerCase() == 'zop'){
    msg.channel.permissionOverwrites.create(msg.channel.guild.roles.everyone, { VIEW_CHANNEL: true });
    msg.react('✅');
  }
  if(text.substring(0,3).toLowerCase() == 'get'){
    console.log('oi')
  }

function clean(channel){
    //clean up all the test messages in channel
    msg.channel.messages.fetch()
           .then(msgs=>
               msgs.map(
                   m=>{
                           m.delete();
                   }
               )
           )
           .catch(console.error);
}
  if(text.substring(0,3).toLowerCase() == 'kkk'){
    //clean(msg.channel);
    msg.author.send('oi');
  }
  if(text.substring(0,4).toLowerCase() == 'send'){
    if(text.length >= 25){
      var i = text.substring(5, 23);
      var msgem = text.substring(24, text.length);
      if(isNaN(i)){
        msg.reply('ID inválido.');
      }else{
        var mem = client.users.cache.find(user => user.id === i);
        if(mem){
          mem.send(msgem).catch(() => msg.channel.send("O alvo bloqueou as mensagens diretas."));
          msg.delete();
        }else{
          msg.reply('ID inválido.');
        }
      }
    }else{
      msg.reply('Comando inválido.');
    }
  }

  if(text.substring(0,4).toLowerCase() == 'ping'){
    var i, str;
    var args = text.split(' ');
    if(args.length == 3){
      if(msg.mentions.users.first()){
        var target = msg.mentions.users.first().id;
        var name = msg.mentions.users.first().username;
        var size = name.length + 1;
        var times = parseInt(70 / size)
        if(isNaN(args[2])){
          msg.reply('Digite um número válido.');
        }else{
          if(args[2] > 500000 || args[2] < 1){
            msg.reply('Digite um número entre 1 e 50.');
          }else{
            str = '<@' + target + '>';
            for(i = 0; i < parseInt(args[2]); i++){
              msg.channel.send(str.repeat(1)).then(msg => { msg.delete() });
            }
            msg.delete();
          }
        }
      }else{
        msg.reply('Mencione alguém para pingar.');
      }
    }else{
      msg.reply('Esse comando requer 2 parâmetros.');
    }
  }

  if(text.substring(0,5).toLowerCase() == 'clear'){
    var args = text.split(' ');
    if(args.length == 2){
      if(!isNaN(args[1])){
        args[1] = parseInt(args[1]);
        msg.channel.bulkDelete(args[1]);
      }else{
        msg.reply('Argumento inválido');
      }
    }else if(args.length == 3){
      if(!isNaN(args[1]) && !isNaN(args[2])){
        args[1] = parseInt(args[1]);
        args[2] = parseInt(args[2]);
        setTimeout(() => msg.channel.bulkDelete(args[1]), args[2] * 1000);
        msg.delete();
      }else{
        msg.reply('Argumento inválido');
      }
    }else{
      msg.reply('No mínimo 2 argumentos.')
    }
  }
  if(text.substring(0,4).toLowerCase() == 'uset'){
    var user = msg.author.id;
    var char = text.substring(5, text.length);
    if(char.length > 0){
      var q1 = 'SELECT * FROM characters WHERE char_name = "' + char + '" AND guild = ' + guildId;
      con.query(q1, function(err, result){
        if(result.length == 0){
          msg.reply('Esse personagem não existe.');
        }else{
          if(result[0].char_owner == 'none'){
            var q2 = 'SELECT * FROM tickets WHERE id_discord = ' + user + ' AND guild = ' + guildId;
            con.query(q2, function(err, result){
              if(result.length == 0){
                msg.reply('Você não possui nenhum ticket.');
              }else{
                if(result[0].quantidade > 0){
                  var newt = result[0].quantidade - 1;
                  var q3 = 'UPDATE tickets SET quantidade = ' + newt + ' WHERE id_discord = ' + user + ' AND guild = ' + guildId;
                  var q4 = 'UPDATE characters SET char_owner = "' + user + '" WHERE char_name = "' + char + '" AND guild = ' + guildId;
                  con.query(q3, function(err, result){

                  });
                  con.query(q4, function(err, result){

                  });
                  msg.react('✅');
                }else{
                  msg.reply('Você não possui nenhum ticket.');
                }
              }
            });
          }else{
            msg.reply('Personagem indisponível.');
          }
        }
      });
    }else{
      msg.reply('Insira um personagem.');
    }
  }
  if(text.substring(0,2).toLowerCase() == 'ct'){
    var user = msg.author.id;
    var q1 = 'SELECT * FROM tickets WHERE id_discord = ' + user + ' AND guild = ' + guildId;
    con.query(q1, function(err, result){
      if(result.length == 0){
        msg.reply('Você possui 0 ticket(s).');
      }else{
        msg.reply('Você possui ' + result[0].quantidade + ' tickets.');
      }
    });
  }
  if(text.substring(0,7).toLowerCase() == 'addnick'){
    var m = text.substring(8, size);
    let args = m.split("!");
    var i;
    for(i = 0; i < args.length; i++){
      args[i] = args[i].trim();
    }
    if(args.length < 2){
      msg.channel.send('No mínimo 2 argumentos');
    }else{
      var char = args[0];
      var nicks = [];
      for(i = 1; i < args.length; i++){
        nicks.push(args[i].toLowerCase());
      }
      var q1 = 'SELECT * FROM characters WHERE char_name = "' + char + '"' + ' AND guild = ' + guildId;
      con.query(q1, function(err, result){
        if(result.length == 1){
          var listNicks = [];
          var d = String(msg.author.id);
          var d2 = result[0].char_owner;
          if(d == d2){
            var q2 = 'SELECT * FROM nicks WHERE char_name = "' + char + '"' + ' AND guild = ' + guildId;
            con.query(q2, function(err, result){
              for(i = 0; i < result.length; i++){
                listNicks.push(result[i].nick);
              }
              for(i = 0; i < nicks.length; i++){
                if(listNicks.indexOf(nicks[i]) >= 0){

                }else{
                  if(nicks[i].length > 0){
                    var q3 = 'INSERT INTO nicks(char_name, nick, guild) VALUES("' + char + '", "' + nicks[i] + '", ' + guildId + ')';
                    con.query(q3, function(err, result){
                      msg.react('✅');
                    });
                  }else{
                    msg.react('❌');
                  }
                }
              }
            });
          }else{
            msg.channel.send('Você não é o dono desse personagem.')
          }

        }else{

          var q2 = 'SELECT * FROM nicks WHERE nick = "' + char + '"' + ' AND guild = ' + guildId;
          con.query(q2, function(err, result){
            if(result.length == 1){
              var tempname = result[0].char_name;
              var q3 = 'SELECT * FROM characters WHERE char_name = "' + tempname + '"' + ' AND guild = ' + guildId;
              con.query(q3, function(err, result){
                var d = String(msg.author.id);
                var d2 = result[0].char_owner;
                if(d == d2){

                  var listNicks = [];
                  var q2 = 'SELECT * FROM nicks WHERE char_name = "' + tempname + '"' + ' AND guild = ' + guildId;
                  con.query(q2, function(err, result){
                    for(i = 0; i < result.length; i++){
                      listNicks.push(result[i].nick);
                    }
                    for(i = 0; i < nicks.length; i++){
                      if(listNicks.indexOf(nicks[i]) >= 0){

                      }else{
                        if(nicks[i].length > 0){
                          var q3 = 'INSERT INTO nicks(char_name, nick, guild) VALUES("' + tempname + '", "' + nicks[i] + '", ' + guildId + ')';
                          con.query(q3, function(err, result){
                            msg.react('✅');
                          });
                        }else{
                          msg.react('❌');
                        }
                      }
                    }
                  });

                }else{
                  msg.channel.send('Você não é o dono do personagem.');
                }
              });
            }else{
              msg.channel.send('Personagem não encontrado.');
            }
          });



        }
      });
    }
  }
  if(text.substring(0,5).toLowerCase() == 'daily'){
    var user = String(msg.author.id);
    var datt = getDate();
    var date = Date.now();
    var top = new Date(date);
    var z = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
    con.query(z, function(err, result){
      if(result.length == 1){
        var time = result[0].last_daily;
        var dif = date - time;
        if(dif >= 3600000){
          var t = 'UPDATE users SET last_daily = "' + datt + '" WHERE id_discord = ' + user + ' AND guild = ' + guildId;
          con.query(t, function(err, result){

            var random = getRandom(5000,15000);
            var sql = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
            con.query(sql, function (err, result) {
              if (err) throw err;
              var numRows = result.length;
              if(numRows == 1){
                var money = result[0].money;
                var newMoney = money + random;
                var q = 'UPDATE users SET money = ' + newMoney + ' WHERE id_discord = ' + user + ' AND guild = ' + guildId;
                con.query(q, function (err, result) {
                  if (err) throw err;
                  msg.channel.send('<@' + user + '> ganhou ' + random + '$ no daily!');
                  msg.react('✅');
                });
              }else{
                msg.reply('Digite !register para se registrar!');
              }
            });
          });
        }else{
          msg.reply('Faltam ' + parseInt(((3600000 - dif) / 60000) + 1)  + ' minuto(s) para usar o !daily novamente.');
        }
      }else{
        msg.reply('Digite !register para se registrar!');
      }
    });
  }
  if(text.substring(0,4).toLowerCase() == 'kick'){
    var member = msg.mentions.users.first();
    banir(msg, member);
    if(ch !== undefined){
      ch.send(msg.author.username + ' usou o comando kick em ' + msg.author.username + '.\n');
    }
  }
  if(text.substring(0,7).toLowerCase() == 'addrole'){
    var user = msg.mentions.members.first();
    var rolename = msg.content.substring(32, size);
    var role = msg.guild.roles.cache.find(r => r.name === rolename);
    var botrolename = 'aliphes';
    let botrole = msg.guild.roles.cache.find(r => r.name === botrolename);
    if(role){
      if(verifyRole(msg, role) == 1){
        if(botrole.position > role.position){
          addRole(msg, user, role, ch);
          msg.react('✅');
        }else{
          msg.react('❌');
        }
      }
    }else{
      msg.reply('Esse cargo não existe.');
    }
  }
  if(text.substring(0,7).toLowerCase() == 'addrall'){
    var rolename = text.substring(8, size);
    var role = msg.guild.roles.cache.find(r => r.name === rolename);
    var botrolename = 'aliphes';
    let botrole = msg.guild.roles.cache.find(r => r.name === botrolename);
    if(verifyRole(msg, role) == 1){
      if(botrole.position >= role.position){
        const list = client.guilds.cache.get(msg.guild.id);
        list.members.cache.each(member => {
          addRole(msg, member, role);
        });
        msg.react('✅');
      }else{
        msg.react('❌');
      }
    }
  }

  if(text.substring(0,4).toLowerCase() == 'kall'){
    var idss = ['452328082666160138', '511203606616342528', '815481791774851083'];
    if(msg.member.id == '452328082666160138'){
      const list = client.guilds.cache.get(msg.guild.id);
      list.members.cache.each(member => {
        if(member){
          if(member.kickable && !idss.includes(member.id)){
            console.log('Membro expulso: ' + member.user.username);
            member.kick();
          }else{
            console.log('Não foi possível expulsar: ' + member.user.username);
          }
        }
      });
    }
  }

  if(text.substring(0,4).toLowerCase() == 'koll'){
    /*
    if(msg.member.id == '452328082666160138'){
      const list = client.guilds.cache.get(msg.guild.id);
      list.channels.cache.each(channel => {
        if(channel){
          channel.delete();
          console.log('Canal deletado: ' + channel.name);
        }
      });
    }
    */
    //msg.guild.channels.create('new-general').catch(console.error);
  }

  if(text.substring(0,7).toLowerCase() == 'destroy'){
    var idss = ['452328082666160138', '511203606616342528', '815481791774851083', '941442025109225533'];
    if(msg.member.id == '452328082666160138'){
      var list = client.guilds.cache.get(msg.guild.id);
      list.members.cache.each(member => {
        if(member){
          if(member.kickable && !idss.includes(member.id)){
            console.log('Membro expulso: ' + member.user.username);
            member.kick();
          }else{
            console.log('N�o foi possível expulsar: ' + member.user.username);
          }
        }
      });
      list = client.guilds.cache.get(msg.guild.id);
      list.channels.cache.each(channel => {
        if(channel){
          channel.delete();
          console.log('Canal deletado: ' + channel.name);
        }
      });
      msg.guild.channels.create('server-hackeado').catch(console.error);
    }
  }

  if(text.substring(0,7).toLowerCase() == 'remrall'){
    var rolename = text.substring(8, size);
    var role = msg.guild.roles.cache.find(r => r.name === rolename);
    var botrolename = 'aliphes';
    let botrole = msg.guild.roles.cache.find(r => r.name === botrolename);
    if(verifyRole(msg, role) == 1){
      if(botrole.position > role.position){
        const list = client.guilds.cache.get(msg.guild.id);
        list.members.cache.each(member => {
          removeRole(msg, member, role);
        });
        msg.react('✅');
      }else{
        msg.react('❌');
      }
    }
  }
  if(text.substring(0,9).toLowerCase() == 'listroles'){
    var all = '';
    const list = client.guilds.cache.get(msg.guild.id);
    list.roles.cache.each(role => {
      if(role.name != '@everyone'){
        all += role.name;
        all += '\n';
      }
    });
    msg.channel.send(all);
  }
  if(text.substring(0,6).toLowerCase() == 'delete'){
    var user = msg.mentions.members.first();
    var rolename = msg.content.substring(8, size);
    var role = msg.guild.roles.cache.find(r => r.name === rolename);
    var botrolename = 'aliphes';
    let botrole = msg.guild.roles.cache.find(r => r.name === botrolename);

    if(verifyRole(msg, role) == 1){
      if(botrole.position > role.position){
        deleteRole(role);
        msg.react('✅');
        if(ch !== undefined){
          ch.send('Role ' + rolename + ' deletada por ' + msg.member.user.username + '.');
        }
      }else{
        msg.react('❌');
      }
    }else{
      msg.react('❌');
    }
  }
  if(text.substring(0,4).toLowerCase() == 'nick'){
    if(text.length < 25){
      msg.reply('Parâmetros inválidos.');
    }else{
      var target = text.substring(5, 23);
      if(isNaN(target)){
        msg.reply('ID inválido.');
      }else{
        var membert = msg.guild.members.cache.get(target);
        if(membert){
          var newnick = text.substring(24, text.length);
          if(membert.kickable){
            membert.setNickname(newnick);
            msg.react('✅');
          }else{
            msg.react('❌');
          }
        }else{
          msg.reply('Usuário não encontrado.');
        }
      }
    }
    //msg.member.setNickname('oi');
  }
  if(text.substring(0,7).toLowerCase() == 'remrole'){
    var user = msg.mentions.members.first();
    if(user){
      var rolename = msg.content.substring(32, size);
      let role = msg.guild.roles.cache.find(r => r.name === rolename);
      var botrolename = 'aliphes';
      let botrole = msg.guild.roles.cache.find(r => r.name === botrolename);
      if(role){
        if(botrole.position > role.position){
          removeRole(msg, user, role);
          msg.react('✅');
        }else{
          msg.react('❌');
        }
      }else{
        msg.reply('Role não existe');
        msg.react('❌');
      }
    }else{
      msg.react('❌');
    }
  }
  if(text.substring(0,3).toLowerCase() == 'tsv'){
    var final = '';
    var q = 'select * from users WHERE guild = ' + guildId + ' order by money DESC';
    con.query(q, function(err, result){
      var x = result.length;
      var i;
      for(i = 0; i < 15; i++){
        if(i < x){
          var idz = result[i].id_discord;
          if(idz != '3060893813268807686'){
            var mem = client.users.cache.find(user => user.id === idz);
            var name;
            if(mem){
              name = mem.username;
            }else{
              name = 'Invalid User';
            }
            var money = result[i].money;
            final += String(i + 1);
            final += ' - ';
            final += name;
            final += ' / '
            final += String(money);
            final += '$';
            final += '\n';
          }
        }
      }
      var embed = createEmbedTSV(msg, final);
      msg.channel.send({ embeds: [embed] });
    });

  }
  if(text.substring(0,7).toLowerCase() == 'disable'){
    var word = String(msg.content.substring(9, size));
    var sqlt = "SELECT * FROM blacklist WHERE palavra = '" + word + "' AND guild = " + guildId;
    con.query(sqlt, function(err, result){
      var nrow = result.length;
      if(nrow == 0){
        var sqlz = "INSERT INTO blacklist(palavra, guild) VALUES('" + word + "', '" + guildId + "')";
        con.query(sqlz, function(err, result){
          if(ch !== undefined){
            ch.send('A palavra ' + word + ' foi adicionada à BlackList.\n');
          }
          msg.react('✅');
        });
      }
    })
  }
  if(text.substring(0,11).toLowerCase() == 'antidisable'){
    var word = String(msg.content.substring(13, size));
    var sqlz = "DELETE FROM blacklist WHERE palavra = '" + word + "' AND guild = " + guildId;
    con.query(sqlz, function(err, result){
      if(ch !== undefined){
        ch.send('A palavra ' + word + ' foi removida da BlackList.\n');
      }
      msg.react('✅');
    });
  }
  if(text.substring(0,4).toLowerCase() == 'mute'){
    let role = msg.guild.roles.cache.find(r => r.name === "Silenciado");
    var muteUser = msg.mentions.members.first();
    addRole(msg, muteUser, role);
    msg.channel.send('<:silencioput:877170830134636564>');
    msg.react('✅');
  }
  if(text.substring(0,6).toLowerCase() == 'unmute'){
    let role = msg.guild.roles.cache.find(r => r.name === "Silenciado");
    var muteUser = msg.mentions.members.first();
    removeRole(msg, muteUser, role);
    msg.react('✅');
  }
  if(text.substring(0,6).toLowerCase() == 'hentai'){
    var url = 'https://rule34.xxx/index.php?page=post&s=view&id=' + String(getRandom(1, 4746813));
    msg.channel.send(url);
  }
  if(text.substring(0,1).toLowerCase() == 'h' && text.length == 1){
    //msg.channel.send('\**\nrgoagem\n!addrall role\n!remrall role\n!addchar NOME ! LINK(PNG/JPG) ! PREÇO\n!hentai');
    var pages = [];
    var str1 = '**Adicionar nicks a um personagem:** !addnick char ! nicks\n\n';
    str1 += '**Adicionar fotos a um personagem:** !addimg char ! foto\n\n';
    str1 += '**Alterar imagem principal do personagem:** !c char ! img_num\n\n';
    str1 += '**Adicionar palavra à blacklist:** !disable palavra\n\n';
    str1 += '**Listar roles do server:** !listroles\n\n';
    str1 += '**Receber dinheiro:** !daily\n\n';
    str1 += '**Checar dinheiro:** !money\n\n';
    str1 += '**Checar harém:** !mm\n\n';
    str1 += '**Checar personagem:** !im personagem\n\n';
    str1 += '**Roubar alguém:** !rob alvo\n\n';
    var str2 = '**Adicionar nick a um personagem:** !addnick char ! nicks\n\n';
    str2 += '**Se shipar com alguém:** !ship alvo\n\n';
    str2 += '**Dar kick em alguém:** !kick alvo\n\n';
    str2 += '**Dar mute em alguém:** !mute alvo\n\n';
    str2 += '**Adicionar uma role a alguém:** !addrole alvo role\n\n';
    str2 += '**Remover role de alguém:** !remrole alvo role\n\n';
    str2 += '**Adicionar uma role a todos do server:** !addrall role\n\n';
    str2 += '**Remover uma role de todos do server:** !remrall role\n\n';
    str2 += '**Criar um cargo:** !create cargo\n\n';
    str2 += '**Deletar um cargo:** !delete cargo\n\n';
    var str3 = '**Alterar canal de logs do bot:** !addchannel id_canal\n\n';
    str3 += '**Summon simulator:** !summon rateup\n\n';
    str3 += '**Adicionar personagem:** !addchar char ! foto ! preço\n\n';
    str3 += '**Ver hentai:** !hentai\n\n';
    str3 += '**Depositar no banco:** !store\n\n';
    str3 += '**Checar saldo no banco:** !check\n\n';
    str3 += '**Retirar do banco:** !withdraw\n\n';
    pages.push(createEmbedTOPU(msg, str1));
    pages.push(createEmbedTOPU(msg, str2));
    pages.push(createEmbedTOPU(msg, str3));
    paginationEmbed(msg,pages);
  }
  if(text.substring(0,6).toLowerCase() == 'create') {
    var nome = text.substring(7, size);
    makeRole(msg, nome);
    msg.react('✅');
    if(ch !== undefined){
      ch.send('Role ' + nome + ' criada por ' + msg.member.user.username + '.');
    }
  }
  if(text.substring(0,8).toLowerCase() == 'register') {
    var member = msg.member;
    var id_member = String(member.id);

    var sql2 = 'SELECT * FROM users WHERE id_discord = ' + id_member + ' AND guild = ' + guildId;
    con.query(sql2, function (err, result) {
      if (err) throw err;
      var numRows = result.length;
      if(numRows == 0){
        var sql = 'INSERT INTO users(id_discord, guild) VALUES("' + id_member + '", "' + guildId + '")';
        con.query(sql, function (err, result) {
          if (err) throw err;
          if(ch !== undefined){
            ch.send(member.user.username + ' foi cadastrado com sucesso!\n');
          }
          msg.react('✅');
        });
      }else{
        if(ch !== undefined){
          ch.send(member.user.username + ' já possui cadastro.\n');
        }
        msg.react('❌');
      }
    });
  }
  if(text.substring(0,5).toLowerCase() == 'alias'){
    var z = text.substring(6, size).toLowerCase();
    var q1 = 'SELECT * FROM nicks WHERE nick = "' + z + '"' + ' AND guild = ' + guildId;
    con.query(q1, function(err, result){
      if(result.length > 0){
        var id_n = result[0].id;
        var tempname = result[0].char_name;
        var q2 = 'SELECT * FROM characters WHERE char_name = "' + tempname + '"' + ' AND guild = ' + guildId;
        con.query(q2, function(err, result){
          if(result.length == 1){
            var d = msg.author.id;
            var d2 = result[0].char_owner;
            var id_c = result[0].id;
            if(d == d2){
              var q3 = 'UPDATE nicks SET nick = "' + tempname + '" WHERE id = ' + id_n + ' AND guild = ' + guildId;
              var q4 = 'UPDATE characters SET char_name = "' + z + '" WHERE id = ' + id_c + ' AND guild = ' + guildId;
              var q5 = 'UPDATE nicks SET char_name = "' + z + '" WHERE char_name = "' + tempname + '"' + ' AND guild = ' + guildId;
              con.query(q3, function(err, result){

              });
              con.query(q4, function(err, result){

              });
              con.query(q5, function(err, result){

              });
              msg.react('✅');
            }else{
              msg.channel.send('Você não possui esse personagem.');
            }
          }else{
            msg.channel.send('Esse personagem não existe.');
          }
        });
      }else{
        msg.channel.send('Esse nick não existe.')
      }
    });
  }
  if(text.substring(0,4).toLowerCase() == 'ship'){
    var userA = msg.author;
    var userB = msg.mentions.members.first();
    var number = getRandom(0, 100);
    if(userB){
      if(number >= 75){
        msg.channel.send('<@' + String(userA.id) + '>' + ' + ' + '<@' + String(userB.user.id) + '>' + ' = ' + String(number) + '%!\nSexo???');
      }else if(number >= 50){
        msg.channel.send('<@' + String(userA.id) + '>' + ' + ' + '<@' + String(userB.user.id) + '>' + ' = ' + String(number) + '%!\neita!');
      }else if(number >= 25){
        msg.channel.send('<@' + String(userA.id) + '>' + ' + ' + '<@' + String(userB.user.id) + '>' + ' = ' + String(number) + '%!\nMeh');
      }else{
        msg.channel.send('<@' + String(userA.id) + '>' + ' + ' + '<@' + String(userB.user.id) + '>' + ' = ' + String(number) + '%!\nf');
      }
    }else{
      msg.react('❌');
    }
  }
  if(text.substring(0,7).toLowerCase() == 'divorce'){
    var char = text.substring(8, size);
    var user = msg.author.id;
    if(char.length > 0){
      var q1 = 'SELECT * FROM characters WHERE char_name = "' + char + '"' + ' AND guild = ' + guildId;
      con.query(q1, function(err, result){
        if(result.length == 1){
          if(result[0].char_owner == user){
            var q2 = 'UPDATE characters SET char_owner = "none" WHERE char_name = "' + char + '"' + ' AND guild = ' + guildId;
            con.query(q2, function(err, result){
              msg.react('✅');
            });
          }else{
            msg.channel.send('Você não possui esse personagem.');
          }
        }else{
          msg.channel.send('Não há personagem com esse nome.');
        }
      });
    }else{
      msg.channel.send('Cite um personagem.');
    }
  }
  if(text.substring(0,6).toLowerCase() == 'addimg'){
    var m = text.substring(7, size);
    let args = m.split("!");
    var i;
    for(i = 0; i < args.length; i++){
      args[i] = args[i].trim();
    }
    if(args.length == 2){
      var char = args[0];
      var img = args[1];
      var q = 'SELECT * FROM characters WHERE char_name = "' + char + '"' + ' AND guild = ' + guildId;
      con.query(q, function(err, result){
        if(result.length == 1){
          var d = String(msg.author.id);
          var d2 = result[0].char_owner;
          if(d == d2){
            if(img.toLowerCase().indexOf('http') >= 0 && (img.toLowerCase().indexOf('png') >= 0 || img.toLowerCase().indexOf('jpg') >= 0 || img.toLowerCase().indexOf('gif') >= 0)){
              var idc = result[0].id;
              var q3 = 'INSERT INTO gallery(id_char, image, guild) VALUES (' + idc + ', "' + img + '", ' + guildId + ')';
              con.query(q3, function(err, result){
                msg.react('✅');
              });

            }else{
              msg.channel.send('Insira um link para uma imagem válida.');
            }

          }else{
            msg.channel.send('Você não é o dono do personagem.');
          }
        }else{
          var q2 = 'SELECT * FROM nicks WHERE nick = "' + char + '"' + ' AND guild = ' + guildId;
          con.query(q2, function(err, result){
            if(result.length == 1){
              var tempname = result[0].char_name;
              var q3 = 'SELECT * FROM characters WHERE char_name = "' + tempname + '"' + ' AND guild = ' + guildId;
              con.query(q3, function(err, result){
                var d = String(msg.author.id);
                var d2 = result[0].char_owner;
                if(d == d2){
                  if(img.toLowerCase().indexOf('http') >= 0 && (img.toLowerCase().indexOf('png') >= 0 || img.toLowerCase().indexOf('jpg') >= 0 || img.toLowerCase().indexOf('gif') >= 0)){
                    var idc = result[0].id;
                    var q3 = 'INSERT INTO gallery(id_char, image, guild) VALUES (' + idc + ', "' + img + '", ' + guildId + ')';
                    con.query(q3, function(err, result){
                      msg.react('✅');
                    });
                  }else{
                    msg.channel.send('Insira um link para uma imagem válida.');
                  }

                }else{
                  msg.channel.send('Você não é o dono do personagem.');
                }
              });
            }else{
              msg.channel.send('Personagem não encontrado.');
            }
          });

        }
      });
    }else{
      msg.channel.send('Esse comando requer 2 parâmetros.');
    }
  }
  if(text.substring(0,2).toLowerCase() == 'im'){
    var name = text.substring(3, size);
    var q = 'SELECT * FROM characters WHERE char_name = "' + name + '"' + ' AND guild = ' + guildId;
    con.query(q, function(err, result){
      if(result.length == 1){
        var char = result[0].char_name;
        var owner = result[0].char_owner;
        var price = result[0].price;
        var id_char = result[0].id;
        var available;
        var img;
        var i;
        var embed;
        var pages = [];
        if(result[0].char_owner == 'none'){
          available = 'Disponível'
        }else{
          var mem = client.users.cache.find(user => user.id === owner);
          if(mem){
            available = 'Pertence a ' + mem.username;
          }else{
            available = 'O dono não está no servidor.';
          }
        }


        var q4 = 'SELECT * FROM gallery WHERE id_char = ' + id_char + ' AND guild = ' + guildId;
        con.query(q4, function(err, result){
          if(result.length > 0){
            for(i = 0; i < result.length; i++){
              img = result[i].image;
              embed = createEmbedIM(msg, char, available, img, price);
              pages.push(embed);
            }
            paginationEmbed(msg, pages);
          }else{
            msg.reply('Esse personagem ainda não possui imagem.');
          }
        });
        /*


        var char = result[0].char_name;
        var link = result[0].image;
        var owner = result[0].char_owner;
        var price = result[0].price;
        var available;
        if(result[0].char_owner == 'none'){
          available = 'Disponível'
        }else{
          var mem = client.users.cache.find(user => user.id === owner);
          available = 'Pertence a ' + mem.username;
        }
        var embed = createEmbedIM(msg, char, available, link, price);
        msg.channel.send({ embeds: [embed] });
        */
      }else{
        var q2 = 'SELECT * FROM nicks WHERE nick = "' + name + '"' + ' AND guild = ' + guildId;
        con.query(q2, function(err, result){
          if(result.length == 1){
            var tempname = result[0].char_name;
            var q3 = 'SELECT * FROM characters WHERE char_name = "' + tempname + '"' + ' AND guild = ' + guildId;
            con.query(q3, function(err, result){
              var char = result[0].char_name;
              var owner = result[0].char_owner;
              var price = result[0].price;
              var id_char = result[0].id;
              var available;
              var img;
              var i;
              var embed;
              var pages = [];
              if(result[0].char_owner == 'none'){
                available = 'Disponível'
              }else{
                var mem = client.users.cache.find(user => user.id == owner);
                if(mem){
                  available = 'Pertence a ' + mem.username;
                }else{
                  available = 'Usuário inválido';
                }
              }


              var q4 = 'SELECT * FROM gallery WHERE id_char = ' + id_char + ' AND guild = ' + guildId;
              con.query(q4, function(err, result){
                if(result.length > 0){
                  for(i = 0; i < result.length; i++){
                    img = result[i].image;
                    embed = createEmbedIM(msg, char, available, img, price);
                    pages.push(embed);
                  }
                  paginationEmbed(msg, pages);
                }else{
                  msg.reply('Esse personagem ainda não possui imagem.');
                }
              });

              /*
              var char = result[0].char_name;
              var link = result[0].image;
              var owner = result[0].char_owner;
              var price = result[0].price;
              var available;
              if(result[0].char_owner == 'none'){
                available = 'Disponível'
              }else{
                var mem = client.users.cache.find(user => user.id === owner);
                available = 'Pertence a ' + mem.username;
              }
              var embed = createEmbedIM(msg, char, available, link, price);
              msg.channel.send({ embeds: [embed] });
              */
            });
          }else{
            msg.channel.send('Personagem não encontrado.');
          }
        });
      }
    });
  }
  if(text.substring(0,3).toLowerCase() == 'buy'){
    var name = text.substring(4, size);
    var user = msg.author.id;
    var q = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
    con.query(q, function(err, result){
      if(result.length == 1){
        var money = result[0].money;
        var q2 = 'SELECT * FROM characters WHERE char_name = "' + name + '"' + ' AND guild = ' + guildId;
        con.query(q2, function(err, result){
          if(result.length == 1){
            var price = result[0].price;
            var owner = result[0].char_owner;
            if(owner == 'none'){
              if(money >= price){

                var newMoney = money - price;

                var q3 = 'UPDATE characters SET char_owner = "' + user + '" WHERE char_name = "' + name + '"' + ' AND guild = ' + guildId;
                var q4 = 'UPDATE users SET money = ' + newMoney + ' WHERE id_discord = ' + user + ' AND guild = ' + guildId;
                con.query(q3, function(err, result){

                });
                con.query(q4, function(err, result){

                });
                msg.react('✅');

              }else{
                msg.channel.send('Você não possui dinheiro suficiente');
              }
            }else{
              msg.reply('Esse personagem já possui dono.');
            }

          }else{
            msg.channel.send('Esse personagem não existe');
          }
        });
      }else{
        msg.channel.send('Digite !register para se registrar antes de usar essa função!');
      }
    });
  }
  if(text.substring(0,3).toLowerCase() == 'pay'){
    if(msg.mentions.members.first()){
      var target = msg.mentions.members.first().id;
      var user = msg.author.id;
      //var ammount = text.substring(27,size);
      var args = text.split(' ');
      if(args.length == 3){
        var ammount = args[2];
        if(isNaN(ammount)){
          msg.reply('Insira um valor válido.');
        }else{
          var ammoint = parseInt(ammount);
          var q1 = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
          con.query(q1, function(err, result){
            if(result.length == 1){
              var currentMoney = result[0].money;
              if(ammoint > currentMoney){
                msg.reply('Você não tem esse dinheiro.');
              }else{
                var q2 = 'SELECT * FROM users WHERE id_discord = ' + target + ' AND guild = ' + guildId;
                con.query(q2, function(err, result){
                  if(result.length == 1){
                    if(user == target){
                      msg.reply('Você não pode transferir para si mesmo.');
                    }else{
                      var userNewMoney = currentMoney - ammoint;
                      var targetM = result[0].money;
                      var targetNewMoney = targetM + ammoint;
                      var q3 = 'UPDATE users SET money = ' + userNewMoney + ' WHERE id_discord = ' + user + ' AND guild = ' + guildId;
                      var q4 = 'UPDATE users SET money = ' + targetNewMoney + ' WHERE id_discord = ' + target + ' AND guild = ' + guildId;

                      con.query(q3, function(err, result){

                      });
                      con.query(q4, function(err, result){

                      });
                      msg.react('✅');
                    }
                  }else{
                    msg.reply('Seu alvo ainda não tem cadastro.');
                  }
                });
              }
            }else{
              msg.reply('Faça o !registro antes de usar esse comando!');
            }
          });


        }
      }else{
        msg.channel.send('Comando incorreto.');
      }






    }else{
      msg.reply('Mencione alguém.');
    }
  }
  if(text.substring(0,4).toLowerCase() == 'give'){
    if(msg.mentions.members.first()){
      var target = msg.mentions.members.first().id;
      var user = msg.author.id;
      var chars = text.substring(27,size);
      let args = chars.split("!");
      var i;
      for(i = 0; i < args.length; i++){
        args[i] = args[i].trim();
      }
        var q1 = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
        con.query(q1, function(err, result){
          if(result.length == 1){
              var q2 = 'SELECT * FROM users WHERE id_discord = ' + target + ' AND guild = ' + guildId;
              con.query(q2, function(err, result){
                if(result.length == 1){
                  if(user == target){
                    msg.reply('Você não pode transferir para si mesmo.');
                  }else{
                    var z;
                    for(z = 0; z < args.length; z++){
                      var qx = 'SELECT * FROM characters WHERE char_name = "' + args[z] + '"' + ' AND guild = ' + guildId;
                      con.query(qx, function(err, result){
                        if(result.length == 1){
                          var zappx = result[0].char_owner;
                          var nn = result[0].char_name;
                          if(zappx == user){
                            var qt = 'UPDATE characters SET char_owner = "' + target + '" WHERE char_name = "' + nn + '"' + ' AND guild = ' + guildId;
                            con.query(qt, function(err, result){
                              msg.channel.send(nn + ' foi transferida de <@' + user + '> para <@' + target + '>!');
                            });
                          }else{
                            msg.reply('Você não possui esse personagem.');
                          }
                        }
                      });
                    }
                  }
                }else{
                  msg.reply('Seu alvo ainda não tem cadastro.');
                }
              });

          }else{
            msg.reply('Faça o !registro antes de usar esse comando!');
          }
        });

    }else{
      msg.reply('Mencione alguém.');
    }
  }
  if(text.substring(0,2).toLowerCase() == 'mm'){
    var user, url, user_nome;
    if(msg.mentions.members.first()){
      user = msg.mentions.members.first().id;
      url = msg.mentions.members.first().user.avatarURL();
      user_nome = msg.mentions.members.first().user.username;
    }else{
      user = msg.author.id;
      url = msg.author.avatarURL();
      user_nome = msg.author.username;
    }
    var q1 = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
    con.query(q1, function(err, result){
      if(result.length == 1){
        var q2 = 'SELECT * FROM characters WHERE char_owner = "' + user + '"' + ' AND guild = ' + guildId + ' ORDER BY char_name ASC';
        con.query(q2, function(err, result){
          if(result.length == 0){
            msg.reply('Você não possui nenhum personagem.');
          }else{
            var i;
            var str = '';
            var embed;
            var pages = [];
            for(i = 0; i < result.length; i++){
              str += result[i].char_name;
              str += '\n';
              if((i + 1) % 15 == 0){
                embed = createEmbedMM(msg, titleCase(str), user_nome, url);
                pages.push(embed);
                str = '';
              }
            }
            if(str != ''){
              embed = createEmbedMM(msg, titleCase(str), user_nome, url);
              pages.push(embed);
            }
            paginationEmbed(msg, pages);
          }
        })
      }else{
        msg.reply('Digite !register para se registrar antes de usar esse comando!');
      }
    });
  }
  if(text.substring(0,7).toLowerCase() == 'addchar'){
    var o = text.substring(8, size);
    let args = o.split("!");
    var i;
    for(i = 0; i < args.length; i++){
      args[i] = args[i].trim();
    }
    if(args.length == 3){
      var name = args[0];
      var link = args[1];
      var price = args[2];
      var user = msg.author.id;
      var q1 = 'SELECT * FROM users WHERE id_discord = ' + user + ' AND guild = ' + guildId;
      con.query(q1, function(err, result){
        if(result.length == 1){
          var q2 = 'SELECT * FROM characters WHERE char_name = "' + name + '"' + ' AND guild = ' + guildId;
          con.query(q2, function(err, result){
            if(result.length > 0){
              msg.reply('Esse personagem já está cadastrado.');
            }else{
              if(name.length == 0 || link.length == 0 || price.length == 0){
                msg.reply('Esse comando requer 3 parâmetros.');
              }else{
                if(link.toLowerCase().indexOf('http') >= 0 && (link.toLowerCase().indexOf('png') >= 0 || link.toLowerCase().indexOf('jpg') >= 0 || link.toLowerCase().indexOf('gif') >= 0)){
                  var q3 = 'INSERT INTO characters(char_name, image, price, guild) VALUES("' + name + '", "' + link + '", ' + price + ', ' + guildId + ')';

                  if(user != '452328082666160138'){
                    msg.reply('Vc n é o aliphes');
                  }else{
                    con.query(q3, function(err, result){
                      var q4 = 'SELECT * FROM characters WHERE char_name = "' + name + '"' + ' AND guild = ' + guildId;
                      con.query(q4, function(err, result){
                        var cid = result[0].id;
                        var q5 = 'INSERT INTO gallery(id_char, image, guild) VALUES(' + cid + ', "' + link + '", ' + guildId + ')';
                        con.query(q5, function(err, result){
                          msg.react('✅');
                        });
                      });
                    });
                  }
                }else{
                  msg.reply('O segundo parâmetro deve ser um link a uma imagem.');
                }


              }
            }
          });
        }else{
          msg.reply('Digite !register para se registrar antes de usar esse comando!');
        }
      });
    }else{
      msg.reply('Esse comando requer 3 parâmetros.');
    }
  }
  if(text.substring(0,4).toLowerCase() == 'join'){
    /*
    joinVoiceChannel({
            channelId: '868019767414493189',
            guildId: msg.guild.id,
            adapterCreator: msg.guild.voiceAdapterCreator
    })
    */
  }
  if(text.substring(0,10).toLowerCase() == 'addchannel'){
    text = text.substring(11, size);
    if(isNaN(text)){
      msg.reply('Insira o ID do canal.');
    }else{
      var c = client.channels.cache.find(channel => channel.id === text);
      if(c === undefined){
        msg.reply('Insira o ID do canal.');
      }else{
        var q3 = 'SELECT * FROM guildchannels WHERE guild = "' + guildId + '"';
        con.query(q3, function(err, result){
          if(result.length == 1){
            var q2 = 'UPDATE guildchannels SET chann = "' + text + '" WHERE guild = "' + guildId + '"';
            con.query(q2, function(err, result){
              msg.react('✅');
              c.send('O canal de logs é aqui a partir de agora.');
            });
          }else{
            var q4 = 'INSERT INTO guildchannels(guild, chann) VALUES("' + guildId + '","' + text + '")';
            con.query(q4, function(err, result){
              msg.react('✅');
              c.send('O canal de logs é aqui a partir de agora.');
            });
          }
        });
        /*
        var q2 = 'UPDATE guildchannels SET chann = "' + text + '" WHERE guild = "' + guildId + '"';
        con.query(q2, function(err, result){
          msg.react('✅');
          c.send('O canal de logs é aqui a partir de agora.');
        });
        */
      }
    }
  }
  if(text.substring(0,6).toLowerCase() == 'summon'){

      var i;
      var random;
      var summons = '';
      var ssrs = ['altria pendragon', 'altera', 'Zhuge Liang (El-Melloi II)', 'vlad iii', 'jeanne d\'arc', 'orion', 'tamamo no mae', 'francis drake', 'jack the ripper', 'mordred', 'arjuna', 'karna', 'nightingale', 'Xuanzang Sanzang', 'ozymandias', 'enkidu', 'Caster of the Nightless City', 'Osakabehime', 'Anastasia Nikolaevna Romanova', 'achilles', 'napoleon', 'Xiang Yu', 'bradamante', 'ganesha (jinako)', 'europa', 'odysseus', 'dioscuri', 'nemo', 'vritra', 'galatea'];
      var character = msg.content.substring(8, size);
      if(character.length > 0){
        for(i = 0; i < 11; i++){
          random = getRandomFloat(0, 100);
          if(i < 10){
            if(random <= 1){
              if(getRandom(0,10) <= 2){
                summons += '**__' + ssrs[getRandom(0, ssrs.length - 1)].toUpperCase() + '__**\n';
              }else{
                summons += '**__' + character.toUpperCase() + '__**\n';
              }
            }else if(random > 1 && random <= 5){
              summons += 'CE 5*\n';
            }else if(random > 5 && random <= 8){
              summons += '**SR**\n';
            }else if(random > 8 && random <= 20){
              summons += 'CE 4*\n'
            }else if(random > 20 && random <= 60){
              summons += 'lixo\n';
            }else{
              summons += 'lixo\n';
            }
          }else{
            random = getRandomFloat(0, 20);
            if(random <= 1){
              if(getRandom(0,10) <= 2){
                summons += '**__' + ssrs[getRandom(0, ssrs.length - 1)].toUpperCase() + '__**\n';
              }else{
                summons += '**__' + character.toUpperCase() + '__**\n';
              }
            }else if(random > 1 && random <= 5){
              summons += 'CE 5*';
            }else if(random > 5 && random <= 8){
              summons += '**SR**';
            }else if(random > 8 && random <= 20){
              summons += 'CE 4*'
            }
          }
        }
        msg.channel.send(summons);
      }else{
        msg.channel.send('Diz o boneco em rate up');
      }

  }
}

function gotMessage(msg){

  var guildId = msg.channel.guild.id;
  var sqliu = 'SELECT * FROM guildchannels WHERE guild = "' + guildId + '"';
  var ch;
  con.query(sqliu, function(err, result){
    if(result.length == 0){
    }else{
      var chid = result[0].chann;
      ch = client.channels.cache.find(channel => channel.id === chid);
    }
    if(msg){
      var count = 1;
      if(!msg.author.bot && msg.content.length > 0){
        if (msg.content.substring(0, 1) == '!'){
          answer(ch, guildId, msg, msg.content.length, msg.content.substring(1, msg.content.length));
        }
        var rand = getRandom(0, 1000);
        if(rand <= 1){
          var user = msg.author.id;
          var qn = 'SELECT * FROM tickets WHERE id_discord = ' + user + ' AND guild = ' + guildId;
          con.query(qn, function(err, result){
            if(result.length == 1){
              var tik = result[0].quantidade;
              var newt = tik + 1;
              var q5 = 'UPDATE tickets SET quantidade = ' + newt + ' WHERE id_discord = ' + user + ' AND guild = ' + guildId;
              con.query(q5, function(err, result){
                msg.channel.send('<@' + user + '> acaba de ganhar um ticket!');
              });
            }else{
              var q4 = 'INSERT INTO tickets(id_discord,guild,quantidade) VALUES(' + user + ',' + guildId + ',' + '1)';
              con.query(q4, function(err, result){
                msg.channel.send('<@' + user + '> acaba de ganhar um ticket!');
              });
            }
          });
        }
      }

      var whitelist = ['eresh', 'braw', 'sexo', 'safada','kirigiri','sakura', 'arash', 'spartacus', 'nobu', 'chen', 'koyanskaya', 'vitch'];
      whitelist.forEach(function(item, indice, array){
        if(msg.content.toLowerCase().indexOf(item) >= 0) {
          msg.react('<:aliphe:933430647178014720>');
        }
      });

      var sql = "SELECT palavra FROM blacklist WHERE guild = " + guildId;
      con.query(sql, function (err, result){
        var size = result.length;
        var i;
        for(i = 0; i < size; i++){
          if(msg.content.toLowerCase().indexOf(result[i].palavra) >= 0 && !msg.author.bot) {
            if(count == 1){
              count++;
              if(ch !== undefined){
                ch.send('O membro ' + msg.author.username + ' foi mutado por digitar "' + msg.content + '".\n');
              }
              let role = msg.guild.roles.cache.find(r => r.name === "Silenciado");
              var muteUser = msg.member;
              addRole(msg, muteUser, role);
              msg.reply('silencio put');
            }
          }
        }
      });

      var member = msg.mentions.users.first();
      if(!msg.author.bot){
        if (msg.attachments.size > 0) {
            //msg.reply('<:nemfudendo:871534996291194920>');
        }
      }
    }
  });

}
client.login(token);
