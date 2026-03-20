// src/pages/SettingsPage.js - Backend API version
import React, { useState, useEffect } from 'react';
import FaceRegistration from '../components/FaceRegistration';
import api from '../services/api';
import { UserPlus, Bell, Shield, Trash2, Users, Database, Camera, Wifi } from 'lucide-react';

const ToggleSwitch = ({ label, enabled, setEnabled }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-700">{label}</span>
    <div
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      }`}
      onClick={() => setEnabled(!enabled)}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
        enabled ? 'translate-x-6' : ''
      }`}></div>
    </div>
  </div>
);

const RegisteredUserCard = ({ user, onRemove }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="text-blue-600" size={24} />
        </div>
        <div className="ml-3">
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-600">{user.source || 'upload'}</p>
          <p className="text-xs text-gray-500">
            ID: {user.id} | Registered: {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(user.id, user.name)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove user"
      >
        <Trash2 size={20} />
      </button>
    </div>
  </div>
);

const SettingsPage = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cameraSource, setCameraSource] = useState('browser');
  const [cameraUrl, setCameraUrl] = useState('');
  const [cameraTestStatus, setCameraTestStatus] = useState('');
  const [settings, setSettings] = useState({
    notifications: {
      unauthorized: true,
      system_errors: true,
      daily_summary: false,
    },
    detection: {
      confidence_threshold: 60,
      auto_save_logs: true,
    }
  });

  useEffect(() => {
    loadRegisteredUsers();
    loadSettings();
    const storedSource = localStorage.getItem('cameraSource') || 'browser';
    const storedUrl = localStorage.getItem('cameraUrl') || '';
    setCameraSource(storedSource);
    setCameraUrl(storedUrl);
  }, []);

  const loadRegisteredUsers = async () => {
    try {
      setLoading(true);
      const users = await api.listFaces();
      setRegisteredUsers(users);
    } catch (error) {
      console.error('Error loading registered users:', error);
      setRegisteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('appSettings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = (newSettings) => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleCameraSourceChange = (source) => {
    setCameraSource(source);
    localStorage.setItem('cameraSource', source);
  };

  const handleCameraUrlChange = (url) => {
    setCameraUrl(url);
    localStorage.setItem('cameraUrl', url);
  };

  const testCameraUrl = () => {
    if (!cameraUrl.trim()) {
      setCameraTestStatus('error');
      return;
    }
    setCameraTestStatus('testing');
    const img = new Image();
    img.onload = () => setCameraTestStatus('success');
    img.onerror = () => setCameraTestStatus('error');
    img.src = cameraUrl;
    setTimeout(() => {
      setCameraTestStatus((prev) => prev === 'testing' ? 'error' : prev);
    }, 5000);
  };

  const handleNotificationChange = (key) => {
    const updated = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    };
    saveSettings(updated);
  };

  const handleRemoveUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) {
      try {
        await api.deleteFace(id);
        await loadRegisteredUsers();
        alert(`${name} has been removed successfully.`);
      } catch (error) {
        console.error('Error removing user:', error);
        alert('Failed to remove user. Please try again.');
      }
    }
  };

  const handleRegistrationComplete = async (data) => {
    await loadRegisteredUsers();
    setShowRegistration(false);
    alert(`Successfully registered ${data.name}!`);
  };

  const clearAllData = () => {
    if (window.confirm('This will clear local logs and alert data. Registered faces in the database will remain. Are you sure?')) {
      localStorage.removeItem('recognitionLogs');
      localStorage.removeItem('recognitionHistory');
      localStorage.removeItem('alerts');
      alert('Local data has been cleared. Registered faces are stored on the server.');
    }
  };

  const exportData = () => {
    try {
      const logs = JSON.parse(localStorage.getItem('recognitionLogs') || '[]');
      const data = {
        registeredUsers: registeredUsers,
        logs: logs,
        settings: settings,
        exportDate: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `face-recognition-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  if (showRegistration) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <FaceRegistration
          onRegistrationComplete={handleRegistrationComplete}
          onClose={() => setShowRegistration(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-blue-200 mb-6 transition-colors hover:text-blue-600 dark:hover:text-blue-400">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-black transition-colors hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
              <Users className="mr-2" />
              Registered Users ({registeredUsers.length})
            </h2>
            <button
              onClick={() => setShowRegistration(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <UserPlus className="mr-2" size={20} />
              Register New Face
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-gray-500">Loading registered users from server...</p>
            </div>
          ) : registeredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registeredUsers.map((user) => (
                <RegisteredUserCard
                  key={user.id}
                  user={user}
                  onRemove={handleRemoveUser}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Users className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">No registered users yet</p>
              <p className="text-sm text-gray-500 mt-2">Click "Register New Face" to add your first user</p>
            </div>
          )}
        </div>

        {/* Camera Source Settings */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-black mb-4 transition-colors hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
            <Camera className="mr-2" />
            Camera Source
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="cameraSource"
                  value="browser"
                  checked={cameraSource === 'browser'}
                  onChange={() => handleCameraSourceChange('browser')}
                  className="mr-2 text-blue-600"
                />
                <Camera size={18} className="mr-1 text-gray-600" />
                <span className="text-gray-700">Browser Webcam</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="cameraSource"
                  value="ip"
                  checked={cameraSource === 'ip'}
                  onChange={() => handleCameraSourceChange('ip')}
                  className="mr-2 text-blue-600"
                />
                <Wifi size={18} className="mr-1 text-gray-600" />
                <span className="text-gray-700">IP Camera / Raspberry Pi</span>
              </label>
            </div>

            {cameraSource === 'ip' && (
              <div className="border-t pt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Camera Stream URL
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={cameraUrl}
                      onChange={(e) => handleCameraUrlChange(e.target.value)}
                      placeholder="http://192.168.1.100:8080/?action=stream"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={testCameraUrl}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Test
                    </button>
                  </div>
                </div>
                {cameraTestStatus === 'testing' && (
                  <p className="text-sm text-blue-600">Testing connection...</p>
                )}
                {cameraTestStatus === 'success' && (
                  <p className="text-sm text-green-600">Camera stream is reachable!</p>
                )}
                {cameraTestStatus === 'error' && (
                  <p className="text-sm text-red-600">Could not reach camera. Check the URL and ensure the device is on the same network.</p>
                )}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-sm text-blue-800 font-medium">Supported stream URLs:</p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
                    <li>Raspberry Pi (mjpg-streamer): http://pi-ip:8080/?action=stream</li>
                    <li>Raspberry Pi (picamera2 + Flask): http://pi-ip:5000/video_feed</li>
                    <li>IP Webcam (Android): http://phone-ip:8080/video</li>
                    <li>DroidCam: http://phone-ip:4747/video</li>
                    <li>Any MJPEG stream URL</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-black mb-4 transition-colors hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
            <Bell className="mr-2" />
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <ToggleSwitch
              label="Unauthorized Detections"
              enabled={settings.notifications.unauthorized}
              setEnabled={() => handleNotificationChange('unauthorized')}
            />
            <ToggleSwitch
              label="System Errors"
              enabled={settings.notifications.system_errors}
              setEnabled={() => handleNotificationChange('system_errors')}
            />
            <ToggleSwitch
              label="Daily Summary"
              enabled={settings.notifications.daily_summary}
              setEnabled={() => handleNotificationChange('daily_summary')}
            />
          </div>
        </div>

        {/* Detection Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-black mb-4 transition-colors hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
            <Shield className="mr-2" />
            Detection Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Threshold: {settings.detection.confidence_threshold}%
              </label>
              <input
                type="range"
                min="40"
                max="90"
                value={settings.detection.confidence_threshold}
                onChange={(e) => saveSettings({
                  ...settings,
                  detection: {
                    ...settings.detection,
                    confidence_threshold: parseInt(e.target.value)
                  }
                })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher values = more strict matching (fewer false positives)
              </p>
            </div>
            <ToggleSwitch
              label="Auto-save Recognition Logs"
              enabled={settings.detection.auto_save_logs}
              setEnabled={() => saveSettings({
                ...settings,
                detection: {
                  ...settings.detection,
                  auto_save_logs: !settings.detection.auto_save_logs
                }
              })}
            />
          </div>
        </div>

        {/* Data Management Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-black mb-4 transition-colors hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
            <Database className="mr-2" />
            Data Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={exportData}
              className="py-3 px-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Export Backup
            </button>
            <button
              onClick={clearAllData}
              className="py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
            >
              <Trash2 className="mr-2" size={18} />
              Clear Local Logs
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            <strong>Note:</strong> Registered faces are stored on the server (PostgreSQL database).
            Local logs and alerts are stored in your browser.
          </p>
        </div>

        {/* System Info */}
        <div className="lg:col-span-2 bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">System Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Registered Users</p>
              <p className="text-2xl font-bold text-gray-800">{registeredUsers.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Storage Backend</p>
              <p className="text-2xl font-bold text-gray-800">PostgreSQL</p>
            </div>
            <div>
              <p className="text-gray-600">ML Backend</p>
              <p className="text-2xl font-bold text-gray-800">SFace + MediaPipe</p>
            </div>
            <div>
              <p className="text-gray-600">Camera Source</p>
              <p className="text-2xl font-bold text-gray-800">{cameraSource === 'ip' ? 'IP Camera' : 'Browser'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
