import React, { useCallback, useState, useEffect , useMemo, useLayoutEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Col, Row, Typography, Button,Select } from 'antd'
import { Input, Modal, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import '../../../style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Common from '../../../utils/Common.js'

const { Text } = Typography

const OrderList = props => {
	const { isModalVisible, setIsModalVisible, backState, setBackState,callBackFunc } = props

	const [gridApi, setGridApi] = useState(null)
	const [gridColumnApi, setGridColumnApi] = useState(null)
	const [ownerList, setOwnerList] = useState([])
	const [orderList, setOrderList] = useState([])
	const [state, setState] = useState({
			rowData: []
	})

	const hotkeyFunction = useCallback(event => {
			if (event.key == 'F8') {
					document.querySelector('.searchVendorPop').click()
			}
	}, [])
	
	useLayoutEffect(() => {
		getVendorList();
	},[])

	useEffect(() => {
			if (isModalVisible) {
					document.addEventListener('keyup', hotkeyFunction)
			} else {
					document.removeEventListener('keyup', hotkeyFunction)
		}
	}, [isModalVisible])

	// 구매처 리스트 호출
	const getVendorList = async () => {
		try {
			let res = await Https.getVendorList()
			console.log('---------------------------------------------------')
			console.log(res)
			setOwnerList(res.data.data.PurchaseVendors) // 구매처 State
		} catch (error) {
			console.error(error)
		} finally {
			props.setSpin(false)
		}
	}

	const columnDefs = () => {
			return [
					{
						headerName: '주문번호',
						field: 'orderCd',
						headerCheckboxSelection: true,
						headerCheckboxSelectionFilteredOnly: true,
						checkboxSelection: true,
					},
					{
						headerName: '주문자',
						field: 'custNm'
					}
			]
	}

	const handleOk = () => {
			setIsModalVisible(false)
	}

	const handleCancel = () => {
			setIsModalVisible(false)
	}
	
	const getPurchaseVendorsItem = (vendorId) => {
		props.setSpin(true)

		return Https.getPurchaseVendorsItem(vendorId)
			.then(response => {
					console.log(response)

					setOrderList(response.data.data)

					props.setSpin(false)
			})
			.catch(error => {
					Common.commonNotification({
							kind: 'error',
							message: '에러 발생',
							description: '잠시후 다시 시도해 주세요'
					})
					console.error(error)
					props.setSpin(false)
			}) // ERROR
  }

	// agGrid API 호출
	const onGridReady = params => {
			setGridApi(params.api)
			setGridColumnApi(params.columnApi)
	}

	const defaultColDef = useMemo(() => {
			return {
				sortable: true,
				editable: false, 
				flex: 1,
				minWidth: 100, 
				resizable: true
			};
	}, []);

	const addOrderList = () => {
		let selectedRows = gridApi.getSelectedRows()
		
		let tempList = {};
		
		tempList.purchaseNo = backState.purchaseId;
		tempList.purchaseDt = backState.purchaseDt
		tempList.assortId = backState.assortId
		tempList.assortNm = backState.assortNm
		tempList.dealtypeCd = backState.dealtypeCd
		tempList.deliFee = backState.deliFee
		tempList.memo = backState.memo
		tempList.piNo = backState.piNo
		tempList.purchaseGb = backState.purchaseGb
		tempList.purchaseStatus = backState.purchaseStatus
		tempList.purchaseVendorNm = backState.purchaseVendorNm
		tempList.siteOrderNo = backState.siteOrderNo
		tempList.storageId = backState.storageId
		tempList.vendorId = backState.vendorId

		selectedRows.forEach((row) => {
			row.purchaseUnitAmt = Number(row.purchasePrice)
			row.dealtypeCd = '01'
		})

		tempList.items = [...selectedRows];
		
		console.log("tempList : " + JSON.stringify(tempList));

		const config = { headers: { 'Content-Type': 'application/json' } }

		return Https.postAddPurchase(tempList, config)
			.then(response => {
				console.log(response)

				props.setSpin(false)
				handleCancel();
				callBackFunc();
			})
			.catch(error => {
				Common.commonNotification({
					kind: 'error',
					message: '에러 발생',
					description: '잠시후 다시 시도해 주세요'
				})
				console.error(error)
				props.setSpin(false)
			}) // ERROR
	}
	
	return (
			<Modal
					title='주문조회'
					visible={isModalVisible}
					onOk={handleOk}
					onCancel={handleCancel}
					footer={[<></>]}>
					<Row>
						<Col span={16}>
								<Row className='onVerticalCenter marginTop-10'>
										<Col span={8}>
												<Text className='font-15 NanumGothic-Regular' strong>
														구매처
												</Text>
										</Col>
										<Col span={16}>
											<Select
												placeholder='구매처를 선택하세요'
												className='fullWidth'
												showSearch
												showArrow
												optionFilterProp='children'
												filterOption={(input, option) =>
														option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
												value={backState.vendorId != '' ? backState.vendorId : undefined}
												disabled
											>
												{ownerList.map(item => (
														<Option key={item.value}>{item.label}</Option>
												))}
											</Select>
										</Col>
								</Row>
						</Col>
						<Col span={8}>
								<Row type='flex' justify='end' align='middle'>
									<Button
											className='marginTop-10 searchVendorPop'
											type='primary'
											style={{ width: '72px', height: '36px' }}
											onClick={() => getPurchaseVendorsItem(backState.vendorId)}>
											조회
									</Button>
								</Row>
						</Col>
					</Row>
					<div>
							<div className='ag-theme-alpine' style={{ height: 200, width: '100%' }}>
									<AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
											suppressDragLeaveHidesColumns={true}
											className='marginTop-10'
											columnDefs={columnDefs()}
											rowData={orderList}
											ensureDomOrder={true}
											enableCellTextSelection={true}
											rowSelection={'multiple'}
											onGridReady={onGridReady}></AgGridReact>
							</div>
					</div>
					<Row type='flex' style={{ width: '100%'}}>
						<Button
								className='marginTop-10'
								type='primary'
								style={{ width: '100%' }}
								ghost
								//style={{ width: '72px', height: '36px' }}
								onClick={() => addOrderList()}>
								저장
						</Button>
					</Row>
			</Modal>
	)
}

export default withRouter(OrderList)
