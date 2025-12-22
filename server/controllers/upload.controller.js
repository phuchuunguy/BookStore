const { cloudinary } = require('../config/cloudinary')
const streamifier = require('streamifier')

const uploadController = {
    uploadImage: async (req, res) => {
        try {
            if (!req.file || !req.file.buffer) {
                return res.status(400).json({ message: 'No file uploaded', error: 1 })
            }

            const buffer = req.file.buffer

            const uploadFromBuffer = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'bookstore' },
                        (error, result) => {
                            if (error) return reject(error)
                            resolve(result)
                        }
                    )
                    streamifier.createReadStream(buffer).pipe(stream)
                })
            }

            const result = await uploadFromBuffer()
            return res.status(200).json({
                secure_url: result.secure_url,
                public_id: result.public_id,
                result
            })
        } catch (error) {
            console.error('Upload error:', error)
            return res.status(500).json({ message: error.message || 'Upload failed', error: 1 })
        }
    }
}

module.exports = uploadController
