import { notification } from 'antd'

export const trim = object => {
    if (object == undefined || object == null) {
        return ''
    } else if (typeof object == 'string') {
        return object.trim()
    } else {
        return object
    }
}

//숫자 앞에 0 채우기
export const leadingZeros = (target, digits) => {
    let zero = '';
    target = target.toString();

    if (target.length < digits) {
        for (var i = 0; i < digits - target.length; i++) zero += '0';
    }
    
    return zero + target;
}

//json 합치기
export const extend = (json1, json2) => {
    const newObj = {}
    for (let att in json1) {
        newObj[att] = json1[att]
    }

    for (let att in json2) {
        newObj[att] = json2[att]
    }

    return newObj
}

//금액 포맷
export const fommatMoney = obj => {
    const parts = number.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

// Notification
export const commonNotification = params => {
    notification[params.kind]({
        message: params.message,
        description: params.description,
        style: {
            border: '1px solid red'
        }
    })
}

// CI, PI, PL 출력관련
// 엑셀에 Value값 입력
export const setJsonValues = (worksheet, jsonData) => {
    for (let i = 0; i < jsonData.length; i++) {
        worksheet.getCell(jsonData[i].cellNm).value = jsonData[i].value
    }
}

// 설정을 위해 Json 합치기
export const setProps = (worksheet, cellNum, prop, addProps) => {
    if (cellNum instanceof Array) {
        //배열로 들어오는 경우
        for (let i = 0; i < cellNum.length; i++) {
            if (cellNum[i].indexOf(':') > 0) {
                // :으로 들어오는 경우
                let start = cellNum[i].split(':')[0]
                let end = cellNum[i].split(':')[1]

                let startAlphaBet =
                    start.replace(/[0-9]/g, '').charCodeAt(0) >= end.replace(/[0-9]/g, '').charCodeAt(0)
                        ? end.replace(/[0-9]/g, '').charCodeAt(0)
                        : start.replace(/[0-9]/g, '').charCodeAt(0)
                let startNum =
                    Number(start.replace(/[^0-9]/g, '')) >= Number(end.replace(/[^0-9]/g, ''))
                        ? end.replace(/[^0-9]/g, '')
                        : start.replace(/[^0-9]/g, '')
                let endAlphabet =
                    start.replace(/[0-9]/g, '').charCodeAt(0) <= end.replace(/[0-9]/g, '').charCodeAt(0)
                        ? end.replace(/[0-9]/g, '').charCodeAt(0)
                        : start.replace(/[0-9]/g, '').charCodeAt(0)
                let endNum =
                    Number(start.replace(/[^0-9]/g, '')) <= Number(end.replace(/[^0-9]/g, ''))
                        ? end.replace(/[^0-9]/g, '')
                        : start.replace(/[^0-9]/g, '')

                let tempArray = []

                for (let a = startAlphaBet; a <= endAlphabet; a++) {
                    for (let b = Number(startNum); b <= Number(endNum); b++) {
                        tempArray.push(String.fromCharCode(a).toUpperCase() + String(b))
                    }
                }

                for (let c = 0; c < tempArray.length; c++) {
                    if (!worksheet.getCell(tempArray[c])[prop]) {
                        worksheet.getCell(tempArray[c])[prop] = addProps
                    } else {
                        worksheet.getCell(tempArray[c])[prop] = extend(worksheet.getCell(tempArray[c])[prop], addProps)
                    }
                }
            } else {
                if (cellNum[i] instanceof Array) {
                    for (let j = 0; j < cellNum[i].length; j++) {
                        if (!worksheet.getCell(cellNum[i][j])[prop]) {
                            worksheet.getCell(cellNum[i][j])[prop] = addProps
                        } else {
                            worksheet.getCell(cellNum[i][j])[prop] = extend(
                                worksheet.getCell(cellNum[i][j])[prop],
                                addProps
                            )
                        }
                    }
                } else {
                    if (!worksheet.getCell(cellNum[i])[prop]) {
                        worksheet.getCell(cellNum[i])[prop] = addProps
                    } else {
                        worksheet.getCell(cellNum[i])[prop] = extend(worksheet.getCell(cellNum[i])[prop], addProps)
                    }
                }
            }
        }
    } else {
        if (cellNum.indexOf(':') > 0) {
            // :으로 들어오는 경우
            let start = cellNum.split(':')[0]
            let end = cellNum.split(':')[1]

            let startAlphaBet =
                start.replace(/[0-9]/g, '').charCodeAt(0) >= end.replace(/[0-9]/g, '').charCodeAt(0)
                    ? end.replace(/[0-9]/g, '').charCodeAt(0)
                    : start.replace(/[0-9]/g, '').charCodeAt(0)
            let startNum =
                Number(start.replace(/[^0-9]/g, '')) >= Number(end.replace(/[^0-9]/g, ''))
                    ? end.replace(/[^0-9]/g, '')
                    : start.replace(/[^0-9]/g, '')
            let endAlphabet =
                start.replace(/[0-9]/g, '').charCodeAt(0) <= end.replace(/[0-9]/g, '').charCodeAt(0)
                    ? end.replace(/[0-9]/g, '').charCodeAt(0)
                    : start.replace(/[0-9]/g, '').charCodeAt(0)
            let endNum =
                Number(start.replace(/[^0-9]/g, '')) <= Number(end.replace(/[^0-9]/g, ''))
                    ? end.replace(/[^0-9]/g, '')
                    : start.replace(/[^0-9]/g, '')

            let tempArray = []

            for (let i = startAlphaBet; i <= endAlphabet; i++) {
                for (let j = Number(startNum); j <= Number(endNum); j++) {
                    tempArray.push(String.fromCharCode(i).toUpperCase() + String(j))
                }
            }

            for (let k = 0; k < tempArray.length; k++) {
                if (!worksheet.getCell(tempArray[k])[prop]) {
                    worksheet.getCell(tempArray[k])[prop] = addProps
                } else {
                    worksheet.getCell(tempArray[k])[prop] = extend(worksheet.getCell(tempArray[k])[prop], addProps)
                }
            }
        } else {
            for (let i = 0; i < cellNum.length; i++) {
                if (!worksheet.getCell(cellNum)[prop]) {
                    worksheet.getCell(cellNum)[prop] = addProps
                } else {
                    worksheet.getCell(cellNum)[prop] = extend(worksheet.getCell(cellNum)[prop], addProps)
                }
            }
        }
    }
}

export const getCellNum = (num, count) => {
    // 선택된 데이터 Row
    let number = Number(num) + count

    return number
}

export const isMobile = () => {
    return window.innerWidth < 450 ? true : false
}
