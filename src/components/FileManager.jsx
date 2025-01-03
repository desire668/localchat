import React, { useState, useEffect } from 'react';

export function FileManager({ isOpen, onClose }) {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchFiles('');
    }
  }, [isOpen]);

  const fetchFiles = async (path) => {
    setLoading(true);
    try {
      const response = await fetch(`/files/list?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      setFiles(data.files);
      setCurrentPath(path);
      updateBreadcrumbs(path);
    } catch (error) {
      console.error('获取文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBreadcrumbs = (path) => {
    const parts = path.split('/').filter(Boolean);
    const crumbs = parts.map((part, index) => ({
      name: part,
      path: parts.slice(0, index + 1).join('/')
    }));
    setBreadcrumbs(crumbs);
  };

  const handleFileClick = (file) => {
    if (file.isDirectory) {
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      fetchFiles(newPath);
    } else {
      window.open(`/files/${currentPath}/${file.name}`, '_blank');
    }
  };

  const navigateTo = (path) => {
    fetchFiles(path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[800px] h-[600px] flex flex-col">
        {/* 标题栏 */}
        <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">群文件</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 面包屑导航 */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={() => navigateTo('')}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
          >
            根目录
          </button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <span className="text-gray-400">/</span>
              <button
                onClick={() => navigateTo(crumb.path)}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* 文件列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {files.map((file) => (
                <button
                  key={file.name}
                  onClick={() => handleFileClick(file)}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {file.isDirectory ? (
                    <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className="mt-2 text-sm text-center break-all dark:text-gray-200">
                    {file.name}
                  </span>
                  {!file.isDirectory && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 