import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

const FileUpload = ({ onFileProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  const processPDFFile = async (file) => {
    try {
      // Set up PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false
      }).promise
      
      let allText = ''
      let allLines = []
      
      // Extract text from all pages with position information
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        // Group text items by their vertical position (y-coordinate)
        const textItems = textContent.items.map(item => ({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height
        }))
        
        // Sort by y-coordinate (top to bottom) and then by x-coordinate (left to right)
        textItems.sort((a, b) => {
          if (Math.abs(a.y - b.y) < 5) { // Same line if y-coordinates are close
            return a.x - b.x
          }
          return b.y - a.y // Higher y = lower on page
        })
        
        // Group items into lines
        let currentLine = []
        let currentY = null
        
        for (const item of textItems) {
          if (currentY === null || Math.abs(item.y - currentY) < 5) {
            currentLine.push(item.text)
            currentY = item.y
          } else {
            if (currentLine.length > 0) {
              allLines.push(currentLine.join(' '))
            }
            currentLine = [item.text]
            currentY = item.y
          }
        }
        
        if (currentLine.length > 0) {
          allLines.push(currentLine.join(' '))
        }
        
        allText += textContent.items.map(item => item.str).join(' ') + '\n'
      }
      
      console.log('Total lines extracted:', allLines.length)
      console.log('First 10 lines:', allLines.slice(0, 10))
      
      // Try multiple parsing strategies
      let transactions = parsePDFTextStructured(allLines)
      
      if (transactions.length < 5) {
        console.log('Structured parsing failed, trying fallback...')
        transactions = parsePDFTextFallback(allText)
      }
      
      console.log('Final transaction count:', transactions.length)
      return transactions
    } catch (error) {
      throw new Error('Error processing PDF file: ' + error.message)
    }
  }

  const parsePDFTextStructured = (lines) => {
    const transactions = []
    
    // Multiple date patterns for Indian bank statements
    const datePatterns = [
      /^(\d{1,2}\/\d{1,2}\/\d{2,2})/,  // DD/MM/YY
      /^(\d{1,2}\/\d{1,2}\/\d{4})/,    // DD/MM/YYYY
      /^(\d{1,2}-\d{1,2}-\d{2,2})/,    // DD-MM-YY
      /^(\d{1,2}-\d{1,2}-\d{4})/,      // DD-MM-YYYY
    ]
    
    // Amount pattern for Indian currency
    const amountPattern = /(\d{1,3}(?:,\d{3})*\.\d{2}|\d+\.\d{2})/g
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.length < 5) continue
      
      // Check if line starts with a date
      let date = null
      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match) {
          date = match[1]
          break
        }
      }
      
      if (!date) continue
      
      // Look for amounts in current line and next 2 lines
      let combinedText = line
      for (let j = 1; j <= 2 && i + j < lines.length; j++) {
        combinedText += ' ' + lines[i + j]
      }
      
      const amountMatches = [...combinedText.matchAll(amountPattern)]
      if (amountMatches.length === 0) continue
      
      // Extract narration
      let narration = line
        .replace(date, '')
        .replace(amountPattern, '')
        .trim()
        .replace(/\s+/g, ' ')
      
      // Clean up narration
      narration = narration.replace(/^[^\w]*/, '').replace(/[^\w]*$/, '')
      
      // Extract reference number
      const refMatch = combinedText.match(/([A-Z0-9]{8,}|[0-9]{10,})/)
      const chqRefNo = refMatch ? refMatch[1] : ''
      
      // Parse amounts
      let withdrawalAmt = 0
      let depositAmt = 0
      let closingBalance = 0
      
      const amounts = amountMatches.map(match => parseFloat(match[1].replace(/,/g, '')))
      
      if (amounts.length >= 3) {
        // Assume: withdrawal, deposit, closing balance
        withdrawalAmt = amounts[0]
        depositAmt = amounts[1]
        closingBalance = amounts[2]
      } else if (amounts.length === 2) {
        // Determine which is which based on context
        if (Math.abs(amounts[0] - amounts[1]) > Math.max(amounts[0], amounts[1]) * 0.1) {
          // One is likely closing balance
          if (amounts[0] > amounts[1]) {
            depositAmt = amounts[1]
            closingBalance = amounts[0]
          } else {
            withdrawalAmt = amounts[0]
            closingBalance = amounts[1]
          }
        } else {
          withdrawalAmt = amounts[0]
          depositAmt = amounts[1]
        }
      } else if (amounts.length === 1) {
        depositAmt = amounts[0]
      }
      
      // Create transaction
      const amount = depositAmt - withdrawalAmt
      transactions.push({
        date: date,
        narration: narration || 'Transaction',
        chqRefNo: chqRefNo,
        valueDt: date,
        withdrawalAmt: withdrawalAmt,
        depositAmt: depositAmt,
        closingBalance: closingBalance,
        amount: amount,
        type: amount >= 0 ? 'credit' : 'debit',
        absAmount: Math.abs(amount)
      })
    }
    
    console.log('Structured parsing found:', transactions.length, 'transactions')
    return transactions
  }
  
  const parsePDFTextFallback = (text) => {
    const transactions = []
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    // More aggressive date pattern matching
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,2}|\d{1,2}\/\d{1,2}\/\d{4})/g
    const amountPattern = /(\d{1,3}(?:,\d{3})*\.\d{2}|\d+\.\d{2})/g
    
    for (const line of lines) {
      const dateMatches = [...line.matchAll(datePattern)]
      const amountMatches = [...line.matchAll(amountPattern)]
      
      if (dateMatches.length > 0 && amountMatches.length > 0) {
        const date = dateMatches[0][1]
        const amounts = amountMatches.map(match => parseFloat(match[1].replace(/,/g, '')))
        
        let narration = line
          .replace(date, '')
          .replace(amountPattern, '')
          .trim()
          .replace(/\s+/g, ' ')
        
        const refMatch = line.match(/([A-Z0-9]{8,}|[0-9]{10,})/)
        const chqRefNo = refMatch ? refMatch[1] : ''
        
        let withdrawalAmt = 0
        let depositAmt = 0
        let closingBalance = 0
        
        if (amounts.length >= 3) {
          withdrawalAmt = amounts[0]
          depositAmt = amounts[1]
          closingBalance = amounts[2]
        } else if (amounts.length === 2) {
          withdrawalAmt = amounts[0]
          depositAmt = amounts[1]
        } else if (amounts.length === 1) {
          depositAmt = amounts[0]
        }
        
        const amount = depositAmt - withdrawalAmt
        transactions.push({
          date: date,
          narration: narration || 'Transaction',
          chqRefNo: chqRefNo,
          valueDt: date,
          withdrawalAmt: withdrawalAmt,
          depositAmt: depositAmt,
          closingBalance: closingBalance,
          amount: amount,
          type: amount >= 0 ? 'credit' : 'debit',
          absAmount: Math.abs(amount)
        })
      }
    }
    
    console.log('Fallback parsing found:', transactions.length, 'transactions')
    return transactions
  }

  const analyzePDFData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      throw new Error('No transaction data found in the PDF')
    }

    // Calculate summary statistics
    const totalCredits = transactions
      .filter(row => row.type === 'credit')
      .reduce((sum, row) => sum + row.absAmount, 0)
    
    const totalDebits = transactions
      .filter(row => row.type === 'debit')
      .reduce((sum, row) => sum + row.absAmount, 0)
    
    const netAmount = totalCredits - totalDebits
    
    const monthlyBreakdown = transactions.reduce((acc, row) => {
      try {
        const month = new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        if (!acc[month]) {
          acc[month] = { credits: 0, debits: 0, count: 0 }
        }
        if (row.type === 'credit') {
          acc[month].credits += row.absAmount
        } else {
          acc[month].debits += row.absAmount
        }
        acc[month].count += 1
      } catch {
        // Skip invalid dates
        console.warn('Invalid date format:', row.date)
      }
      return acc
    }, {})

    return {
      transactions: transactions,
      summary: {
        totalTransactions: transactions.length,
        totalCredits,
        totalDebits,
        netAmount,
        averageTransaction: transactions.length > 0 ? (totalCredits + totalDebits) / transactions.length : 0
      },
      monthlyBreakdown,
      originalColumns: ['date', 'narration', 'chqRefNo', 'valueDt', 'withdrawalAmt', 'depositAmt', 'closingBalance', 'amount', 'type', 'absAmount']
    }
  }

  const processFile = async (file) => {
    setIsProcessing(true)
    setError(null)

    try {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      let data

      if (fileExtension === 'csv') {
        data = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                reject(new Error('Error parsing CSV file'))
              } else {
                resolve(results.data)
              }
            },
            error: (error) => reject(error)
          })
        })
      } else if (['xlsx', 'xls'].includes(fileExtension)) {
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // Convert to array of objects if headers exist
        if (data.length > 0) {
          const headers = data[0]
          data = data.slice(1).map(row => {
            const obj = {}
            headers.forEach((header, index) => {
              obj[header] = row[index]
            })
            return obj
          })
        }
      } else if (fileExtension === 'pdf') {
        data = await processPDFFile(file)
      } else {
        throw new Error('Unsupported file format. Please upload CSV, Excel, or PDF files.')
      }

      // Analyze the data
      const analyzedData = fileExtension === 'pdf' ? analyzePDFData(data) : analyzeStatement(data)
      onFileProcessed(analyzedData)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeStatement = (data) => {
    if (!data || data.length === 0) {
      throw new Error('No data found in the file')
    }

    // Find common column names for amounts and dates
    const firstRow = data[0]
    const columns = Object.keys(firstRow)
    
    let amountColumn = null
    let dateColumn = null
    let descriptionColumn = null

    // Try to identify amount column
    const amountKeywords = ['amount', 'debit', 'credit', 'balance', 'transaction']
    for (const col of columns) {
      if (amountKeywords.some(keyword => col.toLowerCase().includes(keyword))) {
        amountColumn = col
        break
      }
    }

    // Try to identify date column
    const dateKeywords = ['date', 'posted', 'transaction']
    for (const col of columns) {
      if (dateKeywords.some(keyword => col.toLowerCase().includes(keyword))) {
        dateColumn = col
        break
      }
    }

    // Try to identify description column
    const descKeywords = ['description', 'memo', 'details', 'narration']
    for (const col of columns) {
      if (descKeywords.some(keyword => col.toLowerCase().includes(keyword))) {
        descriptionColumn = col
        break
      }
    }

    // If we can't find specific columns, use the first few columns
    if (!amountColumn && columns.length > 0) {
      amountColumn = columns[columns.length - 1] // Usually amount is the last column
    }
    if (!dateColumn && columns.length > 1) {
      dateColumn = columns[0] // Usually date is the first column
    }
    if (!descriptionColumn && columns.length > 2) {
      descriptionColumn = columns[1] // Usually description is the second column
    }

    // Process the data
    const processedData = data.map(row => {
      const amount = parseFloat(row[amountColumn]) || 0
      const date = row[dateColumn] || ''
      const description = row[descriptionColumn] || ''
      
      // Check if we have separate withdrawal and deposit columns
      const withdrawalColumn = columns.find(col => 
        col.toLowerCase().includes('withdrawal') || 
        col.toLowerCase().includes('debit') ||
        col.toLowerCase().includes('dr')
      )
      const depositColumn = columns.find(col => 
        col.toLowerCase().includes('deposit') || 
        col.toLowerCase().includes('credit') ||
        col.toLowerCase().includes('cr')
      )
      
      let withdrawalAmt = 0
      let depositAmt = 0
      
      if (withdrawalColumn && depositColumn) {
        withdrawalAmt = parseFloat(row[withdrawalColumn]) || 0
        depositAmt = parseFloat(row[depositColumn]) || 0
      } else {
        // Fallback to single amount column
        if (amount >= 0) {
          depositAmt = amount
        } else {
          withdrawalAmt = Math.abs(amount)
        }
      }
      
      return {
        date,
        narration: description,
        withdrawalAmt,
        depositAmt,
        amount: depositAmt - withdrawalAmt,
        type: (depositAmt - withdrawalAmt) >= 0 ? 'credit' : 'debit',
        absAmount: Math.abs(depositAmt - withdrawalAmt)
      }
    }).filter(row => row.amount !== 0)

    // Calculate summary statistics
    const totalCredits = processedData
      .filter(row => row.type === 'credit')
      .reduce((sum, row) => sum + row.absAmount, 0)
    
    const totalDebits = processedData
      .filter(row => row.type === 'debit')
      .reduce((sum, row) => sum + row.absAmount, 0)
    
    const netAmount = totalCredits - totalDebits
    
    const monthlyBreakdown = processedData.reduce((acc, row) => {
      const month = new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      if (!acc[month]) {
        acc[month] = { credits: 0, debits: 0, count: 0 }
      }
      if (row.type === 'credit') {
        acc[month].credits += row.absAmount
      } else {
        acc[month].debits += row.absAmount
      }
      acc[month].count += 1
      return acc
    }, {})

    return {
      transactions: processedData,
      summary: {
        totalTransactions: processedData.length,
        totalCredits,
        totalDebits,
        netAmount,
        averageTransaction: processedData.length > 0 ? (totalCredits + totalDebits) / processedData.length : 0
      },
      monthlyBreakdown,
      originalColumns: columns
    }
  }

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  return (
    <div className="card">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Upload Your Bank Statement
        </h2>
        <p className="text-gray-600 mb-6">
          Drag and drop your CSV, Excel, or PDF file, or click to browse
        </p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}
            <div className="text-center">
              {isProcessing ? (
                <p className="text-lg font-medium text-gray-900">Processing your file...</p>
              ) : isDragActive ? (
                <p className="text-lg font-medium text-primary-600">Drop the file here</p>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-900">
                    Drop your bank statement here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports CSV, Excel, and PDF files
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>Your data is processed locally and never uploaded to our servers</p>
        </div>
      </div>
    </div>
  )
}

export default FileUpload 