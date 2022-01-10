import instance from './index'

const baseUrl = process.env.REACT_APP_API_URL

class Https {
    // 로그인
    login = params => instance.post(baseUrl + '/users/login', params)
    
    // 현재 유저 확인
    getCurrentUser = () => instance.get(baseUrl + '/user')
}

export default new Https()
