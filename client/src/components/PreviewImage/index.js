import { useState } from "react"

function PreviewImage({file, src}) {
    const [preview, setPreview] = useState({})

   if (file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
        setPreview(reader.result)
    }
   }
    return (
        <div>
           {src ? <img src={src} alt="preview" style={{maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto'}} /> : <img src={preview} alt="preview" style={{maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto'}} />}
        </div>
    )
}

export default PreviewImage