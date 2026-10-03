import React, { useState } from 'react';
import { Stack, PrimaryButton, MessageBar, MessageBarType, Spinner } from '@fluentui/react';
import { Upload } from '@fluentui/react-icons';
import './DocumentUpload.css';

interface DocumentUploadProps {
  onUpload?: (file: File) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: MessageBarType; text: string } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const file = files[0];

    if (!file) return;

    if (!validTypes.includes(file.type)) {
      setMessage({
        type: MessageBarType.error,
        text: '❌ صيغة الملف غير مدعومة. الصيغ المدعومة: صور، PDF، Excel',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({
        type: MessageBarType.error,
        text: '❌ حجم الملف أكبر من 10 ميجابايت',
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onUpload?.(file);
      setMessage({
        type: MessageBarType.success,
        text: `✅ تم تحميل ${file.name} بنجاح`,
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Stack className="document-upload" tokens={{ childrenGap: 10 }}>
      {message && <MessageBar messageBarType={message.type}>{message.text}</MessageBar>}

      <div
        className={`upload-area ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <Spinner label="جاري تحميل الملف..." />
        ) : (
          <>
            <div className="upload-icon">📄</div>
            <h3>اسحب الملف أو انقر لاختيار</h3>
            <p>صور، PDF، ملفات Excel</p>
            <input
              type="file"
              className="file-input"
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx"
            />
          </>
        )}
      </div>

      <div className="upload-info">
        <h4>الصيغ المدعومة:</h4>
        <ul>
          <li>🖼️ الصور: JPG, PNG</li>
          <li>📄 المستندات: PDF</li>
          <li>📊 جداول البيانات: Excel</li>
          <li>✍️ الصور المكتوبة بخط اليد: مدعومة</li>
        </ul>
      </div>
    </Stack>
  );
};
