import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Input } from 'antd'
import { withRouter } from 'react-router-dom'
import * as Common from '../../../utils/Common.js'

const TrdstTable = ({
    name,
    columns,
    dataSource,
    rowKey,
    setDataSource,
    saveOrderList,
    setSaveOrderList,
    stateRowkey,
    setStateRowkey,
    style
}) => {
    const columnsList = columns

    const [state, setState] = useState([])

    useEffect(() => {
        setState(dataSource)
    }, [dataSource])

    const onHeaderCheckBoxClick = () => {
        let target = document.querySelector('#checkAll') != null ? document.querySelector('#checkAll').checked : false

        if (target == true) {
            let tempList = []
            let tempDataList = []

            // 선택
            document.querySelectorAll('#' + name + " input[type='checkbox']").forEach(node => {
                tempList.push(node.dataset.rowKey)
                node.checked = true
            })

            tempList.forEach(node => {
                tempDataList.push(dataSource.find(element => element.orderCd === node))
            })

            setStateRowkey([...tempList])

            setSaveOrderList([...tempDataList])
        } else {
            // 선택해제
            document.querySelectorAll('#' + name + " input[type='checkbox']").forEach(node => {
                node.checked = false
            })

            setStateRowkey([])

            setSaveOrderList([])
        }
    }

    useEffect(() => {
        if (document.querySelector('#checkAll') != null) {
            if (
                document.querySelectorAll('#' + name + " input[type='checkbox']").length == stateRowkey.length &&
                stateRowkey.length != 0
            ) {
                document.querySelector('#checkAll').checked = true
            } else {
                document.querySelector('#checkAll').checked = false
            }
        }
    }, [stateRowkey])

    const onCheckBoxClick = event => {
        if (event.target.checked == true) {
            // 선택
            let tempList = []

            document.querySelectorAll('input[value="' + event.target.value + '"]').forEach(node => {
                node.checked = true
                tempList.push(node.dataset.rowKey)
            })

            setStateRowkey([...stateRowkey, ...tempList])

            setSaveOrderList([...saveOrderList, ...dataSource.filter(row => row.parentOrderCd == event.target.value)])
        } else {
            let tempList1 = []
            let tempList2 = stateRowkey
            // 선택해제
            document.querySelectorAll('input[value="' + event.target.value + '"]').forEach(node => {
                node.checked = false
                tempList1.push(node.dataset.rowKey)
            })

            setSaveOrderList([...saveOrderList.filter(row => row.parentOrderCd != event.target.value)])

            tempList1.forEach(row1 => {
                tempList2 = tempList2.filter(row2 => row1 != row2)
            })

            setStateRowkey([...tempList2])
        }
    }

    const openColumnSearch = event => {
        console.log(event)
        let target = event.target.parentNode.nextElementSibling.style.display
        if (Common.trim(target) === 'none') {
            event.target.parentNode.nextElementSibling.style.display = 'flex'
        } else {
            event.target.parentNode.nextElementSibling.style.display = 'none'
            event.target.parentNode.nextElementSibling.childNodes[0].value = ''
        }
    }

    const SearchList = (searchPart, searchWord) => {
        let tempList = []

        dataSource.forEach(row => {
            if (row[searchPart].toUpperCase().indexOf(searchWord.target.value.toUpperCase()) > -1) {
                tempList.push(row)
            }
        })

        setState([...tempList])
    }

    const SetColumns = ({ column }) => {
        return (
            <th className='' style={{ padding: '8px 8px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    {column.checkbox && (
                        <>
                            <label className='' style={{ marginRight: '12px', marginBottom: '0px' }}>
                                <input
                                    type='checkbox'
                                    style={{ marginTop: '3px' }}
                                    className=''
                                    id='checkAll'
                                    data-row-key='checkAll'
                                    onClick={onHeaderCheckBoxClick}
                                />
                            </label>
                        </>
                    )}
                    {column.searchField && (
                        <div>
                            <div onClick={openColumnSearch}>
                                <span className=''>{column.title} ▼</span>
                            </div>
                            <div
                                style={{
                                    display: 'none',
                                    backgroundColor: 'white',
                                    border: '1px solid lightgrey',
                                    width: '110px',
                                    height: '55px',
                                    flexDirection: 'column',
                                    padding: '10px',
                                    position: 'absolute',
                                    marginTop: '5px'
                                }}>
                                <Input type='text' onKeyUp={e => SearchList(column.key, e)} />
                            </div>
                        </div>
                    )}
                    {!column.searchField && (
                        <div>
                            <span className=''>{column.title}</span>
                        </div>
                    )}
                </span>
            </th>
        )
    }

    const SetRows = ({ row }) => {
        return (
            <tr
                className=''
                rowKey={row[rowKey]}
                data-row-key={row.orderCd}
                data-row-group={row.parentOrderCd}
                data-set={JSON.stringify(row)}>
                {columnsList.map(column => (
                    <>
                        <td className='' style={{ borderBottom: '1px solid #e8e8e8', padding: '8px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {column.checkbox && (
                                    <span>
                                        <label className='' style={{ marginRight: '12px', marginBottom: '0px' }}>
                                            <input
                                                type='checkbox'
                                                style={{ marginTop: '3px' }}
                                                data-row-key={row.orderCd}
                                                value={row.parentOrderCd}
                                                className=''
                                                onClick={onCheckBoxClick}
                                                checked={stateRowkey.includes(row.orderCd) ? 'checked' : ''}
                                            />
                                        </label>
                                    </span>
                                )}
                                {column.render != undefined && column.render(row)}
                                {column.render == undefined && (
                                    <span className='' style={{ verticalAlign: 'top' }}>
                                        {row[column.key]}
                                    </span>
                                )}
                            </div>
                        </td>
                    </>
                ))}
            </tr>
        )
    }

    return (
        <div className='ant-table-wrapper' style={style}>
            <table
                className='NanumGothic-Regular'
                style={{
                    fontSize: '12px',
                    borderSpacing: '0px',
                    width: '100%',
                    backgroundColor: 'white',
                    whiteSpace: 'nowrap'
                }}>
                <thead className='' style={{ backgroundColor: 'rgb(211, 209, 209)' }}>
                    {React.useMemo(() => {
                        return (
                            <tr>
                                {columnsList.map(column => (
                                    <SetColumns column={column} />
                                ))}
                            </tr>
                        )
                    }, [dataSource])}
                </thead>
                <tbody className='' id={name} style={{ height: '171px' }}>
                    {state.map(row => (
                        <SetRows row={row} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default withRouter(TrdstTable)
