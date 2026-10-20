const $ = (id) => document.getElementById(id);
let provider, signer, contract, userAddress;
let ABI = [];
const ADDRESS_KEY = "certichain-contract-address";

async function loadAbi() {
  const response = await fetch("./abi.json");
  if (!response.ok) throw new Error("Could not load abi.json. Open this page through a local web server.");
  ABI = await response.json();
}
function setStatus(id, message, kind = "") {
  const el = $(id); el.textContent = message; el.className = "status-line " + kind;
}
function shortAddress(value) { return value ? value.slice(0, 6) + "..." + value.slice(-4) : ""; }
function validAddress(value) { return /^0x[a-fA-F0-9]{40}$/.test(value) && value !== "0x0000000000000000000000000000000000000000"; }
function validHash(value) { return /^0x[a-fA-F0-9]{64}$/.test(value); }
async function hashFile(file) {
  if (!file) return "";
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return "0x" + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}
function formatTime(value) {
  const n = Number(value);
  return n ? new Date(n * 1000).toLocaleString() : "Not available";
}
async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask was not detected. Install the MetaMask browser extension first.");
  await loadAbi();
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  userAddress = await signer.getAddress();
  $("walletStatus").textContent = "Connected: " + shortAddress(userAddress);
  $("connectBtn").textContent = shortAddress(userAddress);
  await attachContract();
}
async function attachContract() {
  const address = $("contractAddress").value.trim();
  if (!ethers.isAddress(address) || address === ethers.ZeroAddress) {
    contract = null;
    $("networkStatus").textContent = "Enter a valid deployed contract address.";
    return;
  }
  if (!provider) throw new Error("Connect MetaMask first.");
  contract = new ethers.Contract(address, ABI, signer || provider);
  const network = await provider.getNetwork();
  const code = await provider.getCode(address);
  if (code === '0x') {
    contract = null;
    throw new Error('No smart contract found at this address on the selected MetaMask network. Check your network or redeploy.');
  }
  $("networkStatus").textContent = "Configured at " + shortAddress(address) + " · chain ID " + network.chainId;
}
async function ensureReady() {
  if (!provider || !signer) await connectWallet();
  if (!contract) await attachContract();
  if (!contract) throw new Error("Configure the deployed contract address first.");
}
async function updateFileHash(fileInput, outputId) {
  const file = $(fileInput).files[0];
  $(outputId).textContent = file ? "Calculating fingerprint…" : "Select a file to calculate its fingerprint.";
  if (!file) return "";
  const hash = await hashFile(file);
  $(outputId).textContent = hash;
  return hash;
}
$("connectBtn").addEventListener("click", async () => {
  try { await connectWallet(); setStatus("networkStatus", "Wallet connected. Check the network and contract address.", "success"); }
  catch (e) { setStatus("networkStatus", e.shortMessage || e.message, "error"); }
});
$("saveAddressBtn").addEventListener("click", async () => {
  const address = $("contractAddress").value.trim();
  if (!ethers.isAddress(address) || address === ethers.ZeroAddress) { setStatus("networkStatus", "Enter a valid non-zero contract address.", "error"); return; }
  localStorage.setItem(ADDRESS_KEY, address);
  try { await attachContract(); setStatus("networkStatus", "Contract address saved for this browser.", "success"); }
  catch (e) { setStatus("networkStatus", e.shortMessage || e.message, "error"); }
});
$("issueFile").addEventListener("change", async () => {
  try { await updateFileHash("issueFile", "issueHash"); }
  catch (e) { setStatus("issueStatus", e.message, "error"); }
});
$("verifyFile").addEventListener("change", async () => {
  try { await updateFileHash("verifyFile", "verifyHash"); }
  catch (e) { $("verifyHash").textContent = e.message; }
});
$("issueBtn").addEventListener("click", async () => {
  const btn = $("issueBtn"); btn.disabled = true;
  try {
    await ensureReady();
    const file = $("issueFile").files[0];
    const hash = await hashFile(file);
    if (!file) throw new Error("Choose a certificate file first.");
    const name = $("certificateName").value.trim();
    const recipient = $("recipient").value.trim();
    if (!name) throw new Error("Enter a certificate name.");
    if (!validAddress(recipient)) throw new Error("Enter a valid, non-zero recipient wallet address.");
    setStatus("issueStatus", "Check MetaMask and confirm the transaction…");
    const tx = await contract.issueCertificate(hash, name, recipient);
    setStatus("issueStatus", "Transaction submitted: " + tx.hash);
    await tx.wait();
    setStatus("issueStatus", "Certificate registered successfully. Transaction: " + tx.hash, "success");
  } catch (e) { setStatus("issueStatus", e.shortMessage || e.reason || e.message, "error"); }
  finally { btn.disabled = false; }
});
$("verifyBtn").addEventListener("click", async () => {
  const result = $("verifyResult"); result.className = "result"; result.innerHTML = "";
  try {
    await ensureReady();
    const file = $("verifyFile").files[0];
    if (!file) throw new Error("Choose a certificate file first.");
    const hash = await hashFile(file);
    $("verifyHash").textContent = hash;
    const data = await contract.verifyCertificate(hash);
    result.classList.remove("hidden");
    if (!data.exists) {
      result.classList.add("bad");
      result.innerHTML = "<h3>Certificate not found</h3><p>No matching fingerprint is registered on this contract.</p><p><strong>Fingerprint:</strong> " + hash + "</p>";
    } else if (data.revoked) {
      result.classList.add("bad");
      result.innerHTML = "<h3>Certificate has been revoked</h3><p><strong>Name:</strong> " + escapeHtml(data.certificateName) + "</p><p><strong>Recipient:</strong> " + data.recipient + "</p><p><strong>Issued:</strong> " + formatTime(data.issuedAt) + "</p>";
    } else {
      result.classList.add("good");
      result.innerHTML = "<h3>Registered certificate found</h3><p><strong>Name:</strong> " + escapeHtml(data.certificateName) + "</p><p><strong>Recipient:</strong> " + data.recipient + "</p><p><strong>Issuer:</strong> " + data.issuer + "</p><p><strong>Issued:</strong> " + formatTime(data.issuedAt) + "</p><p><strong>Fingerprint:</strong> " + hash + "</p><p>Status: Registered and not revoked</p>";
    }
  } catch (e) { result.className = "result bad"; result.textContent = e.shortMessage || e.reason || e.message; result.classList.remove("hidden"); }
});
$("revokeBtn").addEventListener("click", async () => {
  const btn = $("revokeBtn"); btn.disabled = true;
  try {
    await ensureReady();
    const hash = $("revokeHash").value.trim();
    if (!validHash(hash)) throw new Error("Enter a valid bytes32 fingerprint: 0x followed by 64 hexadecimal characters.");
    setStatus("revokeStatus", "Check MetaMask and confirm the transaction…");
    const tx = await contract.revokeCertificate(hash);
    await tx.wait();
    setStatus("revokeStatus", "Certificate revoked. Transaction: " + tx.hash, "success");
  } catch (e) { setStatus("revokeStatus", e.shortMessage || e.reason || e.message, "error"); }
  finally { btn.disabled = false; }
});
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
}
(async function init() {
  const saved = localStorage.getItem(ADDRESS_KEY);
  try {
    const response = await fetch('./config.json');
    if (response.ok) {
      const config = await response.json();
      if (config.contractAddress && ethers.isAddress(config.contractAddress)) {
        $('contractAddress').value = config.contractAddress;
        localStorage.setItem(ADDRESS_KEY, config.contractAddress);
      } else if (saved) $('contractAddress').value = saved;
    } else if (saved) $('contractAddress').value = saved;
  } catch { if (saved) $('contractAddress').value = saved; }
  try { await loadAbi(); } catch (e) { setStatus("networkStatus", e.message, "error"); }
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => { location.reload(); });
    window.ethereum.on("chainChanged", () => { location.reload(); });
  }
})();
