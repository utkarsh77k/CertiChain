const fs = require('node:fs');
const path = require('node:path');
const {ethers} = require('ethers');
const {compile} = require('./compile.cjs');
async function main(){
 const artifact=compile();
 const url=process.env.RPC_URL||'http://127.0.0.1:8545';
 const provider=new ethers.JsonRpcProvider(url);
 let accounts;
 try {accounts=await provider.send('eth_accounts',[]);}catch(e){throw new Error('Local chain is not running. Open another terminal and run npm run chain. '+e.message);}
 if(!accounts.length)throw new Error('No test accounts on the local blockchain');
 const signer=await provider.getSigner(accounts[0]);
 const factory=new ethers.ContractFactory(artifact.abi,artifact.bytecode,signer);
 console.log('Deploying CertiChain to',url);
 const contract=await factory.deploy();
 await contract.waitForDeployment();
 const address=await contract.getAddress();
 const network=await provider.getNetwork();
 const deploymentTx=contract.deploymentTransaction();
 const config={contractAddress:address,chainId:Number(network.chainId),networkName:'Local Ganache',rpcUrl:url};
 fs.writeFileSync(path.join(__dirname,'../frontend/config.json'),JSON.stringify(config,null,2));
 fs.writeFileSync(path.join(__dirname,'../deployment.json'),JSON.stringify({...config,owner:accounts[0],transactionHash:deploymentTx.hash,createdAt:new Date().toISOString()},null,2));
 console.log('SUCCESS — Contract address:',address);
 console.log('Owner account:',accounts[0]);
 console.log('Deployment transaction:',deploymentTx.hash);
 console.log('Updated frontend/config.json automatically.');
 console.log('IMPORTANT: This local chain resets whenever npm run chain restarts. Deploy again after a reset.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
