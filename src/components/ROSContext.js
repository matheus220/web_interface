import React from 'react'

const ROSContext = React.createContext({})

export const ROSProvider = ROSContext.Provider
export const ROSConsumer = ROSContext.Consumer
export default ROSContext