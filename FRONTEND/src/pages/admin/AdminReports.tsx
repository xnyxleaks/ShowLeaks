import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { reportsApi } from '../../services/api';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import type { Report } from '../../types';

const AdminReports: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    loadReports();
  }, [user, navigate, currentPage, filter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getAll({
        page: currentPage,
        limit: 20,
        status: filter === 'all' ? undefined : filter
      });
      setReports(response.reports || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: number, status: string, adminNotes?: string) => {
    try {
      await reportsApi.updateStatus(reportId, status, adminNotes);
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Error updating report');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      broken_link: 'Broken Link',
      child_content: 'Child Content',
      no_consent: 'No Consent',
      spam: 'Spam',
      inappropriate: 'Inappropriate',
      other: 'Other'
    };
    return labels[reason as keyof typeof labels] || reason;
  };

  if (!user?.isAdmin) return null;

  return (
    <main className="pt-20 min-h-screen bg-dark-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin')}
              className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-white">Review Reports</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['all', 'pending', 'reviewed', 'resolved', 'dismissed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  filter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4 mb-8">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-dark-200 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-dark-300 rounded w-1/4 mb-2" />
                <div className="h-3 bg-dark-300 rounded w-3/4 mb-4" />
                <div className="h-8 bg-dark-300 rounded w-32" />
              </div>
            ))
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onUpdateStatus={updateReportStatus}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No reports found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

interface ReportCardProps {
  report: Report;
  onUpdateStatus: (reportId: number, status: string, adminNotes?: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onUpdateStatus }) => {
  const [showActions, setShowActions] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      broken_link: 'Broken Link',
      child_content: 'Child Content',
      no_consent: 'No Consent',
      spam: 'Spam',
      inappropriate: 'Inappropriate',
      other: 'Other'
    };
    return labels[reason as keyof typeof labels] || reason;
  };

  return (
    <div className="bg-dark-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {getStatusIcon(report.status)}
            <span className="ml-2 text-sm font-medium text-gray-300 capitalize">
              {report.status}
            </span>
            <span className="ml-4 px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full">
              {getReasonLabel(report.reason)}
            </span>
          </div>
          
          <h3 className="text-white font-semibold mb-2">
            Report #{report.id}
          </h3>
          
          {report.description && (
            <p className="text-gray-300 mb-3">{report.description}</p>
          )}
          
          <div className="text-sm text-gray-400">
            <p>Reported: {new Date(report.createdAt).toLocaleString()}</p>
            {report.ipAddress && <p>IP: {report.ipAddress}</p>}
          </div>
        </div>
        
        {report.status === 'pending' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActions(!showActions)}
          >
            Actions
          </Button>
        )}
      </div>

      {showActions && (
        <div className="border-t border-dark-100 pt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Add notes about this report..."
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onUpdateStatus(report.id, 'resolved', adminNotes)}
            >
              Resolve
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUpdateStatus(report.id, 'reviewed', adminNotes)}
            >
              Mark Reviewed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus(report.id, 'dismissed', adminNotes)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;