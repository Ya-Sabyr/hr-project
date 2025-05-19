'use client'

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, FileText, Download, Eye, EyeOff } from 'lucide-react';
import axiosMultipartInstance from '../../data/axiosMultipartInstance'

interface ApplyResult {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  experience_time: number;
  profession: string;
  languages: string;
  education: string;
  skills: string;
  awards: string;
  projects: string;
  courses: string;
  summary: string;
  grade: string;
  min_salary: number;
  max_salary: number;
  resume_link: string;
  matching_score: number;
  reason: string;
  resume_path: string;
  keywords: string;
}

export default function Apply() {
  const { id: vacancyId } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);

  console.log('Rendering Apply component with vacancyId:', vacancyId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('File selected:', selectedFile.name);
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');

    if (!file || !vacancyId) {
      console.error('File or vacancyId missing');
      setError('Пожалуйста, выберите файл резюме');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    console.log('Sending request to process resume');
    try {
      const response = await axiosMultipartInstance.post(
        `/api/v1/resume/process?vacancy_id=${vacancyId}`,
        formData
      );
      console.log('Resume processed successfully:', response.data);
      setResult(response.data);
    } catch (err: any) {
      console.error('Error processing resume:', err);
      setError(
        err.response?.data?.detail || 
        'Произошла ошибка при обработке резюме. Пожалуйста, попробуйте снова.'
      );
    } finally {
      setIsLoading(false);
      console.log('Resume processing completed');
    }
  };

  const handleDownload = async () => {
    if (!result || !result.resume_path) {
      console.error('No resume path available for download');
      return;
    }

    setIsDownloading(true);
    try {
      const filename = result.resume_path.split('/').pop();
      if (!filename) {
        throw new Error('Invalid filename');
      }

      const response = await axiosMultipartInstance.get(`/api/v1/resume/download/${filename}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('Resume downloaded successfully');
    } catch (err) {
      console.error('Error downloading resume:', err);
      setError('Произошла ошибка при скачивании резюме. Пожалуйста, попробуйте снова.');
    } finally {
      setIsDownloading(false);
    }
  };

  const togglePdfView = () => {
    setShowPdf(!showPdf);
  };

  console.log('Current state:', { file, isLoading, isDownloading, error, result, showPdf });

  return (
    <div className="container mx-auto mt-8 max-w-4xl px-4">
      <h1 className="text-3xl font-bold mb-6">Подать заявку</h1>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <label 
            htmlFor="resume" 
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <FileText size={48} className="text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">
              {file ? file.name : 'Загрузить резюме (PDF)'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Максимальный размер: 10MB
            </span>
          </label>
          <input
            type="file"
            id="resume"
            accept=".pdf"
            onChange={handleFileChange}
            required
            className="hidden"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center gap-2"
          disabled={isLoading || !file}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Обработка...
            </>
          ) : (
            'Отправить резюме'
          )}
        </button>
      </form>

      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Результат анализа</h2>
          <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700">Личная информация</h3>
                <p className="text-lg font-medium">{result.first_name} {result.last_name}</p>
                <p className="text-gray-600">{result.email}</p>
                <p className="text-gray-600">{result.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Профессиональная информация</h3>
                <p className="text-gray-600">Опыт: {result.experience_time} лет</p>
                <p className="text-gray-600">Уровень: {result.grade}</p>
                <p className="text-gray-600">Профессия: {result.profession}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-700 mb-2">Навыки и квалификация</h3>
              <p className="text-gray-600"><strong>Языки:</strong> {result.languages}</p>
              <p className="text-gray-600"><strong>Образование:</strong> {result.education}</p>
              <p className="text-gray-600"><strong>Навыки:</strong> {result.skills}</p>
              <p className="text-gray-600"><strong>Ключевые слова:</strong> {result.keywords}</p>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-700 mb-2">Достижения и проекты</h3>
              <p className="text-gray-600"><strong>Награды:</strong> {result.awards}</p>
              <p className="text-gray-600"><strong>Проекты:</strong> {result.projects}</p>
              <p className="text-gray-600"><strong>Курсы:</strong> {result.courses}</p>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-700 mb-2">Дополнительная информация</h3>
              <p className="text-gray-600"><strong>Краткое описание:</strong> {result.summary}</p>
              <p className="text-gray-600">
                <strong>Ожидаемая зарплата:</strong> {result.min_salary.toLocaleString()} - {result.max_salary.toLocaleString()} тенге
              </p>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-700 mb-2">Оценка соответствия</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${result.matching_score}%` }}
                  />
                </div>
                <span className="font-medium">{result.matching_score}%</span>
              </div>
              <p className="mt-2 text-gray-600">{result.reason}</p>
            </div>

            <div className="pt-4 border-t space-y-4">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300 flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Скачивание...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Скачать результат
                  </>
                )}
              </button>

            {/*   <button
                onClick={togglePdfView}
                className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {showPdf ? (
                  <>
                    <EyeOff size={20} />
                    Скрыть PDF
                  </>
                ) : (
                  <>
                    <Eye size={20} />
                    Показать PDF
                  </>
                )}
              </button>

              {showPdf && (
                <div className="w-full h-[600px] border border-gray-300 rounded-md overflow-hidden">
                  <iframe
                    src={`/api/v1/resume/download/${result.resume_path.split('/').pop()}#toolbar=0`}
                    className="w-full h-full"
                    title="Resume PDF"
                  />
                </div>
              )} */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}