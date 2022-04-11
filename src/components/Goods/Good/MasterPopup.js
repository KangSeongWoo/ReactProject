import React, { useCallback, useLayoutEffect, useState,useEffect , useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import * as Constans from '../../../utils/Constans'
import {
    Layout,
    Input,
    Icon,
    Cascader,
    Select,
    Row,
    Col,
    Button,
    Modal,
    DatePicker,
    InputNumber,
    Divider,
    Upload,
    Tabs,
    Card,
    Typography,
    Table,
    Radio,
    
} from 'antd'
import '/src/style/custom.css'
import * as moment from 'moment'
import Https from '../../../api/http'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import BrandSearch from '../../Common/Brand/Search'
import PurchaseVendorSearch from '../../Common/Purchase/VendorList'
import OptionList from './OptionList'
import * as Common from '../../../utils/Common.js'
import SunEditor from 'suneditor-react'
import plugins from 'suneditor/src/plugins'
import { ko } from 'suneditor/src/lang'
import queryStirng from 'query-string'
import '/src/style/suneditor.min.css'

const { Option } = Select
const { RangePicker } = DatePicker
const { TabPane } = Tabs
const { Text } = Typography
const { TextArea } = Input

const getUUID = () => {
    // UUID v4 generator in JavaScript (RFC4122 compliant)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 3) | 8
        return v.toString(16)
    })
}

const MasterPopup = props => {
  const { userId } = props

	const [state, setState] = useState({
		optionMasterData: [],
		masterNm : '',
		masterDescription : '',
		optionKey1 : '',
		optionKey2 : '',
		optionKey3 : '',
		optionKey4 : '',
		optionKey5 : '',
		userId: userId
	})

	const hotkeyFunction = useCallback(event => {
		if (event.key == 'F2') {
				refresh()
		}
	}, [])

	useLayoutEffect(() => {
		// window.addEventListener('resize', () => props.setHeight());
		// props.setHeight();
		document.addEventListener('keyup', hotkeyFunction)
	}, [])

	useEffect(() => {
			
	}, [])

	const setOptionMaster = () => {
		let param = {};
		
		param.masterNm 					= state.masterNm;
		param.masterDescription 	= state.masterDescription;
		param.optionKey1 				= state.optionKey1;
		param.optionKey2 				= state.optionKey2;
		param.optionKey3 				= state.optionKey3;
		param.optionKey4 				= state.optionKey4;
		param.optionKey5 				= state.optionKey5;
		param.userId 							= userId
		
		const config = { headers: { 'Content-Type': 'application/json' } }
		
		// 저장  API 호출
		return Https.manageOptionMaster(param,config)
			.then(response => {
					setState({
						...state,
						optionMasterData: [...state.optionMasterData, {
							masterId : response.data.data.masterId,
							masterNm: state.masterNm,
							masterDescription: state.masterDescription,
							optionKey1: state.optionKey1,
							optionKey2: state.optionKey2,
							optionKey3: state.optionKey3,
							optionKey4: state.optionKey4,
							optionKey5: state.optionKey5,
						}]
					})
			}).catch(error => {
					console.error(error)
					Common.commonNotification({
							kind: 'error',
							message: '에러 발생',
							description: '잠시후 다시 시도해 주세요'
					})
					props.setSpin(false)
			}) // ERROR
		// 저장  API 호출
	}

	const handleInputChange = (event) => {
		setState({
			...state,
			[event.target.name] : event.target.value
		})
	}
	
	const columns = [
		{
			title: '마스터명',
			dataIndex: 'masterNm',
			key: 'masterNm'
		},
		{
			title: '마스터 설명',
			dataIndex: 'masterDescription',
			key: 'masterDescription',
		},
		{
			title: '옵션키1',
			dataIndex: 'optionKey1',
			key: 'optionKey1',
		},
		{
			title: '옵션키2',
			dataIndex: 'optionKey2',
			key: 'optionKey2',
		},
		{
			title: '옵션키3',
			dataIndex: 'optionKey3',
			key: 'optionKey3',
		},
		{
			title: '옵션키4',
			dataIndex: 'optionKey4',
			key: 'optionKey4',
		},
		{
			title: '옵션키5',
			dataIndex: 'optionKey5',
			key: 'optionKey5',
		},
		{
			title: '삭제',
			dataIndex: 'delete',
			key: 'delete',
			render: (index, target) => (
				<a onClick={() => {
					// 삭제 API 호출
					
					// 삭제 API 호출
					setState({
						...state,
						optionMasterData : [...state.optionMasterData.filter((row) => row.masterId !== target.masterId)]
					})
				}}>Delete</a>
			)
		},
	]
	
	return (
			<Layout>   
					<div className='notice-header'>
							<CustomBreadcrumb arr={['상품', '상품 마스터 등록']}></CustomBreadcrumb>
					</div>

					<div className='notice-wrapper'>
							<div className='notice-content' style={{ width: '100%', overflowY: 'scroll'}}>
									<Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
											<Col span={24}>
													<Text className='font-15 NanumGothic-Regular' strong>
															옵션 마스터 데이터
													</Text>
											</Col>
									</Row>
									<Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
										<Col span={2}>
												<Text className='font-15 NanumGothic-Regular' strong>
														마스터명
												</Text>
										</Col>
										<Col span={4}>
												<Input
														name='masterNm'
														onChange={handleInputChange}
														value={state.masterNm}
												/>
										</Col>
										<Col span={3}>
												<Text className='font-15 NanumGothic-Regular' strong>
														마스터설명
												</Text>
										</Col>
										<Col span={15}>
												<Input
														name='masterDescription'
														onChange={handleInputChange}
														value={state.masterDescription}
												/>
										</Col>
									</Row>
									<Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
										<Col span={2}>
											<Text className='font-15 NanumGothic-Regular' strong>
													옵션키1
											</Text>
										</Col>
										<Col span={2}>
											<Input
													name='optionKey1'
													onChange={handleInputChange}
													value={state.optionKey1}
											/>
										</Col>
										<Col span={2}>
											<Text className='font-15 NanumGothic-Regular' strong>
													옵션키2
											</Text>
										</Col>
										<Col span={2}>
											<Input
													name='optionKey2'
													onChange={handleInputChange}
													value={state.optionKey2}
											/>
										</Col>
										<Col span={2}>
											<Text className='font-15 NanumGothic-Regular' strong>
													옵션키3
											</Text>
										</Col>
										<Col span={2}>
											<Input
													name='optionKey3'
													onChange={handleInputChange}
													value={state.optionKey3}
											/>
										</Col>
										<Col span={2}>
											<Text className='font-15 NanumGothic-Regular' strong>
													옵션키4
											</Text>
										</Col>
										<Col span={2}>
											<Input
													name='optionKey4'
													onChange={handleInputChange}
													value={state.optionKey4}
											/>
										</Col>
										<Col span={2}>
											<Text className='font-15 NanumGothic-Regular' strong>
													옵션키5
											</Text>
										</Col>
										<Col span={2}>
											<Input
													name='optionKey5'
													onChange={handleInputChange}
													value={state.optionKey5}
											/>
										</Col>
										<Col span={4}>
											<Button onClick={setOptionMaster}>추가</Button>
										</Col>
									</Row>
									
									{state.optionMasterData.length != 0 && (
										<Row gutter={[16, 8]} className='onVerticalCenter marginTop-15' style={{ width: '100%' }}>
											<Col span={24}>
												<Table columns={columns} dataSource={state.optionMasterData}/>
											</Col>
										</Row>
									)}
							</div>
					</div>
			</Layout>
	)
}

//export default Create
export default withRouter(MasterPopup)
