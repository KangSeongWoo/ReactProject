import axios from 'axios'

const baseUrl = process.env.REACT_APP_API_URL

const requestUrl = []

const instance = axios.create({
    timeout: 2225000
})

instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

instance.interceptors.request.use(
    config => {
        requestUrl.pop()
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

instance.interceptors.response.use(
    response => {
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
            if (refreshToken && error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true
                return axios.post(`${baseUrl}/users/refreshtoken`, { refreshToken: refreshToken }).then(res => {
                    if (res.status === 200) {
                        //dispatch(loginSetUserInfoAction(JSON.stringify(res.data.data.user)))
                        localStorage.setItem('user', JSON.stringify(res.data.data.user))
                        localStorage.setItem('token', res.data.data.user.token)
                        localStorage.setItem('refreshToken', res.data.data.user.refreshToken)

                        originalRequest.headers['Authorization'] = 'Bearer ' + res.data.data.user.token

                        return axios(originalRequest)
                    }
                })
            } else if (error.response.status === 422) {
                alert(error.response.data.errors.message[0])
                return false
            }
            return Promise.reject(error)
        }
    }
)

export default instance
