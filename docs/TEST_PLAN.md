# CertiChain Test Plan

**Instructions:** Run each test in Remix and/or the frontend. Record the actual result and add screenshots. Do not mark a test passed before executing it.

| ID | Scenario | Steps | Expected result | Actual result / evidence |
|---|---|---|---|---|
| T01 | Successful compile | Compile `CertiChain.sol` in Remix with compatible Solidity compiler | No compilation errors | [Record] |
| T02 | Successful deployment | Deploy from Remix using Ganache or test network | Contract deployed; `owner()` equals deploying account | [Record] |
| T03 | Valid registration | Owner registers a new file hash, non-empty name and valid recipient | Transaction succeeds; record exists | [Record] |
| T04 | Successful verification | Upload the exact same file in Verify | Name, recipient, issuer and issue time display; not revoked | [Record] |
| T05 | Unknown certificate | Upload a different file that was never registered | UI reports no matching fingerprint | [Record] |
| T06 | Duplicate registration | Owner attempts to register same file hash again | Reverts with `Certificate already registered` | [Record] |
| T07 | Empty name | Call `issueCertificate` with empty string from Remix | Reverts with `Certificate name is required` | [Record] |
| T08 | Zero recipient | Call `issueCertificate` with zero address | Reverts with `Recipient cannot be zero address` | [Record] |
| T09 | Zero hash | Call `issueCertificate` with `0x000...000` bytes32 | Reverts with `Certificate hash cannot be zero` | [Record] |
| T10 | Unauthorized registration | Switch MetaMask/Remix to a different account and call issue | Reverts with `Only contract owner can do this` | [Record] |
| T11 | Unauthorized revocation | Non-owner attempts to revoke an existing record | Reverts with `Only contract owner can do this` | [Record] |
| T12 | Successful revocation | Owner revokes a registered hash | Transaction succeeds; record remains but `revoked = true` | [Record] |
| T13 | Verify revoked record | Verify the original file again | UI reports certificate revoked | [Record] |
| T14 | Revoke unknown record | Owner revokes an unregistered hash | Reverts with `Certificate not registered` | [Record] |

## Screenshot naming suggestions
- `01-remix-compiled.png`
- `02-contract-deployed.png`
- `03-metamask-connected.png`
- `04-register-success.png`
- `05-verify-success.png`
- `06-unknown-certificate.png`
- `07-unauthorized-failure.png`
- `08-revoked-certificate.png`

## Notes
- Use dummy certificate files and test accounts only.
- The frontend SHA-256 value is represented as a `bytes32` hex string, matching the contract input type.
- The UI hashes the exact file bytes. Even a minor change to a file will produce a different fingerprint.
- Save actual transaction hashes and the real deployed address in `docs/DEPLOYMENT_NOTES.md`.
