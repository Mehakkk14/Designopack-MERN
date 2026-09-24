# DesignOPack — Full-Stack Business Website & Admin Management System

## A Real-World MERN Application for a Delhi-Based Hospitality & Packaging Brand

**DesignOPack** is a **15-year-old Delhi-based hospitality and packaging brand** specializing in luxury and customized packaging solutions for businesses in the hospitality and related industries.

This project is a **real-world business website and management platform** built around the actual requirements of the business.

Rather than being a simple portfolio, landing page, or tutorial CRUD application, DesignOPack combines a customer-facing product showcase with a backend-powered administration system for managing products, categories, homepage content, and customer enquiries.

---

## 🌐 Project Overview

The application was designed to solve a practical business problem.

A hospitality and packaging business needs an online presence where potential customers can:

- Discover the company's products
- Browse products by category
- View detailed product information
- Explore product media and catalogues
- Request quotations
- Contact the business

At the same time, the business needs an internal system to manage its online catalogue and incoming enquiries without modifying the website code every time something changes.

### The application brings both sides together

```text
                         DESIGNOPACK
                              │
               ┌──────────────┴──────────────┐
               │                             │
        CUSTOMER SIDE                  ADMIN SIDE
               │                             │
               ▼                             ▼
        Browse Products                Admin Login
        View Categories                Product Management
        Product Details                Category Management
        Request Quotes                 Banner Management
        Contact Business               Quote Management
               │                             │
               └──────────────┬──────────────┘
                              │
                              ▼
                       REST API / Backend
                              │
                              ▼
                           MongoDB
```

The result is a full-stack business application rather than a static marketing website.

---

## 🎯 Business Problem

For a product-driven hospitality and packaging company, the website needs to do more than display information.

The business workflow involves:

$$\text{Customer discovers product} \rightarrow \text{explores catalogue} \rightarrow \text{submits enquiry} \rightarrow \text{business receives request} \rightarrow \text{admin follows up} \rightarrow \text{enquiry status is tracked}$$

The application was built to support this workflow digitally.

### Customer-facing requirements

Customers should be able to:

- Explore the product catalogue
- Browse products according to categories
- View product details and images
- Understand available product options
- Submit a custom quotation request
- Contact the business

### Business-side requirements

The business team should be able to:

- Securely access an admin dashboard
- Add and update products
- Organize products into categories
- Manage homepage banners
- View incoming customer enquiries
- Track the status of enquiries
- Remove outdated products or content

This required both a polished frontend experience and a structured backend capable of handling business data.

---

## ✨ Key Features

### Customer Experience

#### Product Catalogue
Customers can browse the available DesignOPack product range through a categorized catalogue.

#### Product Categories
Products are organized into categories to make navigation easier and allow the business to maintain a structured catalogue.

#### Product Details
Each product can contain:
- Product name
- Description
- Categories
- Images
- Additional media
- Features
- Availability
- Display ordering

#### Quote Requests
Customers can submit quotation requests directly from the website. A quote can contain:
- Customer name
- Email
- Phone number
- Company name
- Product of interest
- Message

---

## 🛠️ Admin Management System

The project includes a protected administration area for managing the business website.

### Admin Dashboard
Provides an internal interface for managing the website's business content.

### Product Management
Admins can:
- Create products
- Update products
- Delete products
- Manage product media
- Assign categories
- Control display ordering
- Manage availability

### Category Management
Admins can:
- Create categories
- Update categories
- Delete categories
- Control category ordering
- Associate catalogues with categories

### Homepage Banner Management
Admins can manage homepage banners including:
- Banner title
- Image
- Active/inactive status
- Display order

The backend also enforces a maximum of 8 homepage banners.

### Quote Management
Customer enquiries are stored in MongoDB and can be managed from the admin panel.

Each enquiry has a lifecycle:

```text
NEW
  ↓
CONTACTED
  ↓
QUOTED
  ↓
CLOSED
```

This allows the business to track the progress of customer enquiries rather than treating contact-form submissions as simple messages.

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React + TypeScript |
| **Build Tool** | Vite |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB |
| **ODM** | Mongoose |
| **Authentication** | JWT |
| **Password Security** | bcrypt |
| **API Architecture** | REST API |
| **Styling** | Tailwind CSS / CSS |
| **Deployment** | Vercel / Node.js compatible hosting |

---

## 🧩 Why MERN?

The project follows the MERN architecture.

* **M — MongoDB**: Stores products, categories, banners, customer enquiries, and administrator information.
* **E — Express.js**: Provides the REST API layer and handles HTTP requests, routes, and middleware.
* **R — React**: Powers the customer-facing website and the admin dashboard.
* **N — Node.js**: Runs the backend application and API server.

The frontend does not directly communicate with MongoDB. Instead, the architecture follows:

```text
React + TypeScript
        │
        │ HTTP REST API
        ▼
Node.js + Express
        │
        │ Mongoose
        ▼
     MongoDB
```

This separation makes the application easier to maintain and allows the frontend and backend to evolve independently.

---

## 🏛️ Application Architecture

