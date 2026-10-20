const ganache = require('ganache');
const provider = ganache.provider({wallet:{deterministic:true,totalAccounts:10,defaultBalance:100},chain:{chainId:1337},logging:{quiet:true}});
const accounts = provider.getInitialAccounts();
console.log('LOCAL DEVELOPMENT TEST ACCOUNTS ONLY — NEVER USE THESE KEYS ON A PUBLIC NETWORK OR WITH REAL FUNDS.');
Object.entries(accounts).slice(0,2).forEach(([address,info],i)=>{
 console.log(`Test account ${i+1}: ${address}`);
 console.log(`LOCAL TEST private key: ${info.secretKey}`);
});
if(provider.disconnect) provider.disconnect();
