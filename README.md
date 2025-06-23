---

<h1 align="center">🎟️ BlockTix</h1>

<p align="center">
  <b>A Fully Decentralized Ticketing Platform Powered by Coinbase Developer Infrastructure</b><br/>
  <i>CDI Wallets. Dynamic Pricing. Onchain Trust.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20With-Angular%20%7C%20Truffle%20%7C%20CDI%20Wallet-blueviolet?style=flat-square" />
  <img src="https://img.shields.io/badge/Smart%20Pricing-AgentKit%20AI-yellow?style=flat-square" />
  <img src="https://img.shields.io/badge/License-GPL--2.0-brightgreen?style=flat-square" />
</p>

---

## 🌐 What is BlockTix?

**BlockTix** is your trustless, AI-powered event ticketing solution on the blockchain — designed with **Coinbase Developer Infrastructure (CDI)** for wallets, **AgentKit** for dynamic pricing, and Web3-native verification built in.

> 🎫 Say goodbye to fake tickets, scalper abuse, and central control — BlockTix is the future of event access.

---

## 🚀 Key Features

| ⚙️ Feature                     | ✅ Description                                                            |
| ------------------------------ | ------------------------------------------------------------------------ |
| 🧾 **CDI Wallet Integration**  | Seamless and secure programmable wallets by Coinbase for every user      |
| 🧠 **Dynamic Ticket Pricing**  | Real-time pricing powered by AgentKit AI, based on popularity and demand |
| 🎫 **NFT Tickets (ERC-721)**   | Each ticket is a unique, verifiable digital asset                        |
| 🔁 **Transparent Resales**     | Secondary market resales tracked on-chain                                |
| 📲 **AgentKit Smart Analysis** | Detects ticket hoarding & manipulative resale behavior                   |
| 💡 **Fraud-Proof Validation**  | Venues verify tickets directly on-chain — no scanning app needed         |

---

## 🧬 Tech Stack

graph TD;
    User[🧍 CDI Wallet (xWallet)]
    Frontend[🌐 Angular UI]
    Web3[🔗 Web3.js]
    SmartContracts[📜 Solidity (ERC-721)]
    PricingAI[🤖 AgentKit Dynamic Pricing]
    Blockchain[⛓️ Ethereum (CDI Integrated)]

    User --> Frontend
    Frontend --> Web3
    Web3 --> SmartContracts
    SmartContracts --> Blockchain
    SmartContracts --> PricingAI

```

* 🧠 **Wallet Layer**: CDI Wallet (Coinbase Developer Platform)
* 💬 **Pricing Intelligence**: AgentKit ML engine
* 📱 **Frontend**: Angular SPA with Web3 hooks
* ⚙️ **Smart Contracts**: Solidity ERC-721
* 🔗 **Blockchain**: Ethereum + CDI Infrastructure

---

## ⚡ Quick Start

### 💻 Local Development

```bash
# Clone & install dependencies
git clone https://github.com/GouravPatidar91/BlockTix.git
cd BlockTix
npm install

# Install global tools
npm install -g @angular/cli truffle solc ganache

# Launch a local blockchain
ganache-cli

# Compile & migrate contracts
truffle compile
truffle migrate

# Run Angular app
ng serve
# Visit: http://localhost:4200
```

---

## 🧠 Smart Pricing with AgentKit

🔥 Every ticket price is dynamically adjusted based on:

* 🎟️ Ticket demand (mint rate)
* 📈 Event popularity trends
* 🕒 Time until event
* 🚫 Bot detection from resale attempts

> All logic handled by a secure AgentKit module connected to your smart contract.

---

## 🎯 CDI Wallets by Coinbase

* 🔐 Programmable user wallets (xWallet)
* ⚡ Gasless transactions via relayers
* 🛡️ Trustless signing and key management
* 🧩 Integrated with NFT ticket flow

---

## 📦 Features for Hackathon Excellence

| 🏆 Hack-Winning Feature | 🚀 How It Helps                     |
| ----------------------- | ----------------------------------- |
| 🤖 AgentKit Pricing     | Boosts real-world complexity        |
| 🔐 CDI Wallets          | Gives users seamless onboarding     |
| 🎥 Live Validation      | Dazzling on-chain ticket checks     |
| 🎫 Demo Events          | Pre-filled event + demo ticket flow |
| 📱 Mobile Ready         | MetaMask & WalletConnect friendly   |

---

## 📱 Screenshots (if available)

| 🎫 Ticket List           | 🧾 Dynamic Pricing UI    |
| ------------------------ | ------------------------ |
| *(Add screenshots here)* | *(Add screenshots here)* |

---

## 🧪 Developer Notes

### Common Commands

```bash
# Angular
ng generate component ComponentName
ng test
ng build --prod

# Truffle
truffle compile
truffle migrate
```

---

## 🛣 Roadmap

| 🚧 Feature                         | 📅 Status   |
| ---------------------------------- | ----------- |
| 🎭 Event Creation Flow             | In Progress |
| 🎫 Bulk Ticket Minting             | Coming Soon |
| 💳 Fiat Payments with Coinbase Pay | Planning    |
| 🌍 IPFS Event Metadata             | Planned     |
| 📱 Progressive Web App (PWA)       | Planned     |

---

## 👥 Team & Contributions

We welcome your PRs, ideas, and forks.

```bash
# Fork the project
git clone https://github.com/your-username/BlockTix.git

# Create your branch
git checkout -b feature/your-feature
```

---

## 📄 License

This project is open-source under the [GNU GPL-2.0 License](LICENSE).

---

> 💬 “The future of ticketing is programmable, fair, and fraud-proof — and BlockTix is already there.”