```text
DesignOPack-MERN/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Quote.js
│   │   └── Banner.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── quoteController.js
│   │   └── bannerController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── quoteRoutes.js
│   │   └── bannerRoutes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── types/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── components/
│   │   └── index.css
│   │
│   └── package.json
│
├── package.json
└── README.md
```

---

## 🔌 REST API

The application uses RESTful APIs to connect the React frontend with the Express backend.

### Authentication

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate administrator and return JWT |
| `GET` | `/api/auth/me` | Protected | Return authenticated administrator |
| `POST` | `/api/auth/register` | Protected | Register a new administrator |
| `POST` | `/api/auth/forgot-password` | Public | Initiate password reset |

### Products

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Fetch products |
| `GET` | `/api/products/:id` | Public | Fetch a specific product |
| `POST` | `/api/products` | Protected | Create product |
| `PUT` | `/api/products/:id` | Protected | Update product |
| `DELETE` | `/api/products/:id` | Protected | Delete product |

*Products can also be filtered by category and sorted according to the application's catalogue requirements.*

### Categories

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | Fetch categories |
| `POST` | `/api/categories` | Protected | Create category |
| `POST` | `/api/categories/initialize` | Setup | Initialize default categories |
| `PUT` | `/api/categories/:id` | Protected | Update category |
| `DELETE` | `/api/categories/:id` | Protected | Delete category |

### Quotes

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/quotes` | Public | Submit customer enquiry |
| `GET` | `/api/quotes` | Protected | View enquiries |
| `PATCH` | `/api/quotes/:id/status` | Protected | Update enquiry status |
| `DELETE` | `/api/quotes/:id` | Protected | Delete enquiry |

### Banners

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/banners` | Public | Fetch banners |
| `GET` | `/api/banners/active` | Public | Fetch active homepage banners |
| `POST` | `/api/banners` | Protected | Create banner |
| `POST` | `/api/banners/initialize` | Setup | Initialize default banners |
| `PUT` | `/api/banners/:id` | Protected | Update banner |
| `DELETE` | `/api/banners/:id` | Protected | Delete banner |

---

## 🗄️ MongoDB Data Models

The backend uses Mongoose to define structured schemas for the application's business entities.

### Admin
```javascript
{
  name: String,
  email: String,
  password: String, // bcrypt hashed
  role: "admin" | "superadmin",
  timestamps: true
}
```

### Product
```javascript
{
  name: String,
  categories: [String],
  description: String,
  imageUrl: String,
  media: [
    {
      imageUrl: String,
      description: String
    }
  ],
  features: [String],
  price: Number,
  inStock: Boolean,
  displayOrder: Number,
  timestamps: true
}
```

### Category
```javascript
{
  name: String,
  description: String,
  catalogueUrl: String,
  displayOrder: Number,
  timestamps: true
}
```

### Quote
```javascript
{
  name: String,
  email: String,
  phone: String,
  companyName: String,
  product: String,
  message: String,
  status: "new" | "contacted" | "quoted" | "closed",
  timestamps: true
}
```

### Banner
```javascript
{
  title: String,
  imageUrl: String,
  isActive: Boolean,
  order: Number,
  timestamps: true
}
```

---

## 🔐 Authentication & Security

The admin system uses authentication to protect business management operations.

### Password Hashing
Administrator passwords are hashed using `bcryptjs` before being stored in MongoDB.

### JWT Authentication
After successful login, the backend issues a signed JWT token. The token is used to authenticate protected API requests.

### Protected Routes
Operations such as:
- Creating products
- Updating products
- Deleting products
- Managing categories
- Managing banners
- Viewing customer enquiries
- Updating enquiry status

require a valid authentication token.

### Middleware
Authentication is handled through Express middleware which verifies the JWT before allowing access to protected resources.

### Environment Variables
Sensitive configuration such as:
- MongoDB connection string
- JWT secret
- Email configuration

is stored through environment variables rather than being committed to the repository.

---

## 🔄 Application Flow

### Customer Product Flow

```text
Customer
   │
   ▼
Homepage
   │
   ▼
Product Categories
   │
   ▼
Product Listing
   │
   ▼
Product Details
   │
   ▼
Request Quote
   │
   ▼
Express API
   │
   ▼
MongoDB
```

### Admin Flow

```text
Admin
  │
  ▼
Login
  │
  ▼
JWT Authentication
  │
  ▼
Admin Dashboard
  │
  ├── Products
  │     ├── Create
  │     ├── Update
  │     └── Delete
  │
  ├── Categories
  │     ├── Create
  │     ├── Update
  │     └── Delete
  │
  ├── Banners
  │     ├── Create
  │     ├── Update
  │     └── Delete
  │
  └── Customer Quotes
        ├── View
        ├── Update Status
        └── Delete
```

---

## 💡 Engineering Highlights

