# CertiChain — VS Code ready DApp

Blockchain Technology (CSE4444) Assignment 2. This project provides a Solidity smart contract, HTML/CSS/JS UI, MetaMask integration using Ethers.js, local Ethereum blockchain, automated deployment, and contract tests.

## Prerequisites
- Node.js 20 or newer and npm
- Visual Studio Code
- MetaMask browser extension (create a **separate test wallet**, never use a wallet with real funds)

## Run from VS Code

Open the **CertiChain_VSCode_Ready** folder in VS Code and open a terminal.

```bash
npm install
```

Open **three terminals** in VS Code:

**Terminal 1 — Start local blockchain (leave running):**
```bash
npm run chain
```

**Terminal 2 — Compile and deploy:**
```bash
npm run deploy
```
This compiles the Solidity contract with solc 0.8.20, deploys it to the local blockchain, and automatically updates `frontend/config.json` with the contract address. It also writes `deployment.json` with the transaction hash and owner address.

**Terminal 3 — Start website:**
```bash
npm run dev
```
Open **http://127.0.0.1:5173** in your browser.

## MetaMask setup (local blockchain)

1. In MetaMask, add a custom network: **Network name:** CertiChain Local; **RPC URL:** `http://127.0.0.1:8545`; **Chain ID:** `1337`; **Currency symbol:** ETH.
2. The local blockchain provides test accounts. For coursework, import one **Ganache-only test account** into MetaMask using its local test private key. Run `npm run accounts` to display the first two **deterministic local-only test keys**, then import the first one into a separate MetaMask test wallet. Never use these public demo keys with real funds or on a public network. Alternatively, deploy using Remix with an injected MetaMask account funded with local test ETH.
3. To use the deploying account as issuer, MetaMask must select the same address shown as `owner` in `deployment.json`. If you use a different account, you can verify records but cannot issue or revoke certificates.
4. Click **Connect MetaMask**. The contract address should appear automatically from `frontend/config.json`.
5. Register a dummy PDF or image file, enter its certificate name and a valid recipient wallet address, then confirm the MetaMask transaction.
6. Verify the **same exact file** in the Verify panel. You should see its record. A different file should not match.
7. To demonstrate authorization, switch MetaMask to a different local test account and try to issue a certificate; the contract will reject it.
8. Revoke a registered certificate with the owner account, then verify it again to see its revoked status.

**Important:** If you stop and restart `npm run chain`, the local blockchain state resets. Run `npm run deploy` again and refresh the website.

## Automated tests

```bash
npm test
```

The tests use an isolated in-memory Ganache blockchain and cover successful issuance, verification, duplicate/invalid input, unauthorized actions, and revocation. They do not require a separately running local chain.

## Assignment-specific Remix requirement

The uploaded assignment also specifically requires **compilation, deployment and testing using Remix IDE with Ganache or an Ethereum test network**. VS Code scripts are convenient for local development but do not replace this explicit requirement. Open `contracts/CertiChain.sol` in https://remix.ethereum.org, compile it there, connect Remix to the appropriate network, deploy and test the contract, and capture genuine Remix screenshots for your submission.

## Project structure

```
contracts/CertiChain.sol      Solidity smart contract
frontend/index.html          Website
frontend/style.css           Styles
frontend/app.js              Ethers.js + MetaMask logic
frontend/abi.json            Contract ABI (updated on compile)
frontend/config.json         Deployment address (updated on deploy)
scripts/start-chain.cjs      Local Ganache blockchain
scripts/compile.cjs          Solidity compiler
scripts/deploy.cjs           Automatic deployment
tests/contract.test.cjs      Automated contract tests
docs/TEST_PLAN.md            Manual evidence checklist
docs/DEPLOYMENT_NOTES.md     Deployment documentation template
docs/*TEMPLATE.docx          Final submission cover-sheet template
```

## Evidence and submission

- Run `npm test` and capture results.
- Capture Remix compile and deployment, MetaMask connected, successful and failed transactions, and frontend displaying blockchain data.
- Record real deployment network, contract address, transaction hashes and observed results in `docs/DEPLOYMENT_NOTES.md` and `docs/TEST_PLAN.md`.
- Upload the source, README, actual evidence and deployment details to GitHub. Do not upload secrets or private keys.
- Fill in your name, registration number and GitHub URL in the DOCX template, export it to PDF, and submit the PDF to LMS.

## Privacy and limitations

The certificate **file is not stored on-chain**. Only its SHA-256 hash and selected metadata are recorded. A matching hash proves the file bytes match a registered record; it does not prove the issuer's real-world identity. This is an educational demo, not a production credential authority. Never commit secrets or real student certificates.
