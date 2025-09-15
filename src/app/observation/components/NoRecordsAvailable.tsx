import React from 'react'
import { useIntl } from 'react-intl';


interface prop {
    customText?: string;
    customStyle?: React.CSSProperties;
}
const NoRecordsAvailable = ({ customText, customStyle }: prop) => {
    const intl = useIntl();

    return (
        <>
            <div className="global-no-record-to-display" style={customStyle}>
                {
                    customText &&
                    intl.formatMessage({ id: customText })
                }
                {
                    (!customText || customText.length === 0) &&
                    intl.formatMessage({ id: 'MOD.COMPONENT.DATATABLE.NORECORDS' })
                }
            </div>
        </>
    )
}
export const NotAuthorized = ({ customText, customStyle }: prop) => {
    const intl = useIntl();

    return (
        <>
            <div className="global-no-record-to-display" style={customStyle}>
                {
                    customText &&
                    customText
                }
                {
                    (!customText || customText.length === 0) &&
                    intl.formatMessage({ id: 'MOD.GLOBAL.UNAUTHORIZATION.MESSAGE' })
                }
            </div>
        </>
    )
}
export default NoRecordsAvailable;