import React, { useEffect, useState , useMemo } from 'react'
import './Input.css'
const Input = props => {
    return (
        <div style="padding-top : 10px;">
					<input type="text" class="inputField" placeholder=""/>
					<span>이름2</span>
				</div>
    )
}

export default Input
