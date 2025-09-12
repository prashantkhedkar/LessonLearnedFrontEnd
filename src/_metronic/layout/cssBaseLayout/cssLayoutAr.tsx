import React, { PropsWithChildren } from 'react'
import '../../assets/css/style.rtl.css';
import '../../assets/sass/style.react.scss'
// import '../../../index.css';
import '../../assets/css/customGlobal.rtl.css'

export default function cssLayoutAr({ children }: PropsWithChildren<{}>) {
    return (
        <>
            {children}
        </>
    )
}
