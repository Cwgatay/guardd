const discord = require('discord.js');
const client = new discord.Client();
const fs = require('fs');
const config = require("./config.json");
const db = require('quick.db')
const moment = require('moment')
const ms = require('ms')
client.commands = new discord.Collection();
client.aliases = new discord.Collection()
fs.readdir("./commands", (err, files) => {
if(err) console.log(err)

let jsfile = files.filter(f => f.split(".").pop() === "js")
if(jsfile.length <= 0) {
    return console.log("[LOGS] couldnt find commands.")
}

jsfile.forEach((f, i) => {
let pull = require(`./commands/${f}`);
client.commands.set(pull.config.name, pull);
pull.config.aliases.forEach(alias => {
    client.aliases.set(alias, pull.config.name)
});
});

});

//cmd

////events
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
   
      if (!file.endsWith(".js")) return;
     
      const event = require(`./events/${file}`);
      
      let eventName = file.split(".")[0];
   
      client.on(eventName, event.bind(null, client));
      delete require.cache[require.resolve(`./events/${file}`)];
    });
  });

//events

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
setTimeout(async() => {
  await client.user.setActivity('Marissa 💜 Sierra', {type: 'LISTENING'})
  await client.channels.cache.get('750074529065336982').join()
  await client.user.setStatus(`dnd`)
}, 10000)
  });

