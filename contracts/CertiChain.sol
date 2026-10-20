// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CertiChain - Certificate fingerprint registration and verification
/// @notice Stores certificate hashes and metadata; it does NOT store certificate files.
contract CertiChain {
    address public immutable owner;

    struct Certificate {
        string certificateName;
        address recipient;
        address issuer;
        uint256 issuedAt;
        bool exists;
        bool revoked;
    }

    mapping(bytes32 => Certificate) private certificates;

    event CertificateIssued(
        bytes32 indexed certificateHash,
        string certificateName,
        address indexed recipient,
        address indexed issuer,
        uint256 issuedAt
    );
    event CertificateRevoked(bytes32 indexed certificateHash, address indexed revokedBy, uint256 revokedAt);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can do this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCertificate(
        bytes32 certificateHash,
        string calldata certificateName,
        address recipient
    ) external onlyOwner {
        require(certificateHash != bytes32(0), "Certificate hash cannot be zero");
        require(bytes(certificateName).length > 0, "Certificate name is required");
        require(recipient != address(0), "Recipient cannot be zero address");
        require(!certificates[certificateHash].exists, "Certificate already registered");

        certificates[certificateHash] = Certificate({
            certificateName: certificateName,
            recipient: recipient,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            exists: true,
            revoked: false
        });

        emit CertificateIssued(certificateHash, certificateName, recipient, msg.sender, block.timestamp);
    }

    function verifyCertificate(bytes32 certificateHash)
        external
        view
        returns (
            bool exists,
            bool revoked,
            string memory certificateName,
            address recipient,
            address issuer,
            uint256 issuedAt
        )
    {
        Certificate memory c = certificates[certificateHash];
        return (c.exists, c.revoked, c.certificateName, c.recipient, c.issuer, c.issuedAt);
    }

    function revokeCertificate(bytes32 certificateHash) external onlyOwner {
        require(certificates[certificateHash].exists, "Certificate not registered");
        require(!certificates[certificateHash].revoked, "Certificate already revoked");
        certificates[certificateHash].revoked = true;
        emit CertificateRevoked(certificateHash, msg.sender, block.timestamp);
    }
}
