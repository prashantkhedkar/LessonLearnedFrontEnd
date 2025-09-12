import { useState } from "react";
import { Col, Container, Modal, Row } from "react-bootstrap";
import { useIntl } from "react-intl";

import css from "./UserGuide.module.css";
import RenderFontAwesome from "../../utils/RenderFontAwesome";
import { UserGuideConfigModel } from "./models";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { toAbsoluteUrl } from "../../../../_metronic/helpers";



function MultiFileViewer(props: { UserGuideList: UserGuideConfigModel[], isOpen, setIsOpen, title?: string, closeButtonText?: string }) {
    const intl = useIntl();
    const lang = useLang();

    const [currentIndex, setCurrentIndex] = useState(0);


    function closeModal() {
        props.setIsOpen(false);
    }

    return (
        <>

            <Modal
                show={props.isOpen}
                keyboard={false} backdrop="static"
                dialogClassName={css.dialogClassMulti + " modal-90w"}
            >

                <Container className={css.containerModalHeader}>
                    <Row>
                        <Col className={css.titleCol}>
                            <div className={css.titleText}>
                                {props.title}
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
                        <Row>
                            <Col className={css.filesListContainer + " col-3"}>

                                {
                                    props.UserGuideList.map((item, index) =>

                                        <>
                                            <Row
                                                className={css.fileRow + " " + (currentIndex == index ? css.fileRowSelected : "")}
                                                onClick={() => setCurrentIndex(index)}
                                            >
                                                <Row>
                                                    <Col className={css.fileIconCol + " col-2 d-flex justify-content-center px-0"}>
                                                        {/* <RenderFontAwesome display size="xl" icon="file" /> */}
                                                        <img src={toAbsoluteUrl(item.Icon)} className='' alt=''/>
                                                    </Col>
                                                    <Col className={css.fileNameCol + " col-10 px-0"}>
                                                        <div className={css.fileText}>
                                                            {lang=="ar"?item.ModuleNameAr:item.ModuleName}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Row>
                                            <Row>
                                                <div className={css.theLineNoMargin} />
                                            </Row>
                                        </>
                                    )
                                }

                            </Col>

                            <Col className="col-9">
                                <iframe
                                    src={props.UserGuideList[currentIndex].URL}
                                    allowFullScreen
                                    className={css.frameDiv}
                                ></iframe>
                            </Col>

                        </Row>



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

export default MultiFileViewer;