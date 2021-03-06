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
		
		// ??????  API ??????
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
							message: '?????? ??????',
							description: '????????? ?????? ????????? ?????????'
					})
					props.setSpin(false)
			}) // ERROR
		// ??????  API ??????
	}

	const handleInputChange = (event) => {
		setState({
			...state,
			[event.target.name] : event.target.value
		})
	}
	
	const columns = [
		{
			title: '????????????',
			dataIndex: 'masterNm',
			key: 'masterNm'
		},
		{
			title: '????????? ??????',
			dataIndex: 'masterDescription',
			key: 'masterDescription',
		},
		{
			title: '?????????1',
			dataIndex: 'optionKey1',
			key: 'optionKey1',
		},
		{
			title: '?????????2',
			dataIndex: 'optionKey2',
			key: 'optionKey2',
		},
		{
			title: '?????????3',
			dataIndex: 'optionKey3',
			key: 'optionKey3',
		},
		{
			title: '?????????4',
			dataIndex: 'optionKey4',
			key: 'optionKey4',
		},
		{
			title: '?????????5',
			dataIndex: 'optionKey5',
			key: 'optionKey5',
		},
		{
			title: '??????',
			dataIndex: 'delete',
			key: 'delete',
			render: (index, target) => (
				<a onClick={() => {
					// ?????? API ??????
					
					// ?????? API ??????
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
							<CustomBreadcrumb arr={['??????', '?????? ????????? ??????']}></CustomBreadcrumb>
					</div>

					<div className='notice-wrapper'>
							<div className='notice-content' style={{ width: '100%', overflowY: 'scroll'}}>
									<Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
											<Col span={24}>
													<Text className='font-15 NanumGothic-Regular' strong>
															?????? ????????? ?????????
													</Text>
											</Col>
									</Row>
									<Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
										<Col span={2}>
												<Text className='font-15 NanumGothic-Regular' strong>
														????????????
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
														???????????????
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
													?????????1
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
													?????????2
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
													?????????3
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
													?????????4
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
													?????????5
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
											<Button onClick={setOptionMaster}>??????</Button>
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
