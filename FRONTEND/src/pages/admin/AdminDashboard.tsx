import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  Plus,
  Shield,
  TrendingUp,
  Eye
} from 'lucide-react';
import { modelsApi, contentApi, reportsApi } from '../../services/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalModels: 0,
    totalContent: 0,
    pendingReports: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    try {
      const [modelsRes, contentRes, reportsRes] = await Promise.all([
        modelsApi.getAll({ limit: 1 }),
        contentApi.getAll({ limit: 1 }),
        reportsApi.getAll({ limit: 1, status: 'pending' })
      ]);

      setStats({
        totalModels: modelsRes.pagination?.totalItems || 0,
        totalContent: contentRes.pagination?.totalItems || 0,
        pendingReports: reportsRes.pagination?.totalItems || 0,
        totalViews: 0 // Pode ser calculado se necessário
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <main className="pt-20 min-h-screen bg-dark-300">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-primary-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400">Manage your platform content and users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Models"
            value={stats.totalModels}
            icon={<Users className="w-6 h-6" />}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Total Content"
            value={stats.totalContent}
            icon={<FileText className="w-6 h-6" />}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Pending Reports"
            value={stats.pendingReports}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
            loading={loading}
          />
          <StatCard
            title="Total Views"
            value={stats.totalViews}
            icon={<Eye className="w-6 h-6" />}
            color="purple"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            title="Manage Models"
            description="Create, edit and manage model profiles"
            icon={<Users className="w-8 h-8" />}
            link="/admin/models"
            color="blue"
          />
          <ActionCard
            title="Manage Content"
            description="Add and organize content for models"
            icon={<FileText className="w-8 h-8" />}
            link="/admin/content"
            color="green"
          />
          <ActionCard
            title="Review Reports"
            description="Handle user reports and moderation"
            icon={<AlertTriangle className="w-8 h-8" />}
            link="/admin/reports"
            color="red"
          />
        </div>
      </div>
    </main>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple';
  loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  return (
    <div className={`bg-dark-200 rounded-xl p-6 border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <TrendingUp className="w-4 h-4 text-gray-400" />
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        {loading ? (
          <div className="h-8 bg-dark-300 rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: 'blue' | 'green' | 'red';
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, link, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
  };

  return (
    <Link
      to={link}
      className={`block bg-dark-200 rounded-xl p-6 border transition-all duration-200 hover:scale-105 ${colorClasses[color]}`}
    >
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-lg mr-4 ${colorClasses[color]}`}>
          {icon}
        </div>
        <Plus className="w-5 h-5 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </Link>
  );
};

export default AdminDashboard;