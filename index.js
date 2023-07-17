const {
     default: makeWaSocket,
     useMultiFileAuthState,
     makeInMemoryStore,
} = require("@whiskeysockets/baileys");
const boom = require("@hapi/boom");
const pino = require("pino");
const qrcode = require("qrcode-terminal");

async function startConect() {
     const { state, saveCreds } = await useMultiFileAuthState("session");
     store = makeInMemoryStore({
          logger: pino().child({ level: "silent", stream: "store" }),
     });
     const dian = makeWaSocket({
          printQRInTerminal: true,
          browser: ["Ardian", "Linux", "3.0.0"],
          auth: state,
          getMessage: async (key) => {
         if(store) {
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg.message || undefined;
         }
         return {
            conversation: "Halo Saya Ardian",
         };
      },
   });
     store.bin(dian.ev);

     dian.ev.on("connection.update", async (update) => {
          const { connection, lastDisconnect, qr } = update;
          if (lastDisconnect == "undefined" && qr != "undefined") {
               qrcode.generate(qr, {
                    small: true,
               });
          }
          if (connection === "connecting") {
               console.log("Connecting");
          } else if (connection === "open") {
               console.log("Connected ✓");
               await console.log(
                    `Terhubung: ${dian.user.name || dian.user.verifiedName}`
               );
          } else if (connection === "close") {
               if (
                    lastDisconnect.error.output.statusCode ==
                    DisconnectReason.loggedOut
               ) {
                    console.log("Failed Connect To WhatsApp");
                    await process.kill(0);
               } else {
                    startConect().catch(() => startConect());
               }
          }
     });
     dian.ev.on("messages.upsert", (m) => {
          const chat = messages[0].message.conversation;
          const id = messages[0].m.key.remoteJid;
          const reply = (text) => {
               dian.sendMessage(chat, {
                    text: text,
               });
          };

          //====// Perintah Pesan //=====//
          if (chat == "/menu") {
               dian.sendMessage(id, {
                    text: "Belum Ada Menu",
               });
          } else if (chat == "Halo") {
               reply("halo ada apa?");
          }
          //=====// Batas Perintah //=====//
     });
}
startConect();
