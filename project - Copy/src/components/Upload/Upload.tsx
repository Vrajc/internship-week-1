import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, Camera, Image, X, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useClassification } from '../../contexts/ClassificationContext';
import toast from 'react-hot-toast';

interface ClassificationResult {
  objectName: string;
  category: string;
  hazardousElements: string[];
  confidence: number;
}

const Upload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { addClassification } = useClassification();

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const simulateClassification = async (): Promise<ClassificationResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = [
      {
        objectName: 'Laptop Battery',
        category: 'Battery',
        hazardousElements: ['Lead', 'Cadmium', 'Mercury'],
        confidence: 94.2
      },
      {
        objectName: 'Smartphone',
        category: 'Mobile Device',
        hazardousElements: ['Lithium', 'Cobalt', 'Rare Earth Elements'],
        confidence: 87.5
      },
      {
        objectName: 'Circuit Board',
        category: 'Electronic Component',
        hazardousElements: ['Lead', 'Mercury', 'Chromium', 'Brominated Flame Retardants'],
        confidence: 91.8
      },
      {
        objectName: 'CRT Monitor',
        category: 'Display',
        hazardousElements: ['Lead', 'Cadmium', 'Mercury', 'Phosphor'],
        confidence: 89.3
      }
    ];

    return mockResults[Math.floor(Math.random() * mockResults.length)];
  };

  const handleClassify = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    try {
      // Simulate image upload to Cloudinary
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockImageUrl = 'https://images.pexels.com/photos/442559/pexels-photo-442559.jpeg';
      
      setIsUploading(false);
      setIsClassifying(true);
      
      // Simulate AI classification
      const classificationResult = await simulateClassification();
      
      setResult(classificationResult);
      
      // Add to context
      addClassification({
        userId: user.id,
        imageUrl: mockImageUrl,
        objectName: classificationResult.objectName,
        category: classificationResult.category,
        hazardousElements: classificationResult.hazardousElements,
        confidence: classificationResult.confidence
      });
      
      toast.success('Classification completed successfully!');
    } catch (error) {
      toast.error('Classification failed. Please try again.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getHazardColor = (element: string) => {
    const colors: { [key: string]: string } = {
      'Lead': 'bg-red-100 text-red-800',
      'Mercury': 'bg-orange-100 text-orange-800',
      'Cadmium': 'bg-yellow-100 text-yellow-800',
      'Chromium': 'bg-purple-100 text-purple-800',
      'Lithium': 'bg-blue-100 text-blue-800',
      'Cobalt': 'bg-indigo-100 text-indigo-800',
      'Rare Earth Elements': 'bg-pink-100 text-pink-800',
      'Brominated Flame Retardants': 'bg-red-100 text-red-800',
      'Phosphor': 'bg-green-100 text-green-800'
    };
    return colors[element] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">E-Waste Classification</h1>
        <p className="text-lg text-gray-600">
          Upload or capture an image of electronic waste to identify its components and hazardous materials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Image</h2>
            
            {!previewUrl ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your image here, or click to select
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports JPG, PNG, WebP up to 10MB
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Image className="h-4 w-4" />
                    <span>Choose File</span>
                  </button>
                  <button
                    onClick={() => {
                      // Simulate camera capture
                      toast('Camera feature coming soon!');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Take Photo</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleClassify}
                    disabled={isUploading || isClassifying}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUploading || isClassifying ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>
                          {isUploading ? 'Uploading...' : 'Classifying...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Classify</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Classification Results</h2>
            
            {!result ? (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Upload and classify an image to see results
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Object Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Identified Object</h3>
                  </div>
                  <p className="text-lg font-medium text-green-800">{result.objectName}</p>
                  <p className="text-sm text-green-700">Category: {result.category}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-green-700">Confidence:</span>
                    <div className="flex-1 bg-green-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-green-800">
                      {result.confidence}%
                    </span>
                  </div>
                </div>

                {/* Hazardous Elements */}
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Hazardous Elements</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.hazardousElements.map((element, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getHazardColor(element)}`}
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Important:</strong> This item contains hazardous materials that require proper disposal. 
                      Please take it to an authorized e-waste recycling center.
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Disposal Recommendations</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Do not dispose in regular trash</li>
                    <li>• Find a certified e-waste recycling facility</li>
                    <li>• Remove personal data before disposal</li>
                    <li>• Consider donation if still functional</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;