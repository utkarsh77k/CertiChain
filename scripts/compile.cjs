const fs = require('node:fs');
const path = require('node:path');
const solc = require('solc');
function compile() {
  const sourcePath = path.join(__dirname, '../contracts/CertiChain.sol');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const input = {language:'Solidity',sources:{'CertiChain.sol':{content:source}},settings:{optimizer:{enabled:true,runs:200},outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}};
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = (output.errors || []).filter(e => e.severity === 'error');
  if (errors.length) throw new Error(errors.map(e => e.formattedMessage).join('\n'));
  const contract = output.contracts['CertiChain.sol'].CertiChain;
  if (!contract.evm.bytecode.object) throw new Error('No contract bytecode generated');
  const artifact = {contractName:'CertiChain',abi:contract.abi,bytecode:'0x'+contract.evm.bytecode.object};
  const buildDir = path.join(__dirname,'../artifacts');
  fs.mkdirSync(buildDir,{recursive:true});
  fs.writeFileSync(path.join(buildDir,'CertiChain.json'),JSON.stringify(artifact,null,2));
  fs.writeFileSync(path.join(__dirname,'../frontend/abi.json'),JSON.stringify(artifact.abi,null,2));
  return artifact;
}
if (require.main === module) { try { const a=compile(); console.log('Compiled CertiChain successfully. ABI entries:',a.abi.length); } catch(e) { console.error(e.message); process.exitCode=1; } }
module.exports={compile};
