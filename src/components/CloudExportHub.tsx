'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';
import QRCode from 'react-qr-code';

interface CloudExportHubProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

type ViewMode = 'templates' | 'integrations' | 'history' | 'sharing' | 'schedule';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  useCase: string;
  fields: string[];
  format: 'pdf' | 'csv' | 'xlsx';
}

interface CloudService {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
}

interface ExportHistory {
  id: string;
  template: string;
  destination: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
  recordCount: number;
}

interface ShareableLink {
  id: string;
  name: string;
  url: string;
  expiresAt: string;
  accessCount: number;
  isActive: boolean;
}

export function CloudExportHub({ isOpen, onClose }: CloudExportHubProps) {
  const [currentView, setCurrentView] = useState<ViewMode>('templates');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [shareableLinks, setShareableLinks] = useState<ShareableLink[]>([]);
  const [showQR, setShowQR] = useState<string | null>(null);

  const exportTemplates: ExportTemplate[] = [
    {
      id: 'tax-report',
      name: 'Tax Report',
      description: 'Comprehensive report for tax filing with categorized expenses',
      icon: '📋',
      useCase: 'Annual tax preparation',
      fields: ['Date', 'Amount', 'Category', 'Description', 'Tax Category'],
      format: 'pdf'
    },
    {
      id: 'monthly-summary',
      name: 'Monthly Summary',
      description: 'Executive summary with charts and category breakdowns',
      icon: '📊',
      useCase: 'Monthly business review',
      fields: ['Category', 'Total Amount', 'Transaction Count', 'Average'],
      format: 'pdf'
    },
    {
      id: 'expense-data',
      name: 'Raw Data Export',
      description: 'Complete dataset for analysis and integration',
      icon: '📈',
      useCase: 'Data analysis & BI tools',
      fields: ['All fields', 'Timestamps', 'Metadata'],
      format: 'csv'
    },
    {
      id: 'budget-analysis',
      name: 'Budget Analysis',
      description: 'Spending trends and budget variance analysis',
      icon: '💰',
      useCase: 'Financial planning',
      fields: ['Category', 'Budgeted', 'Actual', 'Variance', 'Trend'],
      format: 'xlsx'
    },
    {
      id: 'receipt-backup',
      name: 'Receipt Backup',
      description: 'Simplified format for receipt management systems',
      icon: '🧾',
      useCase: 'Receipt organization',
      fields: ['Date', 'Vendor', 'Amount', 'Category'],
      format: 'csv'
    }
  ];

  const cloudServices: CloudService[] = [
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      icon: '📗',
      connected: true,
      lastSync: '2 hours ago',
      status: 'connected'
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      connected: true,
      lastSync: '1 day ago',
      status: 'connected'
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: '☁️',
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'email',
      name: 'Email Export',
      icon: '📧',
      connected: true,
      lastSync: '30 min ago',
      status: 'connected'
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '💬',
      connected: false,
      status: 'disconnected'
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      icon: '📊',
      connected: true,
      lastSync: '3 hours ago',
      status: 'syncing'
    }
  ];

  const exportHistory: ExportHistory[] = [
    {
      id: '1',
      template: 'Monthly Summary',
      destination: 'Google Sheets',
      timestamp: '2025-08-20 14:30',
      status: 'completed',
      recordCount: 45
    },
    {
      id: '2',
      template: 'Tax Report',
      destination: 'Email (john@company.com)',
      timestamp: '2025-08-19 09:15',
      status: 'completed',
      recordCount: 128
    },
    {
      id: '3',
      template: 'Budget Analysis',
      destination: 'Dropbox',
      timestamp: '2025-08-18 16:45',
      status: 'processing',
      recordCount: 67
    }
  ];

  // Generate sample shareable link
  useEffect(() => {
    if (shareableLinks.length === 0) {
      setShareableLinks([
        {
          id: '1',
          name: 'August Expenses - Public View',
          url: 'https://expensetracker.app/shared/aug-2025-abc123',
          expiresAt: '2025-09-20',
          accessCount: 12,
          isActive: true
        }
      ]);
    }
  }, [shareableLinks.length]);

  const handleTemplateExport = async (templateId: string, serviceId: string) => {
    setIsProcessing(true);
    setSelectedTemplate(templateId);
    setSelectedService(serviceId);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setSelectedTemplate(null);
      setSelectedService(null);
      // Show success notification in real app
    }, 2000);
  };

  const generateShareableLink = () => {
    const newLink: ShareableLink = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Expense Report - ${new Date().toLocaleDateString()}`,
      url: `https://expensetracker.app/shared/${Math.random().toString(36).substr(2, 8)}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      accessCount: 0,
      isActive: true
    };
    setShareableLinks([newLink, ...shareableLinks]);
  };

  const getStatusIcon = (status: CloudService['status']) => {
    switch (status) {
      case 'connected': return '✅';
      case 'syncing': return '🔄';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: CloudService['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'syncing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex h-full">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Sidebar Navigation */}
        <div className="relative w-80 bg-gray-50 border-r flex flex-col">
          <div className="p-6 border-b bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Export Hub</h1>
                <p className="text-sm text-gray-600">Cloud integrations & sharing</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'templates' as ViewMode, name: 'Export Templates', icon: '📋', badge: exportTemplates.length },
              { id: 'integrations' as ViewMode, name: 'Cloud Services', icon: '☁️', badge: cloudServices.filter(s => s.connected).length },
              { id: 'sharing' as ViewMode, name: 'Share & Collaborate', icon: '🔗', badge: shareableLinks.length },
              { id: 'schedule' as ViewMode, name: 'Automated Exports', icon: '⏰', badge: 2 },
              { id: 'history' as ViewMode, name: 'Export History', icon: '📜', badge: exportHistory.length }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  currentView === item.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.badge}
                </span>
              </button>
            ))}
          </nav>

          {/* Cloud Status */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cloud Status</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">All Systems Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-auto p-8">
            {/* Export Templates View */}
            {currentView === 'templates' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Templates</h2>
                  <p className="text-gray-600">Pre-configured export formats for different use cases</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {exportTemplates.map(template => (
                    <div key={template.id} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <span className="text-2xl">{template.icon}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <p className="text-sm text-blue-600">{template.useCase}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full uppercase">
                          {template.format}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>

                      <div className="mb-4">
                        <span className="text-xs text-gray-500 mb-2 block">INCLUDED FIELDS</span>
                        <div className="flex flex-wrap gap-1">
                          {template.fields.slice(0, 3).map(field => (
                            <span key={field} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                              {field}
                            </span>
                          ))}
                          {template.fields.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                              +{template.fields.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {cloudServices.filter(s => s.connected).map(service => (
                          <button
                            key={service.id}
                            onClick={() => handleTemplateExport(template.id, service.id)}
                            disabled={isProcessing}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <div className="flex items-center space-x-2">
                              <span>{service.icon}</span>
                              <span className="text-sm font-medium">Export to {service.name}</span>
                            </div>
                            {isProcessing && selectedTemplate === template.id && selectedService === service.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            ) : (
                              <span className="text-gray-400">→</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cloud Integrations View */}
            {currentView === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Cloud Integrations</h2>
                  <p className="text-gray-600">Connect with your favorite cloud services and tools</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cloudServices.map(service => (
                    <div key={service.id} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{service.icon}</span>
                          <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        </div>
                        <span className={`text-lg ${getStatusColor(service.status)}`}>
                          {getStatusIcon(service.status)}
                        </span>
                      </div>

                      {service.connected ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Status</span>
                            <span className={`font-medium ${getStatusColor(service.status)}`}>
                              {service.status === 'syncing' ? 'Syncing...' : 'Connected'}
                            </span>
                          </div>
                          {service.lastSync && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Last sync</span>
                              <span className="text-gray-900">{service.lastSync}</span>
                            </div>
                          )}
                          <div className="pt-2">
                            <button className="w-full bg-red-50 text-red-700 py-2 rounded-lg text-sm hover:bg-red-100 transition-colors">
                              Disconnect
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-600 text-sm mb-4">
                            Connect to enable automatic exports and sync
                          </p>
                          <button className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                            Connect {service.name}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Integration Benefits */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-8">
                  <h3 className="font-semibold text-gray-900 mb-2">🚀 Pro Integration Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span>✨</span>
                      <span>Automatic daily/weekly/monthly exports</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🔄</span>
                      <span>Real-time sync with cloud services</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📊</span>
                      <span>Custom formatting for each platform</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🔐</span>
                      <span>Secure OAuth connections</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sharing View */}
            {currentView === 'sharing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Share & Collaborate</h2>
                    <p className="text-gray-600">Create shareable links and QR codes for your expense data</p>
                  </div>
                  <button
                    onClick={generateShareableLink}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Create Link
                  </button>
                </div>

                <div className="space-y-4">
                  {shareableLinks.map(link => (
                    <div key={link.id} className="border rounded-xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{link.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              link.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {link.isActive ? 'Active' : 'Expired'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                            <span>Expires: {new Date(link.expiresAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{link.accessCount} views</span>
                          </div>

                          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                            <input
                              type="text"
                              value={link.url}
                              readOnly
                              className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                            />
                            <button 
                              onClick={() => navigator.clipboard.writeText(link.url)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => setShowQR(showQR === link.id ? null : link.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              QR Code
                            </button>
                          </div>
                        </div>
                      </div>

                      {showQR === link.id && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-center">
                            <div className="p-4 bg-white rounded-lg border">
                              <QRCode value={link.url} size={150} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Sharing Features */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">📋 Sharing Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600">🔗</span>
                      </div>
                      <h4 className="font-medium text-gray-900">Shareable Links</h4>
                      <p className="text-sm text-gray-600">Password-protected links with expiration</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-purple-600">📱</span>
                      </div>
                      <h4 className="font-medium text-gray-900">QR Codes</h4>
                      <p className="text-sm text-gray-600">Quick mobile access for reports</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-green-600">👥</span>
                      </div>
                      <h4 className="font-medium text-gray-900">Team Access</h4>
                      <p className="text-sm text-gray-600">Invite team members to view data</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Automated Exports View */}
            {currentView === 'schedule' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Automated Exports</h2>
                  <p className="text-gray-600">Set up recurring exports to keep your data synchronized</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">⚡</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Create New Automation</h3>
                      <p className="text-blue-700 text-sm">Set up automatic exports to run on a schedule</p>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    + New Automation
                  </button>
                </div>

                {/* Active Automations */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Active Automations</h3>
                  
                  <div className="border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">Weekly Tax Report</h4>
                        <p className="text-sm text-gray-600">Every Monday at 9:00 AM → Google Sheets</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                        <button className="text-gray-400 hover:text-gray-600">⋯</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Last run:</span>
                        <span className="ml-2 text-gray-900">3 days ago</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Next run:</span>
                        <span className="ml-2 text-gray-900">In 4 days</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">Monthly Summary Email</h4>
                        <p className="text-sm text-gray-600">1st of each month → Email to finance@company.com</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                        <button className="text-gray-400 hover:text-gray-600">⋯</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Last run:</span>
                        <span className="ml-2 text-gray-900">20 days ago</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Next run:</span>
                        <span className="ml-2 text-gray-900">Sep 1, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automation Benefits */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">⚡ Automation Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span>🔄</span>
                      <span>Never miss important deadlines</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📧</span>
                      <span>Automatic email notifications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📊</span>
                      <span>Keep stakeholders updated</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>⏰</span>
                      <span>Save hours of manual work</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Export History View */}
            {currentView === 'history' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Export History</h2>
                  <p className="text-gray-600">Track all your exports and their status</p>
                </div>

                <div className="space-y-4">
                  {exportHistory.map(export_ => (
                    <div key={export_.id} className="border rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{export_.template}</h3>
                          <p className="text-sm text-gray-600">to {export_.destination}</p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            export_.status === 'completed' 
                              ? 'bg-green-100 text-green-700'
                              : export_.status === 'processing'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {export_.status === 'completed' && '✅'}
                            {export_.status === 'processing' && '🔄'}
                            {export_.status === 'failed' && '❌'}
                            <span className="ml-1 capitalize">{export_.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <span>{export_.recordCount} records exported</span>
                        <span>{export_.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}