1. **Separation of Frontend and Backend**: The React application communicates with the Express server through REST APIs instead of directly accessing the database.
2. **Reusable API Layer**: Frontend API communication is centralized, making API calls easier to maintain and modify.
3. **Centralized TypeScript Types**: Common domain types such as Products, Categories, Quotes, Banners, and Admin users are centralized to reduce duplication across the frontend.
4. **Protected Business Operations**: Customer-facing read operations remain public while business-management operations are protected using JWT authentication.
5. **Structured Data Modelling**: Business entities are represented as separate MongoDB/Mongoose models instead of storing everything in a single collection.
6. **Enquiry Lifecycle**: Customer enquiries are represented with explicit statuses: `new` → `contacted` → `quoted` → `closed`. This models an actual business workflow rather than simply storing contact-form submissions.
7. **Admin-Driven Content**: Products, categories, and homepage banners can be managed through the admin interface without requiring changes to the React source code.

---

## 📱 Frontend Structure

The frontend contains both the customer-facing website and administrative interface.

### Customer Pages
- Home
- Products
- Product Category
- Product Details
- Contact

### Admin Pages
- Admin Login
- Admin Dashboard
- Product Management
- Category Management
- Banner Management
- Quote Management

The visual design was intentionally preserved around the existing DesignOPack brand identity, including its typography, colors, responsive layouts, product presentation, and customer experience.

### 📂 Frontend Architecture

```text
frontend/
└── src/
    │
    ├── components/
    │     └── Reusable UI components
    │
    ├── pages/
    │     ├── Home.tsx
    │     ├── Products.tsx
    │     ├── ProductCategory.tsx
    │     ├── Contact.tsx
    │     ├── Admin.tsx
    │     ├── AdminLogin.tsx
    │     ├── AdminProducts.tsx
    │     ├── AdminCategories.tsx
    │     ├── AdminBanners.tsx
    │     └── AdminQuotes.tsx
    │
    ├── lib/
    │     ├── api.ts
    │     ├── authService.ts
    │     ├── logger.ts
    │     └── utils.ts
    │
    ├── hooks/
    │     ├── use-mobile.tsx
    │     └── use-toast.ts
    │
    ├── types/
    │     └── index.ts
    │
    └── index.css
```

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas
- npm

### Backend

```bash
cd DesignOPack-MERN/backend
npm install
npm run dev
```

The backend runs on:
`http://localhost:5000`

### Frontend

Open another terminal:

```bash
cd DesignOPack-MERN/frontend
npm install
npm run dev
```

The frontend runs on the Vite development server.

The frontend API base URL should point to:
`http://localhost:5000/api`

---

## 🔑 Environment Variables

Create environment files locally using the provided `.env.example` files.

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Additional frontend environment variables may be configured for business email functionality.

*Environment files containing real credentials are intentionally excluded from Git.*

---

## 📈 Why This Project Matters

DesignOPack demonstrates the development of a web application from a real business requirement, rather than building isolated technical features for demonstration.

The project combines:
- Business requirements
- Customer experience
- Product catalogue management
- Customer lead generation
- Admin workflows
- Authentication
- REST API design
- Database modelling
- CRUD operations
- Frontend/backend integration

The most important aspect of the project is the connection between the business workflow and the technical implementation.

For example:

```text
Business Requirement
        ↓
Customer needs product information
        ↓
Product + Category Models
        ↓
REST API
        ↓
React Catalogue
```

And:

```text
Business Requirement
        ↓
Customer wants a quotation
        ↓
Quote Model
        ↓
POST /api/quotes
        ↓
Admin Quote Dashboard
        ↓
new → contacted → quoted → closed
```

This approach helped shape the backend around actual application requirements instead of creating generic CRUD APIs without a business purpose.

---

## 🧠 What I Learned

Building this project involved working across the complete web application stack:

- Designing React interfaces
- Working with TypeScript
- Building REST APIs using Express
- Designing MongoDB schemas with Mongoose
- Implementing JWT authentication
- Password hashing with bcrypt
- Creating protected routes
- Connecting frontend and backend
- Handling CRUD operations
- Managing environment variables
- Structuring a full-stack application
- Translating business requirements into technical features

The project also provided practical experience in thinking about how a real business application should be structured, maintained, and extended.

---

## 🔮 Possible Future Improvements

Potential future improvements include:

- Role-based permissions for different admin users
- Cloud-based image storage
- Advanced product search and filtering
- Analytics for customer enquiries
- Email notifications for new quote requests
- Pagination for large product catalogues
- Audit logs for admin actions
- Automated deployment pipelines
- Additional business reporting dashboards

---

## 👩💻 Project Context

| Detail | Information |
| :--- | :--- |
| **Project** | DesignOPack Full-Stack Business Platform |
| **Industry** | Hospitality & Luxury Packaging |
| **Business** | DesignOPack |
| **Location** | Delhi, India |
| **Business History** | 15+ years |
| **Architecture** | MERN Full Stack |
| **Application Type** | Customer-facing Business Website + Admin Management System |

This project was developed to support the digital presence and operational requirements of a real-world hospitality and packaging business.

---

## 📌 Project Structure

```text
DesignOPack-MERN/
│
├── backend/          # Node.js + Express + MongoDB backend
│
├── frontend/         # React + TypeScript frontend
│
├── package.json      # Root project scripts
│
└── README.md         # Project documentation
```

---

## 📄 License

This repository is intended for demonstration and technical evaluation purposes.

The DesignOPack brand, business information, product information, images, and other business assets belong to their respective owners.
