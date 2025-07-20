# Bank Statement Analyzer

A modern React application for analyzing bank statements with advanced features including Google authentication, month filtering, and improved table readability.

## Features

- **File Upload**: Support for CSV and PDF bank statements
- **Transaction Analysis**: Detailed breakdown of credits, debits, and balances
- **Monthly Breakdown**: View transactions by month with filtering
- **Google Authentication**: Sign in/up with Google account
- **Export Functionality**: Export to CSV and Excel formats
- **Premium Features**: Advanced analytics for premium users
- **Responsive Design**: Works on desktop and mobile devices

## New Features Added

### 1. Google Sign-In/Sign-Up
- Integrated Google OAuth 2.0 authentication
- Automatic user profile picture display
- Seamless login experience

### 2. Enhanced Table Readability
- Increased font size from `text-xs` to `text-sm`
- Improved padding and spacing
- Better column widths for readability

### 3. Month Filtering in Summary Tab
- Click on any month to view transactions for that month only
- Filter dropdown for easy month selection
- Export filtered data to CSV/Excel
- Visual highlighting of selected month

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Google OAuth Setup

To enable Google sign-in functionality:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an "OAuth 2.0 Client ID"
5. Set the authorized JavaScript origins to `http://localhost:5173` (for development)
6. Copy your Client ID

### 3. Configure Google Client ID

Replace `YOUR_GOOGLE_CLIENT_ID` in `src/main.jsx` with your actual Google Client ID:

```jsx
<GoogleOAuthProvider clientId="your-actual-client-id-here">
  <App />
</GoogleOAuthProvider>
```

### 4. Run the Application
```bash
npm run dev
```

## Usage

### Authentication
1. Click "Login" in the header
2. Choose to sign in with Google or create a traditional account
3. Your profile picture will be displayed if using Google authentication

### File Analysis
1. Upload your bank statement (CSV or PDF)
2. View the analysis in three tabs:
   - **Transactions**: All transactions with improved readability
   - **Summary**: Key insights and monthly breakdown with filtering
   - **Monthly Breakdown**: Detailed monthly statistics

### Month Filtering
1. Go to the "Summary" tab
2. Click on any month in the "Monthly Breakdown" section
3. View transactions for that specific month
4. Use the filter dropdown to select different months
5. Export filtered data using the export buttons

### Export Options
- **CSV Export**: Download as CSV file
- **Excel Export**: Download as Excel file with multiple sheets
- **Filtered Export**: Export only selected month's data

## Technologies Used

- React 19
- Vite
- Tailwind CSS
- Lucide React Icons
- PapaParse (CSV parsing)
- PDF.js (PDF parsing)
- XLSX (Excel export)
- @react-oauth/google (Google authentication)

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Security Notes

- Google OAuth tokens are handled securely on the client side
- No sensitive data is stored locally
- Export functionality requires user authentication for large files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
