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
        <div style={{margin: 10}}>
           {src ? <img src={src} alt="" /> : <img src={preview} alt="" />}
        </div>
    )
}

export default PreviewImage