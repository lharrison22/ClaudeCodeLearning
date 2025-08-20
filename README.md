# 💸 Expense Tracker

A modern, professional expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS. Track your personal finances with ease and get insights into your spending patterns.

## ✨ Features

### Core Functionality
- ➕ **Add Expenses**: Record expenses with date, amount, category, and description
- 📋 **View Expenses**: Browse all expenses in a clean, organized list
- ✏️ **Edit Expenses**: Modify existing expense details
- 🗑️ **Delete Expenses**: Remove expenses with confirmation dialog
- 🔍 **Search & Filter**: Filter by date range, category, and search terms

### Analytics & Insights
- 📊 **Dashboard**: Overview with spending summaries and analytics
- 📈 **Visual Charts**: Spending breakdown by category and monthly trends
- 🎯 **Top Categories**: Identify your highest spending categories
- 📊 **Quick Stats**: Total spending, monthly spending, averages

### Data Management
- 💾 **Local Storage**: Data persists in your browser
- 📤 **CSV Export**: Download your expense data
- 🔒 **Data Validation**: Form validation for all inputs

### Design & UX
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🎨 **Modern UI**: Clean, professional interface
- ⚡ **Fast Performance**: Optimized for speed
- 🔔 **User Feedback**: Loading states, success messages, error handling

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Data Storage**: localStorage
- **Icons**: Emoji-based for universal compatibility

## 📦 Installation & Setup

1. **Clone or download** the project files
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. **Open your browser** and navigate to `http://localhost:3000`

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 How to Use

### Adding Your First Expense
1. Click "Add Expense" from the dashboard or navigation
2. Fill in the date, amount, category, and description
3. Click "Add Expense" to save

### Viewing and Managing Expenses
1. Go to the "Expenses" page to see all your expenses
2. Use the search and filter options to find specific expenses
3. Click "Edit" to modify an expense
4. Click "Delete" to remove an expense (with confirmation)

### Exploring Analytics
1. Visit the Dashboard to see your spending overview
2. View summary cards for total spending, monthly spending, and averages
3. Check the category breakdown and monthly trends
4. Use the quick actions to add expenses or export data

### Exporting Data
1. From the Dashboard, click "Export Data" for all expenses
2. From the Expenses page, click "Export CSV" for filtered expenses
3. Your data will download as a CSV file

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── add-expense/       # Add expense page
│   ├── expenses/          # Expenses list page
│   ├── edit-expense/      # Edit expense page
│   └── page.tsx           # Dashboard (home page)
├── components/            # Reusable components
│   ├── Layout.tsx         # Main layout wrapper
│   ├── Navigation.tsx     # Navigation component
│   ├── ExpenseChart.tsx   # Charts and visualizations
│   ├── ErrorBoundary.tsx  # Error handling
│   └── LoadingSpinner.tsx # Loading components
├── hooks/                 # Custom React hooks
│   └── useExpenses.ts     # Expense management hook
├── lib/                   # Utility functions
│   ├── constants.ts       # App constants
│   ├── storage.ts         # localStorage utilities
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
    └── expense.ts         # Expense-related types
```

## 🎨 Categories

The app includes 6 predefined categories:
- 🍽️ **Food** - Restaurants, groceries, dining out
- 🚗 **Transportation** - Gas, public transit, rideshare
- 🎬 **Entertainment** - Movies, games, subscriptions
- 🛍️ **Shopping** - Clothing, electronics, general purchases
- 📄 **Bills** - Utilities, rent, insurance
- 📦 **Other** - Everything else

## 💡 Tips for Best Results

1. **Be Consistent**: Use the same categories for similar expenses
2. **Add Details**: Write descriptive expense descriptions
3. **Regular Updates**: Add expenses frequently to avoid forgetting
4. **Review Monthly**: Check your spending patterns regularly
5. **Export Regularly**: Backup your data by exporting to CSV

## 🔧 Customization

The app is designed to be easily customizable:

- **Categories**: Modify `EXPENSE_CATEGORIES` in `src/lib/constants.ts`
- **Colors**: Update `CATEGORY_COLORS` for different visual themes
- **Currency**: Change formatting in `src/lib/utils.ts`
- **Storage**: Replace localStorage with a database for persistence

## 🌟 Production Ready

This application is production-ready and includes:
- ✅ Type safety with TypeScript
- ✅ Responsive design for all devices
- ✅ Error boundary for crash protection
- ✅ Form validation and user feedback
- ✅ Loading states and smooth interactions
- ✅ Clean, maintainable code structure

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy tracking your expenses!** 💰✨
