import React, { useEffect, useState } from 'react'
import '/src/style/custom.css'
import OptionItem from './Option'

const OptionList = (props) => {
    const [state, setState] = useState({
        items: props.items
    })

    useEffect(() => {
        props.onChangeItems(state.items)
    },[state])


    const UpdateData = (seq, value, type, id) => {
        setState({
            ...state,
            items: state.items.map((item, index) => (item.seq === seq ? { ...item, value: value } : item))
        })
    }

    const removeData = seq => {
        let newItems = state.items.filter((inFile, index) => inFile.seq != seq)

        setState({
            ...state,
            items: newItems
        })
    }

    return (
        <div>
            {state.items.map((item, index) => (
                <OptionItem
                    key={item.seq}
                    id={item.index}
                    seq={item.seq}
                    value={item.value}
                    type={item.type}
                    status={item.status}
                    isfocus={index == state.items.length - 1 ? 'y' : 'n'}
                    onUpdateData={UpdateData}
                    onRemoveData={removeData}
                    onPressEnter={() => props.onPressEnter()}></OptionItem>
            ))}
        </div>
    )
}
export default OptionList
