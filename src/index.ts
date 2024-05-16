import Client from "./structs/client.js";
const client = new Client();

client.loadDirs();
client.login(client.config.token);
