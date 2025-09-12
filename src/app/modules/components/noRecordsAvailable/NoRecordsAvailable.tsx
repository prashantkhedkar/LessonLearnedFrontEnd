import React from 'react'
import { useIntl } from 'react-intl';


interface prop {
    customText?: string;
    customStyle?: React.CSSProperties;
    className?: string;
}
const NoRecordsAvailable = ({ customText, customStyle, className }: prop) => {
    const intl = useIntl();
    
    return (
        <>
            <div className={"global-no-record-to-display "+ className} style={customStyle}>
                {
                    customText &&
                    customText
                }
                {
                    (!customText || customText.length == 0) &&
                    intl.formatMessage({ id: 'MESSAGE.NORECORDS' })
                }
            </div>
        </>
    )
}

export default NoRecordsAvailable;