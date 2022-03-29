import React, { useEffect, useState , useMemo } from 'react'
import * as moment from 'moment'
import './Clock.css'

const Clock = () => {
	const [state, setState] = useState({
		days : moment().format('MMMM Do YY'),
		time: moment().format('LTS'),
	})
	
	useEffect(() => {
		setInterval(() => {
				setState({
					...state,
					days : moment().format('MMMM Do YY'),
					time: moment().format('LTS')
				})
		},1000)
	}, [])

	
	return(
		<div id="clock" style={state.background}>
			<h3 style={{fontWeight : 'bold'}}>{state.days}</h3>
			<h1>{state.time}</h1>
		</div>
	)
}

export default Clock