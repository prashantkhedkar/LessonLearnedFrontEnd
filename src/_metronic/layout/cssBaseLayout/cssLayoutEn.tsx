import React, { PropsWithChildren } from 'react'
import '../../assets/css/style.css';
import '../../assets/sass/style.react.scss'
// import '../../../index.css';
import '../../assets/css/customGlobal.css'

export default function cssLayoutEn({ children }: PropsWithChildren<{}>) {
    return (
        <>
            {children}
        </>
    )
}
