import React from 'react'

type Props = {
  value?: number
}
const MyCounter = ({ value = 0 }: Props) => {
  return (
    <div>
      <h1>Minimal react-hand-tracking package</h1>
      <h3>{value}</h3>
    </div>
  )
}

export default MyCounter
