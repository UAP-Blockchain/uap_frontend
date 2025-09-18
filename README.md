
# FAP Blockchain - Frontend

## Overview
**FAP Blockchain Frontend** is the user interface for the FAP Blockchain system, built using **React** and **TypeScript**. It provides interactive portals for **students**, **teachers**, and **admins** to manage academic records, grades, attendance, and credentials on the blockchain. This project integrates with the backend system built on Ethereum Quorum, ensuring secure and transparent academic record management.

## Features
- **Student Portal**:
  - View academic records and grades in real-time.
  - Generate and share verifiable QR codes and links for credentials.
  - Track academic progress and history.
  
- **Teacher Portal**:
  - Assign students to classes.
  - Mark attendance in real-time.
  - Update grades securely on-chain.

- **Admin Portal**:
  - Manage students, teachers, roles, and classes.
  - Issue and revoke credentials.
  - Generate reports for system activities.

- **Public Verification Portal**:
  - Employers or third parties can verify credentials and grades via QR codes or links.

## Tech Stack
- **Frontend**: React, TypeScript
- **Blockchain Integration**: Ethers.js, MetaMask/WalletConnect
- **State Management**: Redux or Context API (if applicable)
- **UI Framework**: Material-UI / Bootstrap (or any other UI framework of choice)
- **API Communication**: Axios or Fetch API

## Installation

### Prerequisites
- **Node.js** (version 14.x or higher)
- **npm** or **yarn**

### Steps to set up the project locally:
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/fap_frontend.git
   cd FapBlockchain-Frontend


2. **Install dependencies**:

   ```bash
   npm install
   # or if you use yarn:
   yarn install
   ```

3. **Run the development server**:

   ```bash
   npm start
   # or with yarn:
   yarn start
   ```

   The app will be running on [http://localhost:3000](http://localhost:3000).

## Configuration

* **Blockchain Integration**: Make sure to configure the backend API endpoint in the `src/config` (or similar) file to point to your **Backend API** URL.
* **MetaMask/WalletConnect**: Ensure that the user is able to connect their wallet (MetaMask or WalletConnect) for blockchain interactions.

### Example Configuration:

```js
const API_URL = "http://localhost:5160";  // Backend API URL
```

## Folder Structure

```
FapBlockchain-Frontend/
├── public/             # Public assets like index.html
├── src/                # Source code
│   ├── components/     # Reusable UI components
│   ├── pages/          # Pages like Student, Teacher, Admin
│   ├── services/       # API calls and blockchain interaction logic
│   ├── context/        # Context for state management
│   ├── utils/          # Utility functions
│   └── App.tsx         # Main entry point
├── package.json        # Project dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Development

### Running the app locally

To run the app in development mode with hot reloading, simply run:

```bash
npm start
```

This will start the development server and open the app at `http://localhost:3000`.

### Building for Production

To build the app for production:

```bash
npm run build
```

This will create an optimized version of the app in the `build/` folder.

## Testing

You can run the tests using:

```bash
npm test
```

This will run all the unit tests and show the results in the terminal.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a pull request.

## Acknowledgments

* Inspired by the need for secure and verifiable academic record management.
* Thanks to **Ethereum Quorum** and **Solidity** for providing the blockchain framework.

```

Nếu bạn muốn thêm thông tin chi tiết hoặc thay đổi gì, cứ cho mình biết nhé!
```
