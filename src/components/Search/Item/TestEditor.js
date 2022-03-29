import React, { useState, useEffect , useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import SunEditor, { buttonList } from 'suneditor-react'
import 'suneditor/dist/css/suneditor.min.css' // Import Sun Editor's CSS File

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import plugins from 'suneditor/src/plugins'
import { ko } from 'suneditor/src/lang'

import Https from '../../../api/http'

const TestEditor = () => {
    const [content, setContent] = useState()

    const changeContent = event => {
        setContent(event)
    }

    const onImageUploadBefore = async (files, info, uploadHandler) => {
        console.log('files : ' + JSON.stringify(files))
        console.log('info : ' + JSON.stringify(info))
        console.log('uploadHandler : ' + JSON.stringify(uploadHandler))

        let result = await sendImage(files[0])

        // result
        const response = {
            // The response must have a "result" array.
            result: [
                {
                    url: result,
                    name: files[0].name,
                    size: files[0].size
                }
            ]
        }

        uploadHandler(response)
    }

    const sendImage = async file => {
        //동기처리예제

        const formData = new FormData()
        formData.append('imageGb', '03')
        formData.append('file', file)
        formData.append('userId', userId)

        const config = { headers: { 'Content-Type': 'multipart/form-data' } }

        let apiUrl = process.env.REACT_APP_API_URL + '/file/uploadFile'

        let url = ''
        return await Https.postUploadImage(formData, config)
            .then(response => {
                let list = response.data.data
                console.log(list)
                //url = s3url + list.upload_url[0]
                return response.data.data.url
            }) // SUCCESS
            .catch(error => {
                console.error(error)

                url = ''
                return url
            }) // ERROR
    }

    return (
        <SunEditor
            onChange={changeContent}
            onImageUploadBefore={onImageUploadBefore}
            setOptions={{
                height: '500px',
                plugins: plugins,
                buttonList: [
                    ['undo', 'redo'],
                    ['font', 'fontSize', 'formatBlock'],
                    ['paragraphStyle', 'blockquote'],
                    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                    ['fontColor', 'hiliteColor', 'textStyle'],
                    ['removeFormat'],
                    '/', // Line break
                    ['outdent', 'indent'],
                    ['align', 'horizontalRule', 'list', 'lineHeight'],
                    ['table', 'link', 'image'], // You must add the 'katex' library at options to use the 'math' plugin. // You must add the "imageGalleryUrl".
                    /** ['imageGallery'] */ ['fullScreen', 'showBlocks', 'codeView'],
                    ['preview', 'print'],
                    ['save', 'template']
                ],
                lang: ko
            }}
        />
    )
}

export default withRouter(TestEditor)
