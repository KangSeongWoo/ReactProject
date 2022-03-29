import React, {useState, useLayoutEffect, useEffect , useMemo } from 'react'
import { Input, Row, Col, Button, } from 'antd'
import '/src/style/custom.css'

const OptionItem = (props) => {
    const [state, setState] = useState({
        seq: props.seq,
        value: props.value,
        type: props.type,
        status: props.status,
        isfocus: props.isfocus
    })
   
    const inputRef = React.createRef();

    useLayoutEffect(() => {
        if (props.isfocus == 'y') {
            inputRef.current.focus({
                cursor: 'start'
            })
        }
    },[])
   
    useEffect(() => {
        props.onUpdateData(state.seq, state.value, state.type)
    },[state])

    const onValueChange = (field, value) => {
        setState({
            ...state,
            [field]: value
        })
    }

    const makeRemoveButton = () => {
        if (state.status == 'i') {
            return (
                <Button
                    onClick={() => {
                        props.onRemoveData(state.seq)
                    }}>
                    삭제
                </Button>
            )
        }
    }

    return (
        <div className='optionRow'>
            <Row>
                <Col className='col-r-margin' span={19}>
                    <Input
                        onPressEnter={(e) => {
                            props.onPressEnter()
                        }}
                        name='value'
                        disabled={state.status == 'i' ? false : true}
                        value={state.value}
                        ref={props.isfocus == 'y' ? inputRef : null}
                        onChange={e => {
                            onValueChange('value', e.target.value)
                        }}></Input>
                </Col>
                <Col span={4}>{makeRemoveButton()}</Col>
            </Row>
        </div>
    )
}
export default OptionItem