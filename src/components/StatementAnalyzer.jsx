import { useState } from 'react'
import { Download, ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar, Filter } from 'lucide-react'
import * as XLSX from 'xlsx'

const StatementAnalyzer = ({ data, onReset, onExport, user }) => {
  const [activeTab, setActiveTab] = useState('transactions')
  const [selectedMonth, setSelectedMonth] = useState(null)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Filter transactions by selected month
  const getFilteredTransactions = () => {
    if (!selectedMonth) return data.transactions
    
    return data.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      const transactionMonth = transactionDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
      return transactionMonth === selectedMonth
    })
  }

  const exportToCSV = () => {
    const transactionsToExport = selectedMonth ? getFilteredTransactions() : data.transactions
    const csvContent = [
      ['Date', 'Narration', 'Chq./Ref.No.', 'ValueDt', 'WithdrawalAmt.', 'DepositAmt.', 'ClosingBalance'],
      ...transactionsToExport.map(t => [
        t.date,
        t.narration || t.description || '',
        t.chqRefNo || '',
        t.valueDt || t.date,
        t.withdrawalAmt || 0,
        t.depositAmt || 0,
        t.closingBalance || 0
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = selectedMonth ? `bank_statement_${selectedMonth.replace(' ', '_')}.csv` : 'bank_statement_analysis.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToExcel = () => {
    const transactionsToExport = selectedMonth ? getFilteredTransactions() : data.transactions
    const workbook = XLSX.utils.book_new()
    
    // Summary sheet
    const summaryData = [
      ['Summary', ''],
      ['Total Transactions', transactionsToExport.length],
      ['Total Credits', formatCurrency(transactionsToExport.reduce((sum, t) => sum + (t.depositAmt || 0), 0))],
      ['Total Debits', formatCurrency(transactionsToExport.reduce((sum, t) => sum + (t.withdrawalAmt || 0), 0))],
      ['Net Amount', formatCurrency(transactionsToExport.reduce((sum, t) => sum + (t.depositAmt || 0) - (t.withdrawalAmt || 0), 0))],
      ['', ''],
      ['Monthly Breakdown', ''],
      ['Month', 'Credits', 'Debits', 'Net', 'Transaction Count'],
      ...Object.entries(data.monthlyBreakdown).map(([month, stats]) => [
        month,
        formatCurrency(stats.credits),
        formatCurrency(stats.debits),
        formatCurrency(stats.credits - stats.debits),
        stats.count
      ])
    ]
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
    
    // Transactions sheet
    const transactionData = [
      ['Date', 'Narration', 'Chq./Ref.No.', 'ValueDt', 'WithdrawalAmt.', 'DepositAmt.', 'ClosingBalance'],
      ...transactionsToExport.map(t => [
        t.date,
        t.narration || t.description || '',
        t.chqRefNo || '',
        t.valueDt || t.date,
        t.withdrawalAmt || 0,
        t.depositAmt || 0,
        t.closingBalance || 0
      ])
    ]
    
    const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData)
    XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions')
    
    XLSX.writeFile(workbook, selectedMonth ? `bank_statement_${selectedMonth.replace(' ', '_')}.xlsx` : 'bank_statement_analysis.xlsx')
  }

  const tabs = [
    { id: 'transactions', label: 'Transactions', icon: Calendar },
    { id: 'summary', label: 'Summary', icon: DollarSign },
    { id: 'monthly', label: 'Monthly Breakdown', icon: TrendingUp }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload New File</span>
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={user ? (onExport || exportToCSV) : onExport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={user ? (onExport || exportToExcel) : onExport}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-xl font-semibold text-green-600">
                {formatCurrency(data.summary.totalCredits)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Debits</p>
              <p className="text-xl font-semibold text-red-600">
                {formatCurrency(data.summary.totalDebits)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Amount</p>
              <p className={`text-xl font-semibold ${data.summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.summary.netAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-xl font-semibold text-purple-600">
                {data.summary.totalTransactions}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Month Filter */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Overview</h3>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedMonth || ''}
                    onChange={(e) => setSelectedMonth(e.target.value || null)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Months</option>
                    {Object.keys(data.monthlyBreakdown).map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Average Transaction</span>
                      <span className="font-medium">{formatCurrency(data.summary.averageTransaction)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Credit/Debit Ratio</span>
                      <span className="font-medium">
                        {(data.summary.totalCredits / (data.summary.totalCredits + data.summary.totalDebits) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Net Position</span>
                      <span className={`font-medium ${data.summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.summary.netAmount >= 0 ? 'Positive' : 'Negative'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(data.monthlyBreakdown).map(([month, stats]) => (
                      <div 
                        key={month} 
                        className={`p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
                          selectedMonth === month ? 'bg-primary-50 border-primary-300' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedMonth(selectedMonth === month ? null : month)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{month}</span>
                          <span className={`text-sm font-medium ${stats.credits - stats.debits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(stats.credits - stats.debits)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Credits: {formatCurrency(stats.credits)}</span>
                          <span>Debits: {formatCurrency(stats.debits)}</span>
                          <span>{stats.count} transactions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filtered Transactions Table */}
              {selectedMonth && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Transactions for {selectedMonth}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Narration
                          </th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Ref.No.
                          </th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            ValueDt
                          </th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Withdrawal
                          </th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Deposit
                          </th>
                          <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredTransactions().map((transaction, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-2 py-3 text-sm text-gray-900">
                              {transaction.date}
                            </td>
                            <td className="px-2 py-3 text-sm text-gray-900">
                              {transaction.narration || transaction.description || ''}
                            </td>
                            <td className="px-2 py-3 text-sm text-gray-600">
                              {transaction.chqRefNo || '-'}
                            </td>
                            <td className="px-2 py-3 text-sm text-gray-600">
                              {transaction.valueDt || transaction.date}
                            </td>
                            <td className="px-2 py-3 text-sm text-red-600">
                              {transaction.withdrawalAmt ? formatCurrency(transaction.withdrawalAmt) : '-'}
                            </td>
                            <td className="px-2 py-3 text-sm text-green-600">
                              {transaction.depositAmt ? formatCurrency(transaction.depositAmt) : '-'}
                            </td>
                            <td className="px-2 py-3 text-sm text-gray-900">
                              {transaction.closingBalance ? formatCurrency(transaction.closingBalance) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Narration
                      </th>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Ref.No.
                      </th>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        ValueDt
                      </th>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Withdrawal
                      </th>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Deposit
                      </th>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.transactions.slice(0, data.transactions.length <= 100 ? data.transactions.length : 50).map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 py-3 text-sm text-gray-900">
                          {transaction.date}
                        </td>
                        <td className="px-2 py-3 text-sm text-gray-900">
                          {transaction.narration || transaction.description || ''}
                        </td>
                        <td className="px-2 py-3 text-sm text-gray-600">
                          {transaction.chqRefNo || '-'}
                        </td>
                        <td className="px-2 py-3 text-sm text-gray-600">
                          {transaction.valueDt || transaction.date}
                        </td>
                        <td className="px-2 py-3 text-sm text-red-600">
                          {transaction.withdrawalAmt ? formatCurrency(transaction.withdrawalAmt) : '-'}
                        </td>
                        <td className="px-2 py-3 text-sm text-green-600">
                          {transaction.depositAmt ? formatCurrency(transaction.depositAmt) : '-'}
                        </td>
                        <td className="px-2 py-3 text-sm text-gray-900">
                          {transaction.closingBalance ? formatCurrency(transaction.closingBalance) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.transactions.length > 100 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-sm text-blue-800 mb-2">
                    Showing first 50 transactions. Your file contains {data.transactions.length} transactions.
                  </p>
                  <p className="text-sm text-blue-600">
                    Export to CSV or Excel to view all transactions.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="space-y-4">
              {Object.entries(data.monthlyBreakdown).map(([month, stats]) => (
                <div key={month} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{month}</h3>
                    <span className={`text-lg font-semibold ${stats.credits - stats.debits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.credits - stats.debits)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Credits</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(stats.credits)}</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Debits</p>
                      <p className="text-lg font-semibold text-red-600">{formatCurrency(stats.debits)}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Transactions</p>
                      <p className="text-lg font-semibold text-blue-600">{stats.count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatementAnalyzer 