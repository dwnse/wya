import { useState, useRef } from 'react'
import { Icon } from './Icons'
import { uploadImage, createImagePreview } from '../services/storageService'
import './ImageUploader.css'

function ImageUploader({
    value,
    onChange,
    bucket = 'images',
    folder = '',
    label = 'Imagen',
    accept = 'image/*'
}) {
    const [preview, setPreview] = useState(value || '')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef(null)

    const handleFileSelect = async (file) => {
        if (!file) return

        setError('')
        setUploading(true)

        try {
            const previewUrl = await createImagePreview(file)
            setPreview(previewUrl)
            const publicUrl = await uploadImage(file, bucket, folder)
            onChange(publicUrl)
            setPreview(publicUrl)
        } catch (err) {
            setError(err.message)
            setPreview(value || '')
        } finally {
            setUploading(false)
        }
    }

    const handleInputChange = (e) => {
        const file = e.target.files?.[0]
        if (file) handleFileSelect(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFileSelect(file)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = () => {
        setDragOver(false)
    }

    const handleUrlInput = (url) => {
        setPreview(url)
        onChange(url)
    }

    const clearImage = () => {
        setPreview('')
        onChange('')
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="image-uploader">
            <label className="uploader-label">{label}</label>

            <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !preview && inputRef.current?.click()}
            >
                {uploading ? (
                    <div className="upload-loading">
                        <div className="spinner"></div>
                        <span>Subiendo...</span>
                    </div>
                ) : preview ? (
                    <div className="upload-preview">
                        <img src={preview} alt="Preview" />
                        <button type="button" className="clear-btn" onClick={clearImage}>
                            <Icon name="close" size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="upload-placeholder">
                        <Icon name="gallery" size={32} />
                        <span>Arrastra una imagen o haz clic</span>
                        <small>JPG, PNG, GIF, WebP (máx. 5MB)</small>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                />
            </div>

            {error && <p className="upload-error">{error}</p>}

            <div className="url-input-wrapper">
                <span className="url-divider">o ingresa URL</span>
                <input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={typeof value === 'string' && !value.startsWith('data:') ? value : ''}
                    onChange={(e) => handleUrlInput(e.target.value)}
                    className="url-input"
                />
            </div>
        </div>
    )
}

export default ImageUploader
