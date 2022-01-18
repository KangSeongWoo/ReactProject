import axios from 'axios'
import store from '../store'

const baseUrl = process.env.REACT_APP_API_URL

const requestUrl = []

const instance = axios.create({
    timeout: 2225000
})

// 设置post请求头
instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

// 添加请求拦截器

instance.interceptors.request.use(
    config => {
        if (requestUrl.includes(config.url)) {
            console.log('request error')
            return Promise.reject('duplicateRequest')
        } else {
            requestUrl.push(config.url)
            console.log('request')
            const token = localStorage.getItem('token')
            token && (config.headers.Authorization = `Bearer ${token}`)
            return config
        }
    },
    error => {
        return Promise.reject(error)
    }
)

const { dispatch } = store
// 添加响应拦截器
instance.interceptors.response.use(
    response => {
        requestUrl.pop()
        if (response.status === 200) {
            console.log('response')

            return Promise.resolve(response)
        } else {
            return Promise.reject(response)
        }
    },
    error => {
        const originalRequest = error.config
        let refreshToken = localStorage.getItem('refreshToken')
        if (error === 'duplicateRequest') {
            return Promise.reject(error)
        } else {
            requestUrl.pop()
            if (refreshToken && error.response.status === 401 && !originalRequest._retry) {
                requestUrl.pop()
                originalRequest._retry = true
                return axios.post(`${baseUrl}/users/refreshtoken`, { refreshToken: refreshToken }).then(res => {
                    if (res.status === 200) {
                        localStorage.setItem('user', JSON.stringify(res.data.data.user))
                        localStorage.setItem('token', res.data.data.user.token)
                        localStorage.setItem('refreshToken', res.data.data.user.refreshToken)

                        originalRequest.headers['Authorization'] = 'Bearer ' + res.data.data.user.token

                        return axios(originalRequest)
                    }
                })
            } else if (error.response.status === 422) {
                requestUrl.pop()
                alert(error.response.data.errors.message[0])
                return false
            }
            return Promise.reject(error)
        }
    }
)

export default instance
