import React, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { BtnLabeltxtMedium2 } from "../../modules/components/common/formsLabels/detailLabels";

interface StatusUpdateModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: (remarks: string) => void;
    title: string;
    actionLabel: string;

    requireRemarks?: boolean;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
    show,
    onHide,
    onConfirm,
    title,
    actionLabel,

    requireRemarks = true // Changed default to true since remarks are mandatory
}) => {
    const intl = useIntl();
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showValidationError, setShowValidationError] = useState(false);

    const handleConfirm = async () => {
        // Always require remarks for all actions
        if (!remarks.trim()) {
            setShowValidationError(true);
            return;
        }

        setShowValidationError(false);
        setIsSubmitting(true);
        try {
            await onConfirm(remarks);
            setRemarks('');
            onHide();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setRemarks('');
        setShowValidationError(false);
        onHide();
    };

    const handleRemarksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setRemarks(e.target.value);
        // Clear validation error when user starts typing
        if (showValidationError && e.target.value.trim()) {
            setShowValidationError(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {intl.formatMessage({ id: "LABEL.REMARKS" }) || "Remarks"} <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={remarks}
                            onChange={handleRemarksChange}
                            placeholder={intl.formatMessage({ id: "PLACEHOLDER.REMARKS.REQUIRED" }) || "Enter your remarks... (Required)"}
                            required={true}
                        />
                        {showValidationError && (
                            <Form.Text className="text-danger d-block mt-1">

                                {intl.formatMessage({ id: "VALIDATION.REMARKS.REQUIRED" }) || "Remarks are required for this action."}
                            </Form.Text>
                        )}
                        <Form.Text className="text-muted">
                            {intl.formatMessage({ id: "LABEL.REMARKS.HELP.TEXT" }) || "Please provide detailed remarks."}
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className="d-flex gap-3 justify-content-end">
                <button
                    type="button"
                    className="btn MOD_btn2 btn-cancel stepper-bottom-btn m-0"
                    style={{ minWidth: 120 }}
                    onClick={handleClose}
                    disabled={isSubmitting}
                >
                    <BtnLabeltxtMedium2
                        customClassName="MOD_btn2_Label"
                        isI18nKey={true}
                        text={"BUTTON.CANCEL"}
                    />
                </button>

                <button
                    type="button"
                    className={`btn MOD_btn2 stepper-bottom-btn m-0`}
                    style={{ minWidth: 120 }}
                    onClick={handleConfirm}
                // disabled={isSubmitting || !remarks.trim()}
                >
                    {isSubmitting ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    <BtnLabeltxtMedium2
                        customClassName="MOD_btn2_Label"
                        isI18nKey={false}
                        text={isSubmitting ? (intl.formatMessage({ id: "LABEL.PROCESSING" }) || "Processing...") : actionLabel}
                    />
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default StatusUpdateModal;