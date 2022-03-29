import React, { useEffect, useState , useMemo } from 'react'
import './SelectBox.css'
const SelectBox = props => {
    const { width, height, placeholder, data, onChange } = props;
    
    const openSelectBox = (event) => {
        let target = event.currentTarget.nextElementSibling.children[0].classList;
        if(target.contains("dp-none")){
            target.remove("dp-none")
            target.add("dp")
        }else {
            target.remove("dp")
            target.add("dp-none")
        }
    }
    
    const chooseOption = (event) => {
        let targetValue = event.currentTarget.dataset.key
        let targetLabel = event.currentTarget.innerHTML
        
        event.currentTarget.parentElement.parentElement.previousElementSibling.childNodes[0].childNodes[0].innerText = targetLabel;
        
        event.currentTarget.parentElement.classList.remove("dp")
        event.currentTarget.parentElement.classList.add("dp-none")
        
        onChange(targetValue);
    }
    
    return (
        <div style={{position : 'fixed', top : '-1px', left : '440px'}}>
            <div id="selectBox" style={{ width: width != '' ? width : 'auto', height : height != '' ? height : 'auto' }} onClick={(e) => openSelectBox(e)}>
                <div>
                    <span>{placeholder}</span>
                </div>
                <span>
                    <svg viewBox="64 64 896 896" focusable="false" className="" data-icon="down" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                        <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z">
                        </path>
                    </svg>
                </span>
            </div>
            <div id="optionBox">
                <ul className="dp-none" style={{ width: width}}>
                    {data.map(item => (
                        <li onClick={(e) => chooseOption(e)} data-key={item.value}>{item.label}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default SelectBox
