import React from 'react'
import { useIntl } from 'react-intl';
import "./auditfield.css";

interface prop {
    createdDate: string;
    updatedDate: string;
}
export default function AuditField({ createdDate, updatedDate }: prop) {
    const intl = useIntl();

    return (
        <div className="d-flex flex-column justify-content-right flex-wrap prjuserFormEditorAuditTimeStamp">
            <span>
                {
                    (createdDate) &&
                    <div>
                        {intl.formatMessage({ id: 'MOD.PROJECTMANAGEMENT.DETAILS.LABEL.CREATED' })}
                        {" "}
                        {createdDate}
                    </div>
                }
            </span>
            <span>
                {
                    (updatedDate) &&
                    <div>
                        {intl.formatMessage({ id: 'MOD.PROJECTMANAGEMENT.DETAILS.LABEL.UPDATED' })}
                        {" "}
                        {updatedDate}
                    </div>
                }
            </span>
        </div>
    )
}
