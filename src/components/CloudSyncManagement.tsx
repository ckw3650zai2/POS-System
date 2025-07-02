import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Cloud, 
  Database, 
  RefreshCw, 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  syncToCloud,
  getAllLocalData,
  getCloudSyncStatus
} from '../utils/storage';
import { 
  getSyncStatus, 
  syncAllData, 
  pullDataFromCloud 
} from '../utils/supabase';

const CloudSyncManagement: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());

  useEffect(() => {
    // 定期更新同步状态
    const interval = setInterval(() => {
      setSyncStatus(getSyncStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUploadToCloud = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!syncStatus.isOnline) {
      showMessage('error', '网络连接不可用，无法上传到云端');
      return;
    }

    setIsUploading(true);
    console.log('开始上传到Supabase云端...');

    try {
      const result = await syncAllData();
      
      if (result.success) {
        showMessage('success', `数据上传成功: ${result.message}`);
        setSyncStatus(getSyncStatus());
        
        // 计算统计信息
        const localData = getAllLocalData();
        setSyncStats({
          orders: { uploaded: localData.orders.length },
          drinks: { uploaded: localData.drinks.length },
          costs: { uploaded: localData.costs.length },
          extraIncomes: { uploaded: localData.extraIncomes.length }
        });
        
        console.log('数据上传成功');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('上传失败:', error);
      showMessage('error', `上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadFromCloud = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!syncStatus.isOnline) {
      showMessage('error', '网络连接不可用，无法从云端下载');
      return;
    }

    setIsDownloading(true);
    console.log('开始从Supabase云端下载...');

    try {
      const result = await pullDataFromCloud();
      
      if (result.success) {
        showMessage('success', '数据下载成功，正在刷新页面...');
        setSyncStatus(getSyncStatus());
        console.log('数据下载成功');
        
        // 延迟刷新页面，让用户看到成功消息
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('下载失败:', error);
      showMessage('error', `下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFullSync = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!syncStatus.isOnline) {
      showMessage('error', '网络连接不可用，无法进行完整同步');
      return;
    }

    setIsSyncing(true);
    console.log('开始完整同步...');

    try {
      // 先上传本地数据到云端
      const uploadResult = await syncAllData();
      
      if (!uploadResult.success) {
        throw new Error(`上传失败: ${uploadResult.message}`);
      }
      
      // 再从云端拉取最新数据
      const downloadResult = await pullDataFromCloud();
      
      if (!downloadResult.success) {
        throw new Error(`下载失败: ${downloadResult.message}`);
      }
      
      showMessage('success', '完整同步成功');
      setSyncStatus(getSyncStatus());
      
      // 计算统计信息
      const localData = getAllLocalData();
      setSyncStats({
        orders: { uploaded: localData.orders.length },
        drinks: { uploaded: localData.drinks.length },
        costs: { uploaded: localData.costs.length },
        extraIncomes: { uploaded: localData.extraIncomes.length }
      });
      
      console.log('完整同步成功');
      
      // 延迟刷新页面
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('完整同步失败:', error);
      showMessage('error', `完整同步失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const getConnectionStatus = () => {
    if (!syncStatus.isOnline) {
      return { icon: WifiOff, text: '离线', color: 'text-red-500' };
    }
    return { icon: Wifi, text: '在线', color: 'text-green-500' };
  };

  const getLastSyncStatus = () => {
    if (!syncStatus.lastSync) {
      return { icon: AlertTriangle, text: '未同步', color: 'text-yellow-500' };
    }
    return { icon: CheckCircle, text: '已同步', color: 'text-green-500' };
  };

  const connectionStatus = getConnectionStatus();
  const lastSyncStatus = getLastSyncStatus();

  return (
    <div className="space-y-6">
      {/* 状态概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>Supabase云端同步状态</span>
          </CardTitle>
          <CardDescription>
            基于Supabase的实时云端数据同步服务
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>网络连接状态</span>
            <Badge variant="secondary" className={connectionStatus.color}>
              <connectionStatus.icon className="h-4 w-4 mr-1" />
              {connectionStatus.text}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>同步状态</span>
            <Badge variant="secondary" className={lastSyncStatus.color}>
              <lastSyncStatus.icon className="h-4 w-4 mr-1" />
              {lastSyncStatus.text}
            </Badge>
          </div>
          {syncStatus.syncing && (
            <div className="flex justify-between items-center">
              <span>同步进度</span>
              <Badge variant="secondary" className="text-blue-500">
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                同步中...
              </Badge>
            </div>
          )}
          {syncStatus.lastSync && (
            <div className="flex justify-between items-center">
              <span>最后同步时间</span>
              <span className="text-sm text-gray-600">
                {new Date(syncStatus.lastSync).toLocaleString('zh-CN')}
              </span>
            </div>
          )}
          {syncStatus.error && (
            <div className="flex justify-between items-center">
              <span>同步错误</span>
              <span className="text-sm text-red-600 max-w-48 truncate" title={syncStatus.error}>
                {syncStatus.error}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supabase服务信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Supabase云端服务</span>
          </CardTitle>
          <CardDescription>
            已配置Supabase云端数据库，支持实时数据同步和离线缓存
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">服务特性</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 实时数据同步</li>
                <li>• 离线数据缓存</li>
                <li>• 自动故障恢复</li>
                <li>• 数据冲突处理</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">同步策略</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 数据变更时自动同步</li>
                <li>• 每5分钟定期同步</li>
                <li>• 网络恢复时自动同步</li>
                <li>• 手动同步支持</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 同步操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 完整同步 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">双向同步</CardTitle>
            <CardDescription>
              上传本地数据并下载云端最新数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleFullSync} 
              disabled={isSyncing || isUploading || isDownloading || !syncStatus.isOnline}
              className="w-full"
              type="button"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  同步中...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  双向同步
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 手动备份 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">手动备份</CardTitle>
            <CardDescription>
              立即将本地数据备份到Supabase云端
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleUploadToCloud} 
              disabled={isUploading || isSyncing || isDownloading || !syncStatus.isOnline}
              variant="outline"
              className="w-full"
              type="button"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  备份中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  手动备份
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 恢复数据 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">恢复数据</CardTitle>
            <CardDescription>
              从Supabase云端恢复数据到本地
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleDownloadFromCloud} 
              disabled={isDownloading || isSyncing || isUploading || !syncStatus.isOnline}
              variant="outline"
              className="w-full"
              type="button"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  恢复中...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  恢复数据
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 本地数据统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">本地数据统计</CardTitle>
            <CardDescription>
              当前本地存储的数据概览
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const localData = getAllLocalData();
                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>订单数量:</span>
                      <span className="font-medium">{localData.orders.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>饮品种类:</span>
                      <span className="font-medium">{localData.drinks.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>成本记录:</span>
                      <span className="font-medium">{localData.costs.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>额外收入:</span>
                      <span className="font-medium">{localData.extraIncomes.length}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 同步统计 */}
      {syncStats && (
        <Card>
          <CardHeader>
            <CardTitle>最近同步统计</CardTitle>
            <CardDescription>
              显示最近一次手动同步操作的数据统计
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {syncStats.orders?.uploaded || 0}
                </div>
                <div className="text-sm text-gray-600">订单同步</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {syncStats.drinks?.uploaded || 0}
                </div>
                <div className="text-sm text-gray-600">饮品同步</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {syncStats.costs?.uploaded || 0}
                </div>
                <div className="text-sm text-gray-600">成本同步</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {syncStats.extraIncomes?.uploaded || 0}
                </div>
                <div className="text-sm text-gray-600">收入同步</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 消息提示 */}
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500' : 
                         message.type === 'success' ? 'border-green-500' : 'border-blue-500'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 
                                      message.type === 'success' ? 'text-green-700' : 'text-blue-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CloudSyncManagement;