client.on('message', message => {

if(message.author.bot || message.channel.type === 'dm') return;
let prefix = config.prefix
if(!message.content.startsWith(prefix)) return;
let messageArray = message.content.split(" ")
let cmd = messageArray[0];
let args = messageArray.slice(1)
let commandfile = client.commands.get(cmd.slice(prefix.length)) || client.commands.get(client.aliases.get(cmd.slice(prefix.length)))
if(commandfile) commandfile.run(client, message, args)
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {// chimp#0110
  let guild = oldMember.guild || newMember.guild;
    
      let chimp = await guild.fetchAuditLogs({type: 'MEMBER_ROLES_UPDATE'});
    
      if(chimp) {
        
  let asd = []
  
  oldMember.roles.cache.forEach(c => {
  if(!newMember.roles.cache.has(c.id)) {
  require('quick.db').delete(`${guild.id}.${c.id}.${oldMember.id}`)
  }
  })
  newMember.roles.cache.forEach(c => {
  if(!oldMember.roles.cache.has(c.id)) {
  require('quick.db').set(`${guild.id}.${c.id}.${newMember.id}`, 'eklendi')
  }
    
  })
      
      }
  })// codare ♥
  
  client.on('roleDelete', async role => {
    if(!db.has(`rolkoruma?${role.guild.id}`)) return
  let guild = role.guild;
  if(role.managed) return;
    let e = await guild.fetchAuditLogs({type: 'ROLE_DELETE'});
    let member = guild.members.cache.get(e.entries.first().executor.id);
          if(member.id === '742776529892933653') return console.log(`[Rol Koruma] Marissa`)
          if(member.id === '389738482874056705') return console.log(`[Rol Koruma] Sierra`)
          if(member.id === role.guild.owner.id) return console.log(`[Rol Koruma] Sunucu Sahibi`)
               if(member.id === '766815493633343499') return console.log(`[Rol Koruma] Diğer Guard`)
    if(member.id === client.user.id) return console.log(`[Rol Koruma] Client User`)
    let mention = role.mentionable;
    let hoist = role.hoist;
    let color = role.color;
    let name = role.name;
    let perms = role.permissions;
    let position = role.rawPosition;
    role.guild.roles.create({
      data: {
           name: name,
      color: color,
      hoist: hoist,
      position: position,
      permissions: perms,
      mentionable: mention 
      }
  
    }).then(async rol => {
      
    guild.members.cache.forEach(async u => {
    const dat = await require('quick.db').fetch(`${guild.id}.${role.id}.${u.id}`)
    if(dat) { 
    guild.members.cache.get(u.id).roles.add(rol.id)
    }
    })
    await role.guild.members.ban(member, { reason: 'Rol koruma' }).catch((err) => {
      console.log(`Hata: ${err}`)
    })
  client.channels.cache.get('756857871408300045').send(new discord.MessageEmbed()
  .setAuthor(guild.name, guild.iconURL())
  .setColor('RED')
 .setFooter(member.user.username, member.user.displayAvatarURL({dynamic: true}))
  .setDescription(`${role.name} isimli rol ${member} tarafından silindi ve bende tekrardan rolü oluşturdum, önceden role sahip olan kişilere rollerini verdim. Kişiyi sunucudan yasakladım.`)
  )
    })
    
  })
  
client.on('roleCreate', async role => {
  if(!db.has(`rolkoruma?${role.guild.id}`)) return
  if(role.managed) return;
  let entry = await role.guild.fetchAuditLogs({type: 'ROLE_CREATE'}).then(e => e.entries.first())
  if(entry.executor.id === '742776529892933653') return console.log(`[Rol Koruma] Marissa`)
  if(entry.executor.id === '389738482874056705') return console.log(`[Rol Koruma] Sierra`)
  if(entry.executor.id === role.guild.owner.id) return console.log(`[Rol Koruma] Sunucu Sahibi`)
      if(entry.executor.id === '766815493633343499') return console.log(`[Rol Koruma] Diğer Guard`)
    if(entry.executor.id === client.user.id) return console.log(`[Rol Koruma] Client User`)
  let kisi = role.guild.member(entry.executor)
  await role.guild.members.ban(kisi, {reason: 'Rol Koruma'})
  await role.delete().catch((err)=>{console.error})
  client.channels.cache.get('756857871408300045').send(new discord.MessageEmbed()
  .setAuthor(role.guild.name, role.guild.iconURL())
  .setColor('RED')
 .setFooter(entry.executor.username, entry.executor.displayAvatarURL({dynamic: true}))
  .setDescription(`${entry.executor} üyesi bir rol açtı rolü sildim ve kişiyi sunucudan yasakladım.`)
  )
})

client.on('channelCreate', async channel => {
  if(!db.has(`kanalkoruma?${channel.guild.id}`)) return;
  let entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_CREATE'}).then(e => e.entries.first())
  if(entry.executor.id === '742776529892933653') return console.log(`[Kanal Koruma] Marissa`)
  if(entry.executor.id === '389738482874056705') return console.log(`[Kanal Koruma] Sierra`)
  if(entry.executor.id === channel.guild.owner.id) return console.log(`[Kanal Koruma] Sunucu Sahibi`)
      if(entry.executor.id === '766815493633343499') return console.log(`[Kanal Koruma] Diğer Guard`)
    if(entry.executor.id === client.user.id) return console.log(`[Kanal Koruma] Client User`)
  let kisi = channel.guild.member(entry.executor)
  await channel.guild.members.ban(kisi, {reason: 'Kanal Koruma'})
  await channel.delete()
  client.channels.cache.get('756857871408300045').send(new discord.MessageEmbed()
  .setAuthor(channel.guild.name, channel.guild.iconURL())
  .setColor('RED')
 .setFooter(entry.executor.username, entry.executor.displayAvatarURL({dynamic: true}))
  .setDescription(`${entry.executor} üyesi bir kanal açtı kanali sildim ve kişiyi sunucudan yasakladım.`)
  )
})

client.on('channelDelete', async channel => {
if(!db.has(`kanalkoruma?${channel.guild.id}`)) return;
let entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_DELETE'}).then(e => e.entries.first())
if(entry.executor.id === '742776529892933653') return console.log(`[Kanal Koruma] Marissa`)
if(entry.executor.id === '389738482874056705') return console.log(`[Kanal Koruma] Sierra`)
if(entry.executor.id === channel.guild.owner.id) return console.log(`[Kanal Koruma] Sunucu Sahibi`)
    if(entry.executor.id === '766815493633343499') return console.log(`[Kanal Koruma] Diğer Guard`)
    if(entry.executor.id === client.user.id) return console.log(`[Kanal Koruma] Client User`)
let kisi = channel.guild.member(entry.executor)
await channel.guild.members.ban(kisi, {reason: 'Kanal Koruma'})
if (channel.type === 'voice') {
  await channel.clone({ name: this.name, topic: this.topic, bitrate: this.bitrate })
} else {
 await channel.clone()
}
client.channels.cache.get('756857871408300045').send(new discord.MessageEmbed()
.setAuthor(channel.guild.name, channel.guild.iconURL())
.setColor('RED')
.setFooter(entry.executor.username, entry.executor.displayAvatarURL({dynamic: true}))
.setDescription(`${entry.executor} üyesi bir kanal sildi kanali geri açtım ve kişiyi sunucudan yasakladım.`)
)
})

client.on('guildBanAdd', async (guild, user) => {
  let entry = await guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(e => e.entries.first())
  let kisi = guild.member(entry.executor)
  if(entry.executor.id === '742776529892933653') return console.log(`[Ban Koruma] Marissa`)
  if(entry.executor.id === '389738482874056705') return console.log(`[Ban Koruma] Sierra`)
  if(entry.executor.id === guild.owner.id) return console.log(`[Ban Koruma] Sunucu Sahibi`)
  if(entry.executor.bot) return console.log(`[Ban Koruma] Bot`)
        if(entry.executor.id === '766815493633343499') return console.log(`[Ban Koruma] Diğer Guard`)
  kisi.roles.cache.filter(e => e.permissions.has('BAN_MEMBERS')).map(async roller => {
    await kisi.roles.remove(roller)
  })
  await guild.members.unban(user, {reason: 'Ban Koruma'})
  await client.channels.cache.get('756857871408300045').send(new discord.MessageEmbed()
  .setDescription(`${entry.executor} üyesi ${user} üyesini sağ tık ile banladı, kişinin banını kaldırdım ve banlayan kişinin ÜYELERİ_YASAKLA yetkisi içeren rollerini aldım.`)
  )
})

client.on('message', async message => {
 if(message.content === `<@!${client.user.id}>`) {
   let ids = ['389738482874056705', '742776529892933653', message.guild.owner.id]
   if(!ids.includes(message.author.id)) return;
   return message.channel.send(new discord.MessageEmbed()
   .setAuthor(client.user.username, client.user.avatarURL())
   .addField(`Komutlar`, `\`+kanalkoruma\`\n\`+rolkoruma\`\n\`+bankoruma\``)
   )
 }
})

client.login(config.token);
