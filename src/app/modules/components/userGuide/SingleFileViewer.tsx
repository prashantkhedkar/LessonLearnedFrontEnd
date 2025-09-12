import { useState } from "react";
import { Col, Container, Modal, Row } from "react-bootstrap";
import { useIntl } from "react-intl";

import css from "./UserGuide.module.css";
import RenderFontAwesome from "../../utils/RenderFontAwesome";


function SingleFileViewer(props: { url: string, isOpen, setIsOpen, title?: string, closeButtonText?: string }) {
    const intl = useIntl();




    function closeModal() {
        props.setIsOpen(false);
    }

    return (
        <>

            <Modal
                show={props.isOpen}
                keyboard={false} backdrop="static"
                dialogClassName={css.dialogClassSingle+" modal-90w"}
            >

                <Container className={css.containerModalHeader}>
                    <Row>
                        <Col className={css.titleCol}>
                            <div className={css.titleText}>
                                {
                                    props.title ? props.title : "دليل المستخدم"
                                }
                            </div>

                        </Col>
                        <Col>
                            <div
                                onClick={closeModal}
                                className={css.modalCloseButton + " float-end"}
                            >
                                <RenderFontAwesome display icon="reject" size="1x" color="#9ca3af" />
                            </div>

                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className={css.theLine} />
                        </Col>

                    </Row>

                </Container>

                <Modal.Body style={{ padding: "0" }}>
                    <Container className={css.containerFrame}>

                        <iframe
                            src={props.url}
                            allowFullScreen
                            className={css.frameDiv}
                        ></iframe>

                    </Container>
                </Modal.Body>

                <Container className={css.containerModalFooter}>
                    <Row>
                        <Col>
                            <div className={css.theLine} />
                            <div style={{ marginBottom: "2rem" }} />
                        </Col>
                    </Row>
                    <Col>
                        <div
                            onClick={closeModal}
                            className={css.modalCloseButton + " float-end"}
                        >

                            <div className={css.closeButtonText}>
                                {
                                    props.closeButtonText ? props.closeButtonText : "اغلاق"
                                }
                            </div>
                        </div>
                    </Col>

                </Container>
                <div style={{ marginBottom: "1rem" }} />
            </Modal>


        </>
    );
}

export default SingleFileViewer;