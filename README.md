# Smart Deals Server

Backend server for the **Smart Deals** marketplace application where users can securely manage products, authentication, and private API access using JWT.

---

## 🚀 Live Website

https://smart-deals-232.netlify.app

---

## 🔗 GitHub Repository Links

### Client Side

```bash
https://github.com/mafizul24h/smart-deals-client.git
```

### Server Side

```bash
https://github.com/mafizul24h/smart-deals-server.git
```

---

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- dotenv
- cors

---

## ✨ Features

- REST API with Express.js
- JWT Authentication System
- Secure Private Routes
- MongoDB Database Integration
- Add Products API
- Update Product API
- Delete Product API
- Get All Products API
- Get Single Product API
- Secure Environment Variables
- CORS Configuration
- Firebase Client Authentication Support

---

## 📦 Installed Packages

```json
{
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "express": "^4.18.0",
  "jsonwebtoken": "^9.0.0",
  "mongodb": "^6.0.0"
}
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add:

```env
PORT=5000
DB_USER=your_database_user
DB_PASS=your_database_password
ACCESS_TOKEN_SECRET=your_secret_key
```

---

## 🌍 Setup Environment Variables on Vercel

### Step 1

Open Vercel Dashboard

```txt
https://vercel.com/dashboard
```

---

### Step 2

Select Your Project

---

### Step 3

Go to:

```txt
Settings → Environment Variables
```

---

### Step 4

Add Environment Variables

| Key | Value |
|-----|------|
| DB_USER | your_database_user |
| DB_PASS | your_database_password |
| ACCESS_TOKEN_SECRET | your_secret_key |

---

### Step 5

Click Save

---

### Step 6

Redeploy Project

```txt
Deployments → Redeploy
```

---

## ⚠️ Important Notes

- Never upload `.env` file to GitHub
- Add `.env` to `.gitignore`
- Use strong JWT secret keys
- Redeploy after changing environment variables

### Example `.gitignore`

```gitignore
node_modules
.env
```

---

## 📂 Project Structure

```bash
smart-deals-server/
│
├── node_modules/
├── .env
├── package.json
├── index.js
├── vercel.json
└── README.md
```

---

## ▶️ Run Locally

### Clone the project

```bash
git clone https://github.com/mafizul24h/smart-deals-server.git
```

### Go to project directory

```bash
cd smart-deals-server
```

### Install dependencies

```bash
npm install
```

### Start the server

```bash
npm start
```

or

```bash
nodemon index.js
```

---

## 🔐 JWT Authentication

### Generate Token

```js
jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
  expiresIn: "7d",
});
```

---

### Verify Token Middleware

```js
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({
      message: "Unauthorized Access",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        return res.status(403).send({
          message: "Forbidden Access",
        });
      }

      req.decoded = decoded;
      next();
    }
  );
};
```

---

## 📌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/jwt` | Generate JWT Token |

---

### Products

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get single product |
| POST | `/products` | Add new product |
| PATCH | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

---

## 🚀 Deployment

### Deploy on Vercel

Install Vercel CLI

```bash
npm install -g vercel
```

Deploy Project

```bash
vercel
```

Production Deploy

```bash
vercel --prod
```

---

## 👨‍💻 Developer

### Mafizul Islam

---

## 📄 License

This project is licensed under the MIT License.