# Bank Statement Analyzer

A simple and intuitive web application that analyzes bank statements and provides easy-to-understand insights with exportable reports.

## Features

- **File Upload**: Support for CSV, Excel, and PDF files
- **Smart Analysis**: Automatically detects common column names for amounts, dates, and descriptions
- **Visual Insights**: Clean, human-friendly presentation of financial data
- **Export Options**: Download analysis as CSV or Excel files
- **Free Tier**: 3 free analyses per session
- **Premium Upgrade**: Unlimited analysis with advanced features

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **File Processing**: PapaParse (CSV), SheetJS (Excel), PDF.js (PDF)
- **Icons**: Lucide React
- **File Upload**: React Dropzone

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bank-statement-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Upload Statement**: Drag and drop your CSV, Excel, or PDF file, or click to browse
2. **Automatic Analysis**: The app will automatically detect and process your data
3. **Review Insights**: View summary statistics, monthly breakdown, and transaction details
4. **Export Results**: Download your analysis as CSV or Excel files

## Supported File Formats

- **CSV**: Standard comma-separated values files
- **Excel**: .xlsx and .xls files
- **PDF**: Bank statement PDFs with text content

## Expected Column Names

The app automatically detects common column names:

- **Amount**: amount, debit, credit, balance, transaction
- **Date**: date, posted, transaction
- **Description**: description, memo, details, narration

## Free vs Premium

### Free Tier
- 3 analyses per session
- Basic summary and export features
- Standard processing

### Premium Features
- Unlimited analysis
- Advanced analytics and insights
- Priority customer support
- Export to multiple formats
- Custom report templates
- Data visualization charts

## Development

### Project Structure

```
src/
├── components/
│   ├── FileUpload.jsx      # File upload and processing
│   ├── StatementAnalyzer.jsx # Analysis display and export
│   ├── PaymentModal.jsx    # Premium upgrade modal
│   └── Header.jsx          # App header with usage tracking
├── App.jsx                 # Main application component
├── main.jsx               # Application entry point
└── index.css              # Tailwind CSS styles
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
