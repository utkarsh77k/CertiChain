const ganache = require('ganache');
const port = Number(process.env.RPC_PORT || 8545);
const server = ganache.server({wallet:{deterministic:true,totalAccounts:10,defaultBalance:100},chain:{chainId:1337},logging:{quiet:true}});
server.listen(port,'127.0.0.1',err=>{
 if(err){console.error(err);process.exit(1);}
 console.log('Local Ethereum blockchain running at http://127.0.0.1:'+port);
 console.log('Chain ID: 1337');
 console.log('Use the Ganache test accounts only. NEVER use real funds.');
 console.log('Keep this terminal open while testing.');
});
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